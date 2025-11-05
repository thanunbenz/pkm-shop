import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getCorsHeaders, getPreflightCorsHeaders } from '@/config/cors';
import {
  checkRateLimit,
  getIdentifierFromRequest,
  getRateLimitConfigForPath,
} from '@/lib/redis/rate-limiter';
import logger from '@/lib/logger';

/**
 * Unified Middleware
 *
 * Handles:
 * 1. CORS (Cross-Origin Resource Sharing)
 * 2. Rate limiting for API routes (Redis-based with fallback)
 * 3. Authentication checks
 * 4. Authorization (role-based access control)
 * 5. API versioning headers
 *
 * Related Issues:
 * - Issue #64: Merge duplicate middleware files
 * - Issue #76: Redis Rate Limiter Migration
 * - Issue #78: API Versioning Strategy
 * - Issue #79: CORS Configuration
 */
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const origin = request.headers.get('origin');

  // ============================================================
  // 1. CORS HEADERS (for API routes)
  // ============================================================
  let response = NextResponse.next();

  // Handle preflight OPTIONS requests for CORS
  if (request.method === 'OPTIONS' && pathname.startsWith('/api')) {
    const preflightHeaders = getPreflightCorsHeaders(origin);
    return new NextResponse(null, {
      status: 204,
      headers: preflightHeaders,
    });
  }

  // Add CORS headers to API responses
  if (pathname.startsWith('/api')) {
    const corsHeaders = getCorsHeaders(origin);
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }

  // ============================================================
  // 2. API VERSIONING HEADERS
  // ============================================================
  // Add API version headers for /api/v1 routes
  if (pathname.startsWith('/api/v1')) {
    response.headers.set('X-API-Version', 'v1');
    response.headers.set('X-API-Deprecated', 'false');
    // response.headers.set('X-API-Sunset-Date', ''); // Add when deprecating
  }

  // ============================================================
  // 3. RATE LIMITING (Redis-based with in-memory fallback)
  // ============================================================
  if (pathname.startsWith('/api')) {
    // Get authentication token for user-based rate limiting
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const userId = token?.sub as string | undefined;

    // Get identifier (user ID or IP address)
    const identifier = getIdentifierFromRequest(request, userId);

    // Get rate limit configuration for this path
    const rateLimitConfig = getRateLimitConfigForPath(pathname);

    try {
      // Check rate limit (uses Redis if available, falls back to in-memory)
      const rateLimitResult = await checkRateLimit(identifier, rateLimitConfig);

      // Add rate limit headers to response
      response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString());
      response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
      response.headers.set('X-RateLimit-Reset', rateLimitResult.reset.toString());

      // Rate limit exceeded
      if (!rateLimitResult.success) {
        logger.warn('Rate limit exceeded', {
          identifier,
          path: pathname,
          limit: rateLimitResult.limit,
          remaining: rateLimitResult.remaining,
        });

        const corsHeaders = getCorsHeaders(origin);
        return new NextResponse(
          JSON.stringify({
            success: false,
            error: 'Rate limit exceeded. Please try again later.',
            retryAfter: rateLimitResult.retryAfter || rateLimitResult.reset,
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'X-RateLimit-Limit': rateLimitResult.limit.toString(),
              'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
              'X-RateLimit-Reset': rateLimitResult.reset.toString(),
              'Retry-After': (rateLimitResult.retryAfter || rateLimitResult.reset).toString(),
              ...corsHeaders,
            },
          }
        );
      }

      // Rate limit check passed
      logger.debug('Rate limit check passed', {
        identifier,
        path: pathname,
        remaining: rateLimitResult.remaining,
      });
    } catch (error) {
      // Rate limiting error - log but allow request to proceed
      logger.error('Rate limit check error:', error);

      // Add warning header
      response.headers.set('X-RateLimit-Warning', 'Rate limit check failed');
    }
  }

  // ============================================================
  // 4. AUTHENTICATION & AUTHORIZATION (for protected routes)
  // ============================================================

  // Note: Token may have already been fetched for rate limiting above
  // We need to fetch it again here for non-API routes
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  // Redirect invalid URL patterns
  if (pathname.startsWith("/%")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If user is logged in
  if (token) {
    // Redirect authenticated users away from auth pages
    if (
      pathname.startsWith("/login") ||
      pathname.startsWith("/register")
    ) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Check STAFF role (OPERATOR or ADMIN) for dashboard access
    if (pathname.startsWith("/dashboard")) {
      const isStaff = token.role === "OPERATOR" || token.role === "ADMIN";

      if (!isStaff) {
        // Regular users cannot access dashboard
        return NextResponse.redirect(new URL("/", request.url));
      }

      // ADMIN-only routes (settings)
      const adminOnlyRoutes = [
        "/dashboard/settings",
        "/dashboard/roles",
        "/dashboard/system",
      ];

      const isAdminRoute = adminOnlyRoutes.some(route =>
        pathname.startsWith(route)
      );

      if (isAdminRoute && token.role !== "ADMIN") {
        // OPERATOR cannot access ADMIN-only routes
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  } else {
    // If user is NOT logged in and trying to access protected routes
    if (pathname.startsWith("/dashboard")) {
      const url = new URL("/login", request.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    // API routes (for rate limiting)
    '/api/:path*',
    // Auth pages (redirect if logged in)
    '/login',
    '/register',
    // Protected routes (require auth)
    '/dashboard/:path*',
    // Invalid URL patterns
    '/%:path*',
  ],
};
