/**
 * Swagger/OpenAPI Specification Endpoint
 *
 * Serves the OpenAPI 3.0 specification as JSON for Swagger UI.
 *
 * Related: Issue #85 - Missing API Documentation
 */

import { NextResponse } from "next/server";
import { openApiSpec } from "@/lib/swagger/openapi-spec";

/**
 * GET /api/swagger
 *
 * Returns the OpenAPI 3.0 specification in JSON format.
 * Used by Swagger UI to generate interactive API documentation.
 */
export async function GET() {
  return NextResponse.json(openApiSpec, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600", // Cache for 1 hour
    },
  });
}
