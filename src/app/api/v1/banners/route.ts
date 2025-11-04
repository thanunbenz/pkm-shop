import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { hasStaffAccess, getUnauthorizedError } from "@/lib/utils/auth-helpers";
import { bannerCreateSchema } from "@/lib/validations/banner";
import { ZodError } from "zod";
import logger from "@/lib/logger";
import { formatZodIssues } from "@/types/validation";
import { publicRateLimiter, adminRateLimiter, getClientIp, createRateLimitHeaders } from "@/lib/rateLimit";

// GET - ดึงรายการ banners (Public: แค่ active, Admin: ทั้งหมด)
export async function GET(request: NextRequest) {
    try {
        // ✅ Rate limiting for banners list (public endpoint - generous limit)
        const clientIp = getClientIp(request);
        const rateLimitResult = await publicRateLimiter.check(`banners-get:${clientIp}`);

        if (!rateLimitResult.success) {
            return NextResponse.json(
                { success: false, error: "Too many requests. Please try again later." },
                {
                    status: 429,
                    headers: createRateLimitHeaders(100, 0, rateLimitResult.resetTime),
                }
            );
        }

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
        logger.error("Error fetching banners:", {
            error: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined
        });
        return NextResponse.json(
            { success: false, error: "Failed to fetch banners" },
            { status: 500 }
        );
    }
}

// POST - สร้าง banner ใหม่ (ADMIN/OPERATOR only)
export async function POST(request: NextRequest) {
    try {
        // ✅ Rate limiting for banner creation (admin only - strict)
        const clientIp = getClientIp(request);
        const rateLimitResult = await adminRateLimiter.check(`banners-post:${clientIp}`);

        if (!rateLimitResult.success) {
            return NextResponse.json(
                { success: false, error: "Too many requests. Please try again later." },
                {
                    status: 429,
                    headers: createRateLimitHeaders(30, 0, rateLimitResult.resetTime),
                }
            );
        }

        const session = await getServerSession(authOptions);

        if (!hasStaffAccess(session)) {
            return NextResponse.json(
                { success: false, ...getUnauthorizedError("OPERATOR or ADMIN") },
                { status: 401 }
            );
        }

        const body = await request.json();

        // Validate input with Zod
        const validatedData = bannerCreateSchema.parse(body);

        const banner = await prisma.banner.create({
            data: {
                title: validatedData.title,
                description: validatedData.description || null,
                image: validatedData.image,
                imageId: validatedData.imageId || null,
                link: validatedData.link || null,
                isActive: validatedData.isActive,
                order: validatedData.order,
            }
        });

        return NextResponse.json({ success: true, data: banner }, { status: 201 });
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

        logger.error("Error creating banner:", {
            error: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined
        });
        return NextResponse.json(
            { success: false, error: "Failed to create banner" },
            { status: 500 }
        );
    }
}
