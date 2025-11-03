import rateLimit from 'next-rate-limit';
import { NextRequest, NextResponse } from 'next/server';

// Create rate limiter instance
const limiter = rateLimit({
  interval: 60 * 1000, // 60 seconds
  uniqueTokenPerInterval: 500, // Max 500 users per interval
});

// General API rate limit: 30 requests per minute
export const apiRateLimit = (request: NextRequest): NextResponse | null => {
  try {
    const headers = limiter.checkNext(request, 30);

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
    const headers = limiter.checkNext(request, 5);

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
    const headers = limiter.checkNext(request, 10);

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
