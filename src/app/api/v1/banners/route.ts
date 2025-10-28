import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { hasStaffAccess, getUnauthorizedError } from "@/lib/utils/auth-helpers";

// GET - ดึงรายการ banners (Public: แค่ active, Admin: ทั้งหมด)
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const isAdmin = hasStaffAccess(session);

        // รับ query parameters สำหรับ pagination
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;

        const whereCondition = isAdmin ? {} : { isActive: true };

        // นับจำนวนทั้งหมด
        const total = await prisma.banner.count({
            where: whereCondition
        });

        // ดึงข้อมูลตาม pagination
        const banners = await prisma.banner.findMany({
            where: whereCondition,
            orderBy: [
                { order: 'asc' },
                { createdAt: 'desc' }
            ],
            skip,
            take: limit
        });

        return NextResponse.json({
            success: true,
            data: banners,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error("Error fetching banners:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch banners" },
            { status: 500 }
        );
    }
}

// POST - สร้าง banner ใหม่ (ADMIN/OPERATOR only)
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!hasStaffAccess(session)) {
            return NextResponse.json(
                { success: false, ...getUnauthorizedError("OPERATOR or ADMIN") },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { title, description, image, imageId, link, isActive, order } = body;

        // Validation
        if (!title || !image) {
            return NextResponse.json(
                { success: false, error: "Title and image are required" },
                { status: 400 }
            );
        }

        const banner = await prisma.banner.create({
            data: {
                title,
                description: description || null,
                image,
                imageId: imageId || null,
                link: link || null,
                isActive: isActive !== undefined ? isActive : true,
                order: order || 0,
            }
        });

        return NextResponse.json({ success: true, data: banner }, { status: 201 });
    } catch (error) {
        console.error("Error creating banner:", error);
        return NextResponse.json(
            { success: false, error: "Failed to create banner" },
            { status: 500 }
        );
    }
}
