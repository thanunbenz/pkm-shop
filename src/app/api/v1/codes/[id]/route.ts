import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/authOptions";
import { hasStaffAccess, getUnauthorizedError } from "@/lib/utils/auth-helpers";
import { codeUpdateSchema } from "@/lib/validations/code";
import { ZodError } from "zod";
import logger from "@/lib/logger";
import { parseIntSafe } from "@/lib/utils/parse";

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

        // Validate and parse ID safely
        const codeId = parseIntSafe(id, "Code ID");

        // Delete code
        const deletedCode = await prisma.code.delete({
            where: { id: codeId },
        });

        return NextResponse.json({
            success: true,
            data: deletedCode,
        });
    } catch (error) {
        logger.error("Error deleting code:", {
            error: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
            codeId: params.id,
        });
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : "Failed to delete code" },
            { status: error instanceof Error && error.message.includes("must be") ? 400 : 500 }
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

        // Validate and parse ID safely
        const codeId = parseIntSafe(id, "Code ID");

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

        logger.error("Error updating code:", {
            error: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
            codeId: params.id,
        });
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : "Failed to update code" },
            { status: error instanceof Error && error.message.includes("must be") ? 400 : 500 }
        );
    }
}
