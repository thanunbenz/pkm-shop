/**
 * Forgot Password API Endpoint
 *
 * POST /api/v1/auth/forgot-password
 * Sends password reset email with token
 *
 * Related: Forgot Password Feature
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";
import crypto from "crypto";
import logger from "@/lib/logger";
import {
  successResponse,
  errorResponse,
} from "@/lib/utils/api-response";
import { validationErrorResponse } from "@/lib/utils/validation-error";
import { sendPasswordResetEmail } from "@/lib/email";

/**
 * Validation schema for forgot password request
 */
const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "กรุณากรอกอีเมล")
    .email("รูปแบบอีเมลไม่ถูกต้อง")
    .toLowerCase()
    .trim(),
});

/**
 * POST /api/v1/auth/forgot-password
 * Request password reset email
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Parse and validate request body
    const body = await request.json();

    const validation = forgotPasswordSchema.safeParse(body);

    if (!validation.success) {
      logger.warn("Forgot password validation failed", {
        errors: validation.error.issues,
      });

      return validationErrorResponse(validation.error);
    }

    const { email } = validation.data;

    // 2. Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        fname: true,
        lname: true,
      },
    });

    // Security: Always return success even if user doesn't exist
    // This prevents email enumeration attacks
    if (!user) {
      logger.info("Password reset requested for non-existent email", {
        email,
      });

      // Return success to prevent email enumeration
      return successResponse(
        {
          message: "ถ้าอีเมลนี้มีอยู่ในระบบ เราจะส่งลิงก์รีเซ็ตรหัสผ่านไปให้",
        },
        "ส่งลิงก์รีเซ็ตรหัสผ่านสำเร็จ"
      );
    }

    // 3. Generate password reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Token expires in 1 hour
    const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

    // 4. Save hashed token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: hashedToken,
        resetTokenExpiry: tokenExpiry,
      },
    });

    // 5. Create reset URL
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password/${resetToken}`;

    // 6. Send password reset email
    let emailResult;
    try {
      emailResult = await sendPasswordResetEmail({
        to: user.email,
        customerName: user.fname,
        resetUrl,
        expiresIn: "1 ชั่วโมง",
      });

      logger.info("Email send attempt completed", {
        success: emailResult?.success,
        hasMessageId: !!emailResult?.messageId,
        hasError: !!emailResult?.error,
      });
    } catch (emailError) {
      logger.error("Exception during email send", {
        error: emailError instanceof Error ? emailError.message : "Unknown error",
        stack: emailError instanceof Error ? emailError.stack : undefined,
        userId: user.id,
      });

      // Still return success to prevent information leakage
      return successResponse(
        {
          message:
            "เกิดข้อผิดพลาดในการส่งอีเมล กรุณาลองใหม่อีกครั้งภายหลัง",
        },
        "เกิดข้อผิดพลาดในการส่งอีเมล"
      );
    }

    // Check if email was sent successfully
    if (!emailResult?.success) {
      // Log email error but don't fail the request
      logger.error("Failed to send password reset email", {
        error: emailResult?.error || "Unknown error",
        userId: user.id,
        email: user.email,
      });

      // Still return success to prevent information leakage
      return successResponse(
        {
          message:
            "เกิดข้อผิดพลาดในการส่งอีเมล กรุณาลองใหม่อีกครั้งภายหลัง",
        },
        "เกิดข้อผิดพลาดในการส่งอีเมล"
      );
    }

    logger.info("Password reset email sent successfully", {
      userId: user.id,
      email: user.email,
      tokenExpiry: tokenExpiry.toISOString(),
      messageId: emailResult.messageId,
    });

    // 7. Return success response
    return successResponse(
      {
        message: "ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว",
        email: user.email, // Safe to return since user initiated the request
      },
      "ส่งลิงก์รีเซ็ตรหัสผ่านสำเร็จ"
    );
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return validationErrorResponse(error);
    }

    // Log unexpected errors with full details
    logger.error("Unexpected error during forgot password request", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      errorType: error?.constructor?.name,
      errorDetails: JSON.stringify(error, Object.getOwnPropertyNames(error)),
    });

    return errorResponse(
      "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
      500,
      undefined,
      "INTERNAL_ERROR"
    );
  }
}
