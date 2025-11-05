/**
 * Change Password API Endpoint
 *
 * POST /api/v1/users/change-password
 * Allows authenticated users to change their password
 *
 * Related: Issue #62 - Change Password in User Profile
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import logger from "@/lib/logger";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  validationErrorResponse,
} from "@/lib/utils/api-response";
import { formatZodError } from "@/lib/utils/validation-error";

/**
 * Validation schema for password change
 */
const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "กรุณาใส่รหัสผ่านปัจจุบัน"),
    newPassword: z
      .string()
      .min(8, "รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร")
      .max(100, "รหัสผ่านใหม่ต้องไม่เกิน 100 ตัวอักษร")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "รหัสผ่านต้องประกอบด้วยตัวพิมพ์เล็ก ตัวพิมพ์ใหญ่ และตัวเลข"
      ),
    confirmPassword: z.string().min(1, "กรุณายืนยันรหัสผ่านใหม่"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "รหัสผ่านใหม่ต้องแตกต่างจากรหัสผ่านปัจจุบัน",
    path: ["newPassword"],
  });

/**
 * POST /api/v1/users/change-password
 * Change user password
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Check authentication
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      logger.warn("Unauthorized password change attempt");
      return unauthorizedResponse("กรุณาเข้าสู่ระบบเพื่อเปลี่ยนรหัสผ่าน");
    }

    const userId = parseInt(session.user.id);

    // 2. Parse and validate request body
    const body = await request.json();

    const validation = changePasswordSchema.safeParse(body);

    if (!validation.success) {
      logger.warn("Password change validation failed", {
        userId,
        errors: validation.error.errors,
      });

      const formattedErrors = formatZodError(validation.error);
      return validationErrorResponse(formattedErrors);
    }

    const { currentPassword, newPassword } = validation.data;

    // 3. Get user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fname: true,
        lname: true,
        password: true,
      },
    });

    if (!user) {
      logger.error("User not found during password change", { userId });
      return errorResponse("ไม่พบข้อมูลผู้ใช้", 404);
    }

    // 4. Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      logger.warn("Invalid current password during password change", {
        userId,
        email: user.email,
      });

      return errorResponse(
        "รหัสผ่านปัจจุบันไม่ถูกต้อง",
        400,
        "INVALID_PASSWORD"
      );
    }

    // 5. Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // 6. Update password in database
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        updatedAt: new Date(),
      },
    });

    // 7. Log password change for audit
    logger.info("Password changed successfully", {
      userId,
      email: user.email,
      timestamp: new Date().toISOString(),
    });

    // 8. TODO: Send email notification (Issue #62)
    // await sendPasswordChangedEmail(user.email, user.fname);

    // 9. Return success response
    return successResponse(
      {
        message: "เปลี่ยนรหัสผ่านสำเร็จ",
        timestamp: new Date().toISOString(),
      },
      "เปลี่ยนรหัสผ่านสำเร็จแล้ว กรุณาใช้รหัสผ่านใหม่ในการเข้าสู่ระบบครั้งถัดไป"
    );
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      const formattedErrors = formatZodError(error);
      return validationErrorResponse(formattedErrors);
    }

    // Log unexpected errors
    logger.error("Unexpected error during password change", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    return errorResponse(
      "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน กรุณาลองใหม่อีกครั้ง",
      500,
      "INTERNAL_ERROR"
    );
  }
}
