import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/authOptions";
import { hasStaffAccess, getUnauthorizedError } from "@/lib/utils/auth-helpers";
import { getResourceAuditLogs } from "@/lib/utils/audit-logger";
import logger from "@/lib/logger";
import { adminRateLimiter, getClientIp, createRateLimitHeaders } from "@/lib/rateLimit";

/**
 * GET /api/v1/audit-logs/resource
 *
 * Get audit logs for a specific resource
 * Query parameters:
 * - resource: Resource type (required) - e.g., "Product", "Code", "Purchase"
 * - resourceId: Resource ID (required) - e.g., "123"
 * - limit: Number of results (default: 50, max: 100)
 */
export async function GET(request: NextRequest) {
  try {
    // ✅ Rate limiting
    const clientIp = getClientIp(request);
    const rateLimitResult = await adminRateLimiter.check(`audit-resource:${clientIp}`);

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

    const resource = searchParams.get("resource");
    const resourceId = searchParams.get("resourceId");

    if (!resource || !resourceId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required parameters: resource and resourceId",
        },
        { status: 400 }
      );
    }

    const limit = Math.min(
      parseInt(searchParams.get("limit") || "50"),
      100
    );

    // Fetch audit logs for resource
    const logs = await getResourceAuditLogs(resource, resourceId, limit);

    return NextResponse.json({
      success: true,
      data: {
        resource,
        resourceId,
        logs,
        count: logs.length,
      },
    });
  } catch (error) {
    logger.error("Error fetching resource audit logs:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      { success: false, error: "Failed to fetch resource audit logs" },
      { status: 500 }
    );
  }
}
