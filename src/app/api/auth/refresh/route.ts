import { NextRequest, NextResponse } from "next/server";
import { rotateRefreshToken } from "@/lib/utils/refresh-token";
import { sign } from "jsonwebtoken";

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("NEXTAUTH_SECRET is not defined in environment variables");
}

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 *
 * Request body:
 * {
 *   "refreshToken": "the-refresh-token-string"
 * }
 *
 * Response:
 * {
 *   "accessToken": "new-jwt-access-token",
 *   "refreshToken": "new-refresh-token",
 *   "user": {
 *     "id": 1,
 *     "email": "user@example.com",
 *     "fname": "John",
 *     "lname": "Doe",
 *     "role": "USER"
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json(
        { error: "Refresh token is required" },
        { status: 400 }
      );
    }

    // Validate and rotate the refresh token
    const newRefreshToken = await rotateRefreshToken(refreshToken);

    if (!newRefreshToken) {
      return NextResponse.json(
        { error: "Invalid or expired refresh token" },
        { status: 401 }
      );
    }

    // Generate new JWT access token
    const accessToken = sign(
      {
        id: String(newRefreshToken.user.id),
        email: newRefreshToken.user.email,
        fname: newRefreshToken.user.fname,
        lname: newRefreshToken.user.lname,
        role: newRefreshToken.user.role,
      },
      process.env.NEXTAUTH_SECRET,
      {
        expiresIn: "24h", // Access token expires in 24 hours
      }
    );

    return NextResponse.json(
      {
        accessToken,
        refreshToken: newRefreshToken.token,
        user: {
          id: newRefreshToken.user.id,
          email: newRefreshToken.user.email,
          fname: newRefreshToken.user.fname,
          lname: newRefreshToken.user.lname,
          role: newRefreshToken.user.role,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error refreshing token:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
