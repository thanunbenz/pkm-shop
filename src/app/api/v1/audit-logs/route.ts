import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/authOptions";
import { hasStaffAccess, getUnauthorizedError } from "@/lib/utils/auth-helpers";
import { getAuditLogs, getAuditStats, AuditAction } from "@/lib/utils/audit-logger";
import logger from "@/lib/logger";
import { adminRateLimiter, getClientIp, createRateLimitHeaders } from "@/lib/rateLimit";

/**
 * GET /api/v1/audit-logs
 *
 * Retrieve audit logs with filtering and pagination
 * Query parameters:
 * - userId: Filter by user ID
 * - action: Filter by action type (CREATE, UPDATE, DELETE, etc.)
 * - resource: Filter by resource type (Product, Code, Purchase, etc.)
 * - resourceId: Filter by specific resource ID
 * - startDate: Filter by start date (ISO 8601 format)
 * - endDate: Filter by end date (ISO 8601 format)
 * - limit: Number of results per page (default: 50, max: 100)
 * - offset: Pagination offset (default: 0)
 */
export async function GET(request: NextRequest) {
  try {
    // ✅ Rate limiting
    const clientIp = getClientIp(request);
    const rateLimitResult = await adminRateLimiter.check(`audit-logs:${clientIp}`);

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

    const userId = searchParams.get("userId")
      ? parseInt(searchParams.get("userId")!)
      : undefined;

    const action = searchParams.get("action") as AuditAction | undefined;

    const resource = searchParams.get("resource") || undefined;

    const resourceId = searchParams.get("resourceId") || undefined;

    const startDate = searchParams.get("startDate")
      ? new Date(searchParams.get("startDate")!)
      : undefined;

    const endDate = searchParams.get("endDate")
      ? new Date(searchParams.get("endDate")!)
      : undefined;

    const limit = Math.min(
      parseInt(searchParams.get("limit") || "50"),
      100
    );

    const offset = parseInt(searchParams.get("offset") || "0");

    // Fetch audit logs
    const { logs, total } = await getAuditLogs({
      userId,
      action,
      resource,
      resourceId,
      startDate,
      endDate,
      limit,
      offset,
    });

    return NextResponse.json({
      success: true,
      data: {
        logs,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + logs.length < total,
        },
      },
    });
  } catch (error) {
    logger.error("Error fetching audit logs:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      { success: false, error: "Failed to fetch audit logs" },
      { status: 500 }
    );
  }
}
