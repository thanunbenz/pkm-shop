import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/authOptions";
import { hasStaffAccess, getUnauthorizedError } from "@/lib/utils/auth-helpers";
import { codeUpdateSchema } from "@/lib/validations/code";
import { ZodError } from "zod";
import logger from "@/lib/logger";
import { parseIntSafe } from "@/lib/utils/parse";
import { formatZodIssues } from "@/types/validation";
import { Prisma } from "@prisma/client";
import { logUpdate, logDelete, getClientIp } from "@/lib/utils/audit-logger";

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

        // Get code before deleting for audit log
        const existingCode = await prisma.code.findUnique({
            where: { id: codeId },
        });

        if (!existingCode) {
            return NextResponse.json(
                { success: false, error: "Code not found" },
                { status: 404 }
            );
        }

        // Delete code
        const deletedCode = await prisma.code.delete({
            where: { id: codeId },
        });

        // ✅ Audit log: Code deleted
        await logDelete(
            session.user.id!,
            'Code',
            deletedCode.id.toString(),
            `Deleted code: ${deletedCode.code} from product ID: ${deletedCode.productId}`,
            {
                code: deletedCode.code,
                productId: deletedCode.productId,
                isUsed: deletedCode.isUsed,
            },
            getClientIp(request),
            request.headers.get('user-agent') || undefined
        );

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

        // Validate and parse ID safely
        const codeId = parseIntSafe(id, "Code ID");

        // Get existing code for audit log
        const existingCode = await prisma.code.findUnique({
            where: { id: codeId },
        });

        if (!existingCode) {
            return NextResponse.json(
                { success: false, error: "Code not found" },
                { status: 404 }
            );
        }

        // Validate input with Zod (whitelist fields)
        const validatedData = codeUpdateSchema.parse(body);

        // Only update fields that are provided
        const updateData: Prisma.CodeUpdateInput = {};
        const changes: Record<string, any> = {};

        if (validatedData.code !== undefined && validatedData.code !== existingCode.code) {
            updateData.code = validatedData.code;
            changes.code = { old: existingCode.code, new: validatedData.code };
        }
        if (validatedData.isUsed !== undefined && validatedData.isUsed !== existingCode.isUsed) {
            updateData.isUsed = validatedData.isUsed;
            changes.isUsed = { old: existingCode.isUsed, new: validatedData.isUsed };
        }
        if (validatedData.productId !== undefined && validatedData.productId !== existingCode.productId) {
            updateData.product = {
                connect: { id: validatedData.productId }
            };
            changes.productId = { old: existingCode.productId, new: validatedData.productId };
        }

        // Update code
        const updatedCode = await prisma.code.update({
            where: { id: codeId },
            data: updateData,
        });

        // ✅ Audit log: Code updated
        await logUpdate(
            session.user.id!,
            'Code',
            updatedCode.id.toString(),
            `Updated code: ${updatedCode.code}`,
            { changes },
            getClientIp(request),
            request.headers.get('user-agent') || undefined
        );

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
                    details: formatZodIssues(error.issues)
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
            { success: false, error: "Failed to update code" },
            { status: 500 }
        );
    }
}
