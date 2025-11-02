import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { hasStaffAccess, getUnauthorizedError } from "@/lib/utils/auth-helpers";
import { bannerUpdateSchema } from "@/lib/validations/banner";
import { ZodError } from "zod";
import logger from "@/lib/logger";

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
        logger.error("Error fetching banner:", {
            error: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
            bannerId: params.id,
        });
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

        // Validate input with Zod
        const validatedData = bannerUpdateSchema.parse(body);

        // Only update fields that are provided
        const updateData: any = {};
        if (validatedData.title !== undefined) updateData.title = validatedData.title;
        if (validatedData.description !== undefined) updateData.description = validatedData.description;
        if (validatedData.image !== undefined) updateData.image = validatedData.image;
        if (validatedData.imageId !== undefined) updateData.imageId = validatedData.imageId;
        if (validatedData.link !== undefined) updateData.link = validatedData.link;
        if (validatedData.isActive !== undefined) updateData.isActive = validatedData.isActive;
        if (validatedData.order !== undefined) updateData.order = validatedData.order;

        const banner = await prisma.banner.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json({ success: true, data: banner });
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

        logger.error("Error updating banner:", {
            error: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
            bannerId: params.id,
        });
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

        // Get banner first to retrieve imageId
        const bannerToDelete = await prisma.banner.findUnique({
            where: { id }
        });

        if (!bannerToDelete) {
            return NextResponse.json(
                { success: false, error: "Banner not found" },
                { status: 404 }
            );
        }

        logger.info(`Deleting banner ${id} with imageId: ${bannerToDelete.imageId}`);

        // Delete the banner
        const banner = await prisma.banner.delete({
            where: { id }
        });

        // Delete associated image if exists
        if (bannerToDelete.imageId && bannerToDelete.imageId !== "-") {
            logger.info(`Calling DELETE /api/v1/upload/${bannerToDelete.imageId}`);
            try {
                const deleteResponse = await fetch(`${request.nextUrl.origin}/api/v1/upload/${bannerToDelete.imageId}`, {
                    method: "DELETE",
                    headers: {
                        cookie: request.headers.get("cookie") || "",
                    },
                });
                const deleteResult = await deleteResponse.json();
                logger.info(`Image deletion result:`, deleteResult);
            } catch (imageError) {
                logger.error("Failed to delete banner image:", {
                    error: imageError instanceof Error ? imageError.message : "Unknown error",
                    bannerId: id,
                    imageId: bannerToDelete.imageId,
                });
                // Continue even if image deletion fails
            }
        } else {
            logger.info(`No image to delete (imageId: ${bannerToDelete.imageId})`);
        }

        return NextResponse.json({
            success: true,
            data: banner,
            imageId: banner.imageId
        });
    } catch (error) {
        logger.error("Error deleting banner:", {
            error: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
            bannerId: params.id,
        });
        return NextResponse.json(
            { success: false, error: "Failed to delete banner" },
            { status: 500 }
        );
    }
}
