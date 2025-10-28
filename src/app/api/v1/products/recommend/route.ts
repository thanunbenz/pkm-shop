import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET - ดึงรายการ recommended products (Public)
export async function GET() {
    try {
        const products = await prisma.product.findMany({
            where: {
                isrecommend: true
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
        console.error("Error fetching recommended products:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch recommended products" },
            { status: 500 }
        );
    }
}
