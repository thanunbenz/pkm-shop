/**
 * Verify Reset Token API Endpoint
 *
 * GET /api/v1/auth/verify-reset-token/[token]
 * Verifies if password reset token is valid
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import crypto from "crypto";
import logger from "@/lib/logger";
import { successResponse, errorResponse } from "@/lib/utils/api-response";

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

    if (!token) {
      return errorResponse("Token is required", 400, "INVALID_TOKEN");
    }

    // Hash the token to compare with database
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user with this token
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
      },
    });

    if (!user) {
      logger.warn("Invalid or expired reset token", { token: hashedToken });
      return errorResponse(
        "ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว",
        400,
        "INVALID_TOKEN"
      );
    }

    // Token is valid
    return successResponse(
      {
        valid: true,
        email: user.email,
      },
      "Token is valid"
    );
  } catch (error) {
    logger.error("Token verification error", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    return errorResponse(
      "เกิดข้อผิดพลาดในการตรวจสอบลิงก์",
      500,
      "INTERNAL_ERROR"
    );
  }
}
