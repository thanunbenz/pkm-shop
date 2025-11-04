import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/authOptions";
import { hasStaffAccess, getUnauthorizedError } from "@/lib/utils/auth-helpers";
import { getAuditStats } from "@/lib/utils/audit-logger";
import logger from "@/lib/logger";
import { adminRateLimiter, getClientIp, createRateLimitHeaders } from "@/lib/rateLimit";

/**
 * GET /api/v1/audit-logs/stats
 *
 * Get audit log statistics
 * Query parameters:
 * - startDate: Filter by start date (ISO 8601 format)
 * - endDate: Filter by end date (ISO 8601 format)
 */
export async function GET(request: NextRequest) {
  try {
    // ✅ Rate limiting
    const clientIp = getClientIp(request);
    const rateLimitResult = await adminRateLimiter.check(`audit-stats:${clientIp}`);

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

    // ✅ Require STAFF access
    if (!hasStaffAccess(session)) {
      return NextResponse.json(
        { success: false, ...getUnauthorizedError("OPERATOR or ADMIN") },
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);

    const startDate = searchParams.get("startDate")
      ? new Date(searchParams.get("startDate")!)
      : undefined;

    const endDate = searchParams.get("endDate")
      ? new Date(searchParams.get("endDate")!)
      : undefined;

    // Fetch statistics
    const stats = await getAuditStats(startDate, endDate);

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error("Error fetching audit log statistics:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      { success: false, error: "Failed to fetch audit statistics" },
      { status: 500 }
    );
  }
}
