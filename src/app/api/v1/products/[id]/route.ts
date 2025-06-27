import { NextRequest, NextResponse } from "next/server";
import { deleteProduct, getProductById, updateProduct } from "@/app/(main-dashboard)/services/productServices";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const { id } = await params;
    const product = await getProductById(id);
    return NextResponse.json(product);
}


export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    const { id } = await params;
    const ProductJson = await request.json() as Prisma.ProductUpdateInput;
    console.log("id: " , id)
    console.log("ProductJson: " , ProductJson)
    const product = await updateProduct(id, ProductJson);
    return NextResponse.json(product);
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    const { id } = await params;
    const product = await deleteProduct(id);
    return NextResponse.json(product);
}


