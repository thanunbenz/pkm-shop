import { createProduct, getProducts } from "@/app/(main-dashboard)/services/productServices";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    try {
        const Product = await getProducts();
        return NextResponse.json({
            data: Product
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch products. Please try again later.',
            },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    const ProductJson = await req.json() as Prisma.ProductCreateInput;

    const newData = await createProduct(ProductJson);
    return NextResponse.json({
        message: "Record created successfully",
        data: newData
    }, { status: 201 });
}

