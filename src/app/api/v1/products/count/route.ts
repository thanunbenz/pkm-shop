import { getCountProduct } from "@/features/products/services/productServices";
import { NextResponse } from "next/server";
import logger from "@/lib/logger";

export async function GET() {
    try {
        const count = await getCountProduct();
        return NextResponse.json({ count });
    } catch (error) {
        logger.error("Failed to fetch product count:", {
            error: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined
        });
        return NextResponse.json({ error: "Failed to fetch product count" }, { status: 400 });
    }
}
