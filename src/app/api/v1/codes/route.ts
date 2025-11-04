import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/authOptions";
import { hasStaffAccess, getUnauthorizedError } from "@/lib/utils/auth-helpers";
import { codeCreateSchema } from "@/lib/validations/code";
import { ZodError } from "zod";
import logger from "@/lib/logger";
import { formatZodIssues } from "@/types/validation";
import { adminRateLimiter, getClientIp, createRateLimitHeaders } from "@/lib/rateLimit";
import { logCreate, getClientIp as getAuditClientIp } from "@/lib/utils/audit-logger";

export async function POST(request: NextRequest) {
    try {
        // ✅ Rate limiting for admin code creation
        const clientIp = getClientIp(request);
        const rateLimitResult = await adminRateLimiter.check(`codes-post:${clientIp}`);

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

        // ✅ Allow OPERATOR and ADMIN
        if (!hasStaffAccess(session)) {
            return NextResponse.json(
                { success: false, ...getUnauthorizedError("OPERATOR or ADMIN") },
                { status: 401 }
            );
        }

        const body = await request.json();

        // Validate input with Zod
        const validatedData = codeCreateSchema.parse(body);

        // Check if code already exists
        const existingCode = await prisma.code.findFirst({
            where: { code: validatedData.code.trim() }
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
                code: validatedData.code.trim(),
                productId: validatedData.productId,
                isUsed: validatedData.isUsed,
            },
        });

        // ✅ Audit log: Code created
        await logCreate(
            session.user.id!,
            'Code',
            newCode.id.toString(),
            `Created code: ${newCode.code} for product ID: ${newCode.productId}`,
            {
                code: newCode.code,
                productId: newCode.productId,
                isUsed: newCode.isUsed,
            },
            getAuditClientIp(request),
            request.headers.get('user-agent') || undefined
        );

        return NextResponse.json(
            { success: true, data: newCode },
            { status: 201 }
        );
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

        logger.error("Error creating code:", {
            error: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined
        });
        return NextResponse.json(
            { success: false, error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
