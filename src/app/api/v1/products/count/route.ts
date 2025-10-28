import { getCountProduct } from "@/features/products/services/productServices";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const count = await getCountProduct();
        return NextResponse.json({ count });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Failed to fetch product count" }, { status: 400 });
    }
}
