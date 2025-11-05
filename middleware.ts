import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import rateLimit from 'next-rate-limit';
import { RATE_LIMITS, RATE_LIMITER_CONFIG } from '@/config/app-constants';
import { getCorsHeaders, getPreflightCorsHeaders } from '@/config/cors';

// Create rate limiter instance
const limiter = rateLimit({
  interval: RATE_LIMITER_CONFIG.INTERVAL,
  uniqueTokenPerInterval: RATE_LIMITER_CONFIG.UNIQUE_TOKEN_PER_INTERVAL,
});

// Helper function to get client IP
function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

// Rate limiting configuration for different routes
const rateLimits: Record<string, number> = {
  '/api/auth': RATE_LIMITS.AUTH,
  '/api/v1/register': RATE_LIMITS.REGISTER,
  '/api/v1/upload': RATE_LIMITS.UPLOAD,
  '/api/v1': RATE_LIMITS.GENERAL_API,
};

/**
 * Unified Middleware
 *
 * Handles:
 * 1. CORS (Cross-Origin Resource Sharing)
 * 2. Rate limiting for API routes
 * 3. Authentication checks
 * 4. Authorization (role-based access control)
 * 5. API versioning headers
 *
 * Related Issues:
 * - Issue #64: Merge duplicate middleware files
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
  // 3. RATE LIMITING (for API routes)
  // ============================================================
  if (pathname.startsWith('/api')) {
    const ip = getClientIp(request);

    // Find the most specific rate limit for this path
    let limit: number = RATE_LIMITS.GENERAL_API; // Default limit
    for (const [path, pathLimit] of Object.entries(rateLimits)) {
      if (pathname.startsWith(path)) {
        limit = pathLimit;
        break;
      }
    }

    try {
      const headers = limiter.checkNext(request, limit);

      const remaining = headers.get('X-RateLimit-Remaining');
      if (remaining && parseInt(remaining) < 0) {
        const corsHeaders = getCorsHeaders(origin);
        return new NextResponse(
          JSON.stringify({
            success: false,
            error: 'Rate limit exceeded. Please try again later.',
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': RATE_LIMITER_CONFIG.RETRY_AFTER,
              ...corsHeaders,
            },
          }
        );
      }
    } catch {
      const corsHeaders = getCorsHeaders(origin);
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: 'Rate limit exceeded. Please try again later.',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': RATE_LIMITER_CONFIG.RETRY_AFTER,
            ...corsHeaders,
          },
        }
      );
    }
  }

  // ============================================================
  // 4. AUTHENTICATION & AUTHORIZATION (for protected routes)
  // ============================================================

  // Get authentication token
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
