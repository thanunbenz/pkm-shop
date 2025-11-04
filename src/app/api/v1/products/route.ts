import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/authOptions";
import { hasStaffAccess, getUnauthorizedError } from "@/lib/utils/auth-helpers";
import { UPLOAD_CONFIG } from "@/config/constants";
import logger from "@/lib/logger";
import { Prisma } from "@prisma/client";
import { z } from "zod";

// Try to import Zod schemas
let productQuerySchema: z.ZodSchema | null = null;
let validationErrorResponse: ((error: z.ZodError) => NextResponse) | null = null;
let isZodError: ((error: unknown) => error is z.ZodError) | null = null;

try {
    const validations = require("@/lib/validations");
    const validationError = require("@/lib/utils/validation-error");
    productQuerySchema = validations.productQuerySchema;
    validationErrorResponse = validationError.validationErrorResponse;
    isZodError = validationError.isZodError;
} catch (error) {
    logger.info("Zod not installed, using simplified query handling");
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

        if (productQuerySchema && validationErrorResponse) {
            // Use Zod validation if available
            const queryParams = Object.fromEntries(searchParams);
            const validationResult = productQuerySchema.safeParse(queryParams);

            if (!validationResult.success) {
                return validationErrorResponse(validationResult.error);
            }

            const data = validationResult.data as {
                page: number;
                limit: number;
                category?: string;
                issale?: boolean;
                isrecommend?: boolean;
                search?: string;
                sortBy: string;
                order: "asc" | "desc";
            };
            ({ page, limit, category, issale, isrecommend, search, sortBy, order } = data);
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
        const where: Prisma.ProductWhereInput = {};
        if (category) where.category = category as Prisma.ProductWhereInput['category'];
        // Only filter if explicitly true (not false)
        if (issale === true) where.issale = true;
        if (isrecommend === true) where.isrecommend = true;
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
        logger.error("Error fetching products:", {
            error: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined
        });

        if (isZodError && validationErrorResponse && isZodError(error)) {
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
        const discountprice = parseFloat(formData.get("discountprice") as string) || 0;
        const issale = formData.get("issale") === "true";
        const isrecommend = formData.get("isrecommend") === "true";
        const categoryInput = formData.get("category") as string;
        const category = (categoryInput === "PACK" || categoryInput === "BOX" || categoryInput === "PROMO")
          ? categoryInput as "PACK" | "BOX" | "PROMO"
          : "PACK";
        const image = formData.get("image") as File;

        if (!name || !description || !price) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        if (image && !UPLOAD_CONFIG.ALLOWED_FILE_TYPES.includes(image.type as any)) {
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
                discountprice,
                issale,
                isrecommend,
                category,
                image: image ? image.name : null,
            },
        });

        return NextResponse.json(product);
    } catch (error) {
        logger.error("Error creating product:", {
            error: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined
        });
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

