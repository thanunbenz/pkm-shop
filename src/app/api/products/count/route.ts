import { getCountProduct } from "@/app/(main-dashboard)/services/productServices";
import { NextResponse } from "next/dist/server/web/spec-extension/response";

export async function GET() {
    try {
        const count = await getCountProduct();
        return NextResponse.json({ count });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Failed to fetch product count" }, { status: 400 });
    }
}

