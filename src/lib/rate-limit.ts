import rateLimit from 'next-rate-limit';
import { NextRequest, NextResponse } from 'next/server';
import { RATE_LIMITS, RATE_LIMITER_CONFIG } from '@/config/app-constants';

// Create rate limiter instance
const limiter = rateLimit({
  interval: RATE_LIMITER_CONFIG.INTERVAL,
  uniqueTokenPerInterval: RATE_LIMITER_CONFIG.UNIQUE_TOKEN_PER_INTERVAL,
});

// General API rate limit: 30 requests per minute
export const apiRateLimit = (request: NextRequest): NextResponse | null => {
  try {
    const headers = limiter.checkNext(request, RATE_LIMITS.GENERAL_API);

    // If rate limit exceeded, checkNext throws or returns headers with X-RateLimit-Remaining: 0
    const remaining = headers.get('X-RateLimit-Remaining');
    if (remaining && parseInt(remaining) < 0) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429, headers }
      );
    }

    return null;
  } catch {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please try again later.' },
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// Strict rate limit for auth endpoints: 5 requests per minute
export const authRateLimit = (request: NextRequest): NextResponse | null => {
  try {
    const headers = limiter.checkNext(request, RATE_LIMITS.AUTH);

    const remaining = headers.get('X-RateLimit-Remaining');
    if (remaining && parseInt(remaining) < 0) {
      return NextResponse.json(
        { error: 'Too many authentication attempts. Please try again later.' },
        { status: 429, headers }
      );
    }

    return null;
  } catch {
    return NextResponse.json(
      { error: 'Too many authentication attempts. Please try again later.' },
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// Upload rate limit: 10 requests per minute
export const uploadRateLimit = (request: NextRequest): NextResponse | null => {
  try {
    const headers = limiter.checkNext(request, RATE_LIMITS.UPLOAD);

    const remaining = headers.get('X-RateLimit-Remaining');
    if (remaining && parseInt(remaining) < 0) {
      return NextResponse.json(
        { error: 'Upload rate limit exceeded. Please try again later.' },
        { status: 429, headers }
      );
    }

    return null;
  } catch {
    return NextResponse.json(
      { error: 'Upload rate limit exceeded. Please try again later.' },
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
