import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/authOptions";
import { hasStaffAccess, getUnauthorizedError } from "@/lib/utils/auth-helpers";

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

        const body = await request.json();
        const { code, productId, isUsed } = body;

        // Validation
        if (!code || !productId) {
            return NextResponse.json(
                { success: false, error: "Code and productId are required" },
                { status: 400 }
            );
        }

        // Check if code already exists
        const existingCode = await prisma.code.findFirst({
            where: { code: code.trim() }
        });

        if (existingCode) {
            return NextResponse.json(
                { success: false, error: "Code already exists" },
                { status: 400 }
            );
        }

        // Create code
        const newCode = await prisma.code.create({
            data: {
                code: code.trim(),
                productId: parseInt(productId),
                isUsed: isUsed || false,
            },
        });

        return NextResponse.json(
            { success: true, data: newCode },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating code:", error);
        return NextResponse.json(
            { success: false, error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
