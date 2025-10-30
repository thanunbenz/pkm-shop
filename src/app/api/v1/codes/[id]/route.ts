import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/authOptions";
import { hasStaffAccess, getUnauthorizedError } from "@/lib/utils/auth-helpers";

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

        // Delete code
        const deletedCode = await prisma.code.delete({
            where: { id: parseInt(id) },
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

        // Update code
        const updatedCode = await prisma.code.update({
            where: { id: parseInt(id) },
            data: body,
        });

        return NextResponse.json({
            success: true,
            data: updatedCode,
        });
    } catch (error) {
        console.error("Error updating code:", error);
        return NextResponse.json(
            { success: false, error: "Failed to update code" },
            { status: 500 }
        );
    }
}
