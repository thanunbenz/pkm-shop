import { NextRequest, NextResponse } from "next/server";
import { deleteProduct, getProductById, updateProduct } from "@/features/products/services/productServices";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { hasStaffAccess, getUnauthorizedError } from "@/lib/utils/auth-helpers";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = await params;
        const product = await getProductById(id);

        if (!product) {
            return NextResponse.json(
                { success: false, error: "Product not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: product });
    } catch (error) {
        console.error("Error fetching product:", error);
        return NextResponse.json(
            { success: false, error: "Internal Server Error" },
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
        const ProductJson = await request.json() as Prisma.ProductUpdateInput;

        const product = await updateProduct(id, ProductJson);
        return NextResponse.json({ success: true, data: product });
    } catch (error) {
        console.error("Error updating product:", error);
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
        const product = await deleteProduct(id);

        return NextResponse.json({
            success: true,
            data: product,
            imageId: product.imageId
        });
    } catch (error) {
        console.error("Error deleting product:", error);
        return NextResponse.json(
            { error: "Failed to delete product" },
            { status: 500 }
        );
    }
}


