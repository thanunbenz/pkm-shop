import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/authOptions";
import prisma from "@/lib/db";
import { updateProfileSchema } from "@/lib/validations/user";
import { ZodError } from "zod";
import logger from "@/lib/logger";
import { formatZodIssues } from "@/types/validation";
import { writeRateLimiter, getClientIp, createRateLimitHeaders } from "@/lib/rateLimit";
import { logUpdate, getClientIp as getAuditClientIp } from "@/lib/utils/audit-logger";
import bcrypt from "bcryptjs";

/**
 * GET /api/v1/users/profile
 *
 * Get current user's profile information
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "กรุณาเข้าสู่ระบบ" },
        { status: 401 }
      );
    }

    // Fetch user profile
    const user = await prisma.user.findUnique({
      where: { id: Number(session.user.id) },
      select: {
        id: true,
        fname: true,
        lname: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "ไม่พบข้อมูลผู้ใช้" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    logger.error("Error fetching user profile:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการดึงข้อมูล" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/v1/users/profile
 *
 * Update current user's profile (name and/or email)
 *
 * Body:
 * - fname: string (optional) - First name
 * - lname: string (optional) - Last name
 * - email: string (optional) - Email address
 * - currentPassword: string (required if changing email) - Current password for verification
 */
export async function PUT(request: NextRequest) {
  try {
    // ✅ Rate limiting for profile updates
    const clientIp = getClientIp(request);
    const rateLimitResult = await writeRateLimiter.check(`profile-update:${clientIp}`);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: "คำขอมากเกินไป กรุณาลองใหม่อีกครั้งในภายหลัง" },
        {
          status: 429,
          headers: createRateLimitHeaders(20, 0, rateLimitResult.resetTime),
        }
      );
    }

    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "กรุณาเข้าสู่ระบบ" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate input with Zod
    const validatedData = updateProfileSchema.parse(body);

    // Get current user data
    const currentUser = await prisma.user.findUnique({
      where: { id: Number(session.user.id) },
      select: {
        id: true,
        fname: true,
        lname: true,
        email: true,
        password: true,
      },
    });

    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: "ไม่พบข้อมูลผู้ใช้" },
        { status: 404 }
      );
    }

    // Track changes for audit log
    const changes: Record<string, any> = {};
    const updateData: any = {};

    // Check if email is being changed
    if (validatedData.email && validatedData.email !== currentUser.email) {
      // ✅ Require password verification for email changes
      if (!body.currentPassword) {
        return NextResponse.json(
          {
            success: false,
            error: "กรุณาใส่รหัสผ่านปัจจุบันเพื่อยืนยันการเปลี่ยนอีเมล",
          },
          { status: 400 }
        );
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(
        body.currentPassword,
        currentUser.password || ""
      );

      if (!isPasswordValid) {
        return NextResponse.json(
          { success: false, error: "รหัสผ่านไม่ถูกต้อง" },
          { status: 401 }
        );
      }

      // Check if new email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: validatedData.email },
      });

      if (existingUser && existingUser.id !== currentUser.id) {
        return NextResponse.json(
          { success: false, error: "อีเมลนี้ถูกใช้งานแล้ว" },
          { status: 400 }
        );
      }

      updateData.email = validatedData.email;
      changes.email = { old: currentUser.email, new: validatedData.email };
    }

    // Update name fields
    if (validatedData.fname && validatedData.fname !== currentUser.fname) {
      updateData.fname = validatedData.fname;
      changes.fname = { old: currentUser.fname, new: validatedData.fname };
    }

    if (validatedData.lname && validatedData.lname !== currentUser.lname) {
      updateData.lname = validatedData.lname;
      changes.lname = { old: currentUser.lname, new: validatedData.lname };
    }

    // Check if there are any changes
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: "ไม่มีข้อมูลที่ต้องการแก้ไข" },
        { status: 400 }
      );
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: Number(session.user.id) },
      data: updateData,
      select: {
        id: true,
        fname: true,
        lname: true,
        email: true,
        role: true,
      },
    });

    // ✅ Audit log: Profile updated
    await logUpdate(
      session.user.id,
      "User",
      session.user.id.toString(),
      `Updated profile: ${Object.keys(changes).join(", ")}`,
      { changes },
      getAuditClientIp(request),
      request.headers.get("user-agent") || undefined
    );

    logger.info("User profile updated", {
      userId: session.user.id,
      changes: Object.keys(changes),
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: "อัพเดทข้อมูลสำเร็จ",
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "ข้อมูลไม่ถูกต้อง",
          details: formatZodIssues(error.issues),
        },
        { status: 400 }
      );
    }

    logger.error("Error updating user profile:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการอัพเดทข้อมูล" },
      { status: 500 }
    );
  }
}
