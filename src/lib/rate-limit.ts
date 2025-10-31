import rateLimit from 'next-rate-limit';

// Create rate limiter instance
const limiter = rateLimit({
  interval: 60 * 1000, // 60 seconds
  uniqueTokenPerInterval: 500, // Max 500 users per interval
});

// General API rate limit: 30 requests per minute
export const apiRateLimit = async (request: Request) => {
  const ip = request.headers.get('x-forwarded-for') ||
             request.headers.get('x-real-ip') ||
             'unknown';

  try {
    await limiter.check(30, ip); // 30 requests per minute
    return null;
  } catch {
    return new Response(
      JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
      {
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};

// Strict rate limit for auth endpoints: 5 requests per minute
export const authRateLimit = async (request: Request) => {
  const ip = request.headers.get('x-forwarded-for') ||
             request.headers.get('x-real-ip') ||
             'unknown';

  try {
    await limiter.check(5, ip); // 5 requests per minute
    return null;
  } catch {
    return new Response(
      JSON.stringify({ error: 'Too many authentication attempts. Please try again later.' }),
      {
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};

// Upload rate limit: 10 requests per minute
export const uploadRateLimit = async (request: Request) => {
  const ip = request.headers.get('x-forwarded-for') ||
             request.headers.get('x-real-ip') ||
             'unknown';

  try {
    await limiter.check(10, ip); // 10 requests per minute
    return null;
  } catch {
    return new Response(
      JSON.stringify({ error: 'Upload rate limit exceeded. Please try again later.' }),
      {
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
