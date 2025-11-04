import { NextRequest, NextResponse } from "next/server";
import { deleteProduct, getProductById, updateProduct } from "@/features/products/services/productServices";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { hasStaffAccess, getUnauthorizedError } from "@/lib/utils/auth-helpers";
import { updateProductSchema } from "@/lib/validations/product";
import logger from "@/lib/logger";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = await params;

        // Validate ID
        if (!id || isNaN(parseInt(id))) {
            return NextResponse.json(
                { success: false, error: "Invalid product ID" },
                { status: 400 }
            );
        }

        const product = await getProductById(id);

        if (!product) {
            return NextResponse.json(
                { success: false, error: "Product not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: product });
    } catch (error) {
        logger.error("Error fetching product:", {
            productId: params.id,
            error: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined
        });
        return NextResponse.json(
            { success: false, error: "Failed to fetch product" },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);

        // ✅ Allow OPERATOR and ADMIN
        if (!hasStaffAccess(session)) {
            return NextResponse.json(
                { success: false, ...getUnauthorizedError("OPERATOR or ADMIN") },
                { status: 401 }
            );
        }

        const { id } = await params;
        const body = await request.json();

        // Validate input with Zod schema
        const validationResult = updateProductSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Validation failed",
                    details: validationResult.error.issues
                },
                { status: 400 }
            );
        }

        const product = await updateProduct(id, validationResult.data as Prisma.ProductUpdateInput);
        return NextResponse.json({ success: true, data: product });
    } catch (error) {
        logger.error("Error updating product:", {
            error: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined
        });
        return NextResponse.json(
            { error: "Failed to update product" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);

        // ✅ Allow OPERATOR and ADMIN
        if (!hasStaffAccess(session)) {
            return NextResponse.json(
                { success: false, ...getUnauthorizedError("OPERATOR or ADMIN") },
                { status: 401 }
            );
        }

        const { id } = await params;

        // Get product first to retrieve imageId
        const productToDelete = await getProductById(id);
        if (!productToDelete) {
            return NextResponse.json(
                { success: false, error: "Product not found" },
                { status: 404 }
            );
        }

        logger.info("Deleting product:", {
            productId: id,
            imageId: productToDelete.imageId
        });

        // Delete the product
        const product = await deleteProduct(id);

        // Delete associated image if exists
        if (productToDelete.imageId && productToDelete.imageId !== "-") {
            logger.info("Calling DELETE for product image:", {
                imageId: productToDelete.imageId
            });
            try {
                const deleteResponse = await fetch(`${request.nextUrl.origin}/api/v1/upload/${productToDelete.imageId}`, {
                    method: "DELETE",
                    headers: {
                        cookie: request.headers.get("cookie") || "",
                    },
                });
                const deleteResult = await deleteResponse.json();
                logger.info("Image deletion result:", { result: deleteResult });
            } catch (imageError) {
                logger.error("Failed to delete product image:", {
                    error: imageError instanceof Error ? imageError.message : "Unknown error",
                    stack: imageError instanceof Error ? imageError.stack : undefined
                });
                // Continue even if image deletion fails
            }
        } else {
            logger.info("No image to delete:", {
                imageId: productToDelete.imageId
            });
        }

        return NextResponse.json({
            success: true,
            data: product,
            imageId: product.imageId
        });
    } catch (error) {
        logger.error("Error deleting product:", {
            error: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined
        });
        return NextResponse.json(
            { error: "Failed to delete product" },
            { status: 500 }
        );
    }
}


