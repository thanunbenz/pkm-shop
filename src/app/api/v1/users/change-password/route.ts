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
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";
import { z, ZodError } from "zod";
import logger from "@/lib/logger";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
} from "@/lib/utils/api-response";
import { formatZodError, validationErrorResponse } from "@/lib/utils/validation-error";
import { sendPasswordChangedEmail } from "@/lib/email";

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
        errors: validation.error.issues,
      });

      return validationErrorResponse(validation.error);
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
    const changeDate = new Date();
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        updatedAt: changeDate,
      },
    });

    // 7. Log password change for audit
    logger.info("Password changed successfully", {
      userId,
      email: user.email,
      timestamp: changeDate.toISOString(),
    });

    // 8. Get client IP address (for email notification)
    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      undefined;

    // 9. Send email notification
    try {
      await sendPasswordChangedEmail({
        to: user.email,
        customerName: user.fname,
        changeDate,
        ipAddress,
      });

      logger.info("Password change notification email sent", {
        userId,
        email: user.email,
      });
    } catch (emailError) {
      // Don't fail the password change if email fails
      logger.error("Failed to send password change notification email", {
        error:
          emailError instanceof Error ? emailError.message : "Unknown error",
        userId,
        email: user.email,
      });
    }

    // 10. Return success response with logout flag
    // The client will handle logging out the user
    return successResponse(
      {
        message: "เปลี่ยนรหัสผ่านสำเร็จ",
        timestamp: changeDate.toISOString(),
        requireReLogin: true, // Signal to client that re-login is needed
      },
      "เปลี่ยนรหัสผ่านสำเร็จแล้ว กรุณาเข้าสู่ระบบใหม่อีกครั้งด้วยรหัสผ่านใหม่"
    );
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      return validationErrorResponse(error);
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
