import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/authOptions";
import { hasStaffAccess, getUnauthorizedError } from "@/lib/utils/auth-helpers";

// Try to import Zod schemas
let productQuerySchema: any = null;
let validationErrorResponse: any = null;
let isZodError: any = null;

try {
    const validations = require("@/lib/validations");
    const validationError = require("@/lib/utils/validation-error");
    productQuerySchema = validations.productQuerySchema;
    validationErrorResponse = validationError.validationErrorResponse;
    isZodError = validationError.isZodError;
} catch (error) {
    console.log("Zod not installed, using simplified query handling");
}

// Add caching configuration
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        // ✅ Allow OPERATOR and ADMIN
        if (!hasStaffAccess(session)) {
            return NextResponse.json(
                { success: false, ...getUnauthorizedError("OPERATOR or ADMIN") },
                { status: 401 }
            );
        }

        // Parse query parameters
        const { searchParams } = new URL(request.url);

        let page = 1;
        let limit = 10;
        let category: string | undefined;
        let issale: boolean | undefined;
        let isrecommend: boolean | undefined;
        let search: string | undefined;
        let sortBy = "createdAt";
        let order: "asc" | "desc" = "desc";

        if (productQuerySchema) {
            // Use Zod validation if available
            const queryParams = Object.fromEntries(searchParams);
            const validationResult = productQuerySchema.safeParse(queryParams);

            if (!validationResult.success) {
                return validationErrorResponse(validationResult.error);
            }

            ({ page, limit, category, issale, isrecommend, search, sortBy, order } = validationResult.data);
        } else {
            // Manual parsing as fallback
            page = parseInt(searchParams.get("page") || "1");
            limit = parseInt(searchParams.get("limit") || "10");
            category = searchParams.get("category") || undefined;
            issale = searchParams.get("issale") === "true" ? true : undefined;
            isrecommend = searchParams.get("isrecommend") === "true" ? true : undefined;
            search = searchParams.get("search") || undefined;
            sortBy = searchParams.get("sortBy") || "createdAt";
            order = (searchParams.get("order") as "asc" | "desc") || "desc";
        }

        // Build where clause
        const where: any = {};
        if (category) where.category = category;
        if (issale !== undefined) where.issale = issale;
        if (isrecommend !== undefined) where.isrecommend = isrecommend;
        if (search) {
            where.OR = [
                { name: { contains: search } },
                { description: { contains: search } },
            ];
        }

        // Get total count
        const total = await prisma.product.count({ where });

        // Get products
        const products = await prisma.product.findMany({
            where,
            include: {
                code: true, // Include codes relation
            },
            orderBy: {
                [sortBy]: order,
            },
            skip: (page - 1) * limit,
            take: limit,
        });

        return NextResponse.json(
            {
                success: true,
                data: products,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            },
            {
                headers: {
                    'Cache-Control': 'no-store, max-age=0',
                },
            }
        );
    } catch (error) {
        console.error("Error fetching products:", error);

        if (isZodError && isZodError(error)) {
            return validationErrorResponse(error);
        }

        return NextResponse.json(
            { success: false, error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        // ✅ Allow OPERATOR and ADMIN
        if (!hasStaffAccess(session)) {
            return NextResponse.json(
                { success: false, ...getUnauthorizedError("OPERATOR or ADMIN") },
                { status: 401 }
            );
        }

        const formData = await request.formData();
        const name = formData.get("name") as string;
        const description = formData.get("description") as string;
        const price = parseFloat(formData.get("price") as string);
        const stock = parseInt(formData.get("stock") as string);
        const image = formData.get("image") as File;

        if (!name || !description || !price || !stock) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        if (image && !UPLOAD_CONFIG.ALLOWED_FILE_TYPES.includes(image.type)) {
            return NextResponse.json(
                { error: "Invalid file type" },
                { status: 400 }
            );
        }

        if (image && image.size > UPLOAD_CONFIG.MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: "File size too large" },
                { status: 400 }
            );
        }

        const product = await prisma.product.create({
            data: {
                name,
                description,
                price,
                stock,
                image: image ? image.name : null,
            },
        });

        return NextResponse.json(product);
    } catch (error) {
        console.error("Error creating product:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

