import { randomBytes } from "crypto";
import prisma from "@/lib/db";
import logger from "@/lib/logger";

// Refresh token expiration: 30 days
const REFRESH_TOKEN_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

/**
 * Generate a cryptographically secure random refresh token
 */
export function generateTokenString(): string {
  return randomBytes(64).toString("hex");
}

/**
 * Create a new refresh token for a user
 * @param userId - The ID of the user
 * @returns The refresh token object
 */
export async function createRefreshToken(userId: number) {
  const token = generateTokenString();
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY);

  const refreshToken = await prisma.refreshToken.create({
    data: {
      token,
      userId,
      expiresAt,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          fname: true,
          lname: true,
          role: true,
        },
      },
    },
  });

  return refreshToken;
}

/**
 * Validate a refresh token
 * @param token - The refresh token string
 * @returns The refresh token object if valid, null otherwise
 */
export async function validateRefreshToken(token: string) {
  try {
    const refreshToken = await prisma.refreshToken.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fname: true,
            lname: true,
            role: true,
          },
        },
      },
    });

    if (!refreshToken) {
      return null;
    }

    // Check if token is expired
    if (refreshToken.expiresAt < new Date()) {
      // Delete expired token
      await prisma.refreshToken.delete({
        where: { id: refreshToken.id },
      });
      return null;
    }

    return refreshToken;
  } catch (error) {
    logger.error("Failed to validate refresh token", {
      error: error instanceof Error ? error.message : "Unknown error",
      tokenPreview: token.substring(0, 10) + "...",
    });
    return null;
  }
}

/**
 * Rotate a refresh token (delete old one and create new one)
 * @param oldToken - The old refresh token string
 * @returns The new refresh token object or null if old token is invalid
 */
export async function rotateRefreshToken(oldToken: string) {
  const oldRefreshToken = await validateRefreshToken(oldToken);

  if (!oldRefreshToken) {
    return null;
  }

  // Delete old token
  await prisma.refreshToken.delete({
    where: { id: oldRefreshToken.id },
  });

  // Create new token
  const newRefreshToken = await createRefreshToken(oldRefreshToken.userId);

  return newRefreshToken;
}

/**
 * Revoke a refresh token (delete it)
 * @param token - The refresh token string to revoke
 * @returns true if token was revoked, false otherwise
 */
export async function revokeRefreshToken(token: string) {
  try {
    await prisma.refreshToken.delete({
      where: { token },
    });
    return true;
  } catch (error) {
    logger.error("Failed to revoke refresh token", {
      error: error instanceof Error ? error.message : "Unknown error",
      tokenPreview: token.substring(0, 10) + "...",
    });
    return false;
  }
}

/**
 * Revoke all refresh tokens for a user
 * @param userId - The ID of the user
 * @returns The number of tokens revoked
 */
export async function revokeAllUserRefreshTokens(userId: number) {
  try {
    const result = await prisma.refreshToken.deleteMany({
      where: { userId },
    });
    return result.count;
  } catch (error) {
    logger.error("Failed to revoke all user refresh tokens", {
      error: error instanceof Error ? error.message : "Unknown error",
      userId,
    });
    return 0;
  }
}

/**
 * Clean up expired refresh tokens
 * @returns The number of tokens deleted
 */
export async function cleanupExpiredTokens() {
  try {
    const result = await prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
    return result.count;
  } catch (error) {
    logger.error("Failed to cleanup expired refresh tokens", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return 0;
  }
}
