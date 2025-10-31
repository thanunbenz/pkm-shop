import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/authOptions";
import { hasStaffAccess, getUnauthorizedError } from "@/lib/utils/auth-helpers";
import { codeUpdateSchema } from "@/lib/validations/code";
import { ZodError } from "zod";

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

        // Validate parseInt
        const codeId = parseInt(id);
        if (isNaN(codeId)) {
            return NextResponse.json(
                { success: false, error: "Invalid code ID format" },
                { status: 400 }
            );
        }

        // Delete code
        const deletedCode = await prisma.code.delete({
            where: { id: codeId },
        });

        return NextResponse.json({
            success: true,
            data: deletedCode,
        });
    } catch (error) {
        console.error("Error deleting code:", error);
        return NextResponse.json(
            { success: false, error: "Failed to delete code" },
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

        // Validate parseInt
        const codeId = parseInt(id);
        if (isNaN(codeId)) {
            return NextResponse.json(
                { success: false, error: "Invalid code ID format" },
                { status: 400 }
            );
        }

        // Validate input with Zod (whitelist fields)
        const validatedData = codeUpdateSchema.parse(body);

        // Only update fields that are provided
        const updateData: any = {};
        if (validatedData.code !== undefined) updateData.code = validatedData.code;
        if (validatedData.isUsed !== undefined) updateData.isUsed = validatedData.isUsed;
        if (validatedData.productId !== undefined) updateData.productId = validatedData.productId;

        // Update code
        const updatedCode = await prisma.code.update({
            where: { id: codeId },
            data: updateData,
        });

        return NextResponse.json({
            success: true,
            data: updatedCode,
        });
    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json(
                {
                    success: false,
                    error: "ข้อมูลไม่ถูกต้อง",
                    details: error.issues.map((e: any) => ({
                        field: e.path.join('.'),
                        message: e.message
                    }))
                },
                { status: 400 }
            );
        }

        console.error("Error updating code:", error);
        return NextResponse.json(
            { success: false, error: "Failed to update code" },
            { status: 500 }
        );
    }
}
