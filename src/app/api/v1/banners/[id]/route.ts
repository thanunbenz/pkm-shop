import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { hasStaffAccess, getUnauthorizedError } from "@/lib/utils/auth-helpers";

// GET - ดึงข้อมูล banner ตาม ID
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = await params;
        const banner = await prisma.banner.findUnique({
            where: { id }
        });

        if (!banner) {
            return NextResponse.json(
                { success: false, error: "Banner not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: banner });
    } catch (error) {
        console.error("Error fetching banner:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch banner" },
            { status: 500 }
        );
    }
}

// PUT - อัปเดต banner
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!hasStaffAccess(session)) {
            return NextResponse.json(
                { success: false, ...getUnauthorizedError("OPERATOR or ADMIN") },
                { status: 401 }
            );
        }

        const { id } = await params;
        const body = await request.json();
        const { title, description, image, imageId, link, isActive, order } = body;

        const banner = await prisma.banner.update({
            where: { id },
            data: {
                title,
                description,
                image,
                imageId,
                link,
                isActive,
                order,
            }
        });

        return NextResponse.json({ success: true, data: banner });
    } catch (error) {
        console.error("Error updating banner:", error);
        return NextResponse.json(
            { success: false, error: "Failed to update banner" },
            { status: 500 }
        );
    }
}

// DELETE - ลบ banner
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!hasStaffAccess(session)) {
            return NextResponse.json(
                { success: false, ...getUnauthorizedError("OPERATOR or ADMIN") },
                { status: 401 }
            );
        }

        const { id } = await params;

        const banner = await prisma.banner.delete({
            where: { id }
        });

        return NextResponse.json({
            success: true,
            data: banner,
            imageId: banner.imageId
        });
    } catch (error) {
        console.error("Error deleting banner:", error);
        return NextResponse.json(
            { success: false, error: "Failed to delete banner" },
            { status: 500 }
        );
    }
}
