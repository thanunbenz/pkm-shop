import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import rateLimit from 'next-rate-limit';

// Create rate limiter instance
const limiter = rateLimit({
  interval: 60 * 1000, // 60 seconds
  uniqueTokenPerInterval: 500, // Max 500 users per interval
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
  '/api/auth': 5,           // Auth endpoints: 5 requests per minute
  '/api/v1/register': 3,     // Registration: 3 requests per minute
  '/api/v1/upload': 10,      // Upload endpoints: 10 requests per minute
  '/api/v1': 30,             // General API: 30 requests per minute
};

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Apply rate limiting only to API routes
  if (pathname.startsWith('/api')) {
    const ip = getClientIp(request);

    // Find the most specific rate limit for this path
    let limit = 30; // Default limit
    for (const [path, pathLimit] of Object.entries(rateLimits)) {
      if (pathname.startsWith(path)) {
        limit = pathLimit;
        break;
      }
    }

    try {
      await limiter.check(limit as number, ip);
    } catch {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: 'Rate limit exceeded. Please try again later.',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '60',
          },
        }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
  ],
};
