import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import logger from "@/lib/logger";

// GET - ดึงรายการ recommended products (Public)
export async function GET() {
    try {
        const products = await prisma.product.findMany({
            where: {
                isrecommend: true
            },
            include: {
                code: {
                    select: {
                        id: true,
                        isUsed: true
                    }
                }
            },
            orderBy: [
                { createdAt: 'desc' }
            ],
            take: 10 // จำกัดแค่ 10 รายการ
        });

        return NextResponse.json({
            success: true,
            data: products
        });
    } catch (error) {
        logger.error("Error fetching recommended products:", {
            error: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined
        });
        return NextResponse.json(
            { success: false, error: "Failed to fetch recommended products" },
            { status: 500 }
        );
    }
}
