/**
 * Reset Password API Endpoint
 *
 * POST /api/v1/auth/reset-password
 * Resets user password using valid token
 *
 * Related: Forgot Password Feature
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { z, ZodError } from "zod";
import logger from "@/lib/logger";
import {
  successResponse,
  errorResponse,
} from "@/lib/utils/api-response";
import { validationErrorResponse } from "@/lib/utils/validation-error";

/**
 * Validation schema for password reset
 */
const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token is required"),
    password: z
      .string()
      .min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร")
      .max(100, "รหัสผ่านต้องไม่เกิน 100 ตัวอักษร")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "รหัสผ่านต้องประกอบด้วยตัวพิมพ์เล็ก ตัวพิมพ์ใหญ่ และตัวเลข"
      ),
    confirmPassword: z.string().min(1, "กรุณายืนยันรหัสผ่าน"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน",
    path: ["confirmPassword"],
  });

/**
 * POST /api/v1/auth/reset-password
 * Reset user password
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Parse and validate request body
    const body = await request.json();

    const validation = resetPasswordSchema.safeParse(body);

    if (!validation.success) {
      logger.warn("Password reset validation failed", {
        errors: validation.error.issues,
      });

      return validationErrorResponse(validation.error);
    }

    const { token, password } = validation.data;

    // 2. Hash the token to compare with database
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // 3. Find user with this token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: hashedToken,
        resetTokenExpiry: {
          gt: new Date(), // Token must not be expired
        },
      },
      select: {
        id: true,
        email: true,
        fname: true,
        lname: true,
      },
    });

    if (!user) {
      logger.warn("Invalid or expired reset token during password reset", {
        token: hashedToken,
      });

      return errorResponse(
        "ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว",
        400,
        "INVALID_TOKEN"
      );
    }

    // 4. Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 5. Update user password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
        updatedAt: new Date(),
      },
    });

    // 6. Log successful password reset
    logger.info("Password reset successful", {
      userId: user.id,
      email: user.email,
      timestamp: new Date().toISOString(),
    });

    // 7. Return success response
    return successResponse(
      {
        message: "รีเซ็ตรหัสผ่านสำเร็จ",
        email: user.email,
      },
      "รีเซ็ตรหัสผ่านสำเร็จ กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่"
    );
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      return validationErrorResponse(error);
    }

    // Log unexpected errors
    logger.error("Unexpected error during password reset", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    return errorResponse(
      "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
      500,
      "INTERNAL_ERROR"
    );
  }
}
