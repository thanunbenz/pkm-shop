# Redis Rate Limiter Implementation

**Issue #76: In-Memory Rate Limiter Migration to Redis**

## Overview

PKM Shop now uses Redis-based rate limiting to support horizontal scaling across multiple server instances. The implementation uses a sliding window algorithm for accurate rate limiting and includes graceful fallback to in-memory rate limiting when Redis is unavailable.

## Table of Contents

- [Why Redis Rate Limiting?](#why-redis-rate-limiting)
- [Architecture](#architecture)
- [Setup Instructions](#setup-instructions)
- [Configuration](#configuration)
- [Usage](#usage)
- [Rate Limit Rules](#rate-limit-rules)
- [Testing](#testing)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)
- [Production Deployment](#production-deployment)

---

## Why Redis Rate Limiting?

### Problem with In-Memory Rate Limiting

The previous implementation used `next-rate-limit` with in-memory storage, which had significant limitations:

- **No coordination between instances**: Each server instance tracked its own rate limits independently
- **Ineffective in production**: With load balancing, a user could bypass rate limits by hitting different instances
- **Not horizontally scalable**: Adding more instances made rate limiting less effective
- **Memory inefficient**: Each instance duplicated rate limit storage

### Benefits of Redis Rate Limiting

- ✅ **Distributed**: Shared state across all server instances
- ✅ **Accurate**: True rate limiting regardless of which instance handles the request
- ✅ **Scalable**: Works with any number of server instances
- ✅ **Persistent**: Rate limits survive server restarts
- ✅ **Efficient**: Atomic Redis operations prevent race conditions
- ✅ **Flexible**: Easy to add per-user, per-IP, or combined rate limiting

---

## Architecture

### Components

```
┌─────────────────────────────────────────────────────────────┐
│                      Load Balancer                          │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┴─────────────────────┐
        │                                           │
┌───────▼────────┐                       ┌────────▼──────────┐
│  Instance 1    │                       │  Instance 2       │
│  middleware.ts │                       │  middleware.ts    │
└───────┬────────┘                       └────────┬──────────┘
        │                                         │
        └────────────┬────────────────────────────┘
                     │
        ┌────────────▼────────────────┐
        │  src/lib/redis/             │
        │  - rate-limiter.ts          │
        │  - client.ts                │
        └────────────┬────────────────┘
                     │
        ┌────────────▼────────────────┐
        │  Redis (Upstash/Traditional)│
        │  - Shared rate limit state  │
        └─────────────────────────────┘
```

### Files Structure

```
src/
├── lib/
│   └── redis/
│       ├── client.ts          # Redis client (Upstash/ioredis)
│       └── rate-limiter.ts    # Rate limiting logic
├── config/
│   └── app-constants.ts       # Rate limit configurations
└── middleware.ts              # Rate limiting middleware

.env.example                   # Environment variables
docs/
└── 03-development/
    └── REDIS_RATE_LIMITER.md  # This documentation
```

---

## Setup Instructions

### Option 1: Upstash Redis (Recommended for Vercel/Serverless)

1. **Create Upstash Account**
   - Go to [https://console.upstash.com](https://console.upstash.com)
   - Sign up for free account
   - Create a new Redis database

2. **Get Credentials**
   - Copy "UPSTASH_REDIS_REST_URL"
   - Copy "UPSTASH_REDIS_REST_TOKEN"

3. **Update Environment Variables**
   ```bash
   # .env
   UPSTASH_REDIS_REST_URL="https://your-redis.upstash.io"
   UPSTASH_REDIS_REST_TOKEN="your-token-here"
   ```

4. **Deploy**
   - No package installation needed
   - Works out of the box with Vercel/serverless

### Option 2: Traditional Redis (Self-hosted/Redis Cloud)

1. **Install ioredis Package**
   ```bash
   npm install ioredis
   ```

2. **Set up Redis Server**
   - Local: `docker run -p 6379:6379 redis:latest`
   - Cloud: Use Redis Cloud, AWS ElastiCache, etc.

3. **Update Environment Variables**
   ```bash
   # .env
   REDIS_URL="redis://localhost:6379"
   # Or with authentication:
   # REDIS_URL="redis://username:password@host:port"
   ```

4. **Deploy**
   - Ensure Redis server is accessible from your application

### Option 3: Development Without Redis

For local development without Redis:

```bash
# .env
# Leave Redis variables commented out
# UPSTASH_REDIS_REST_URL=
# REDIS_URL=

# Optional: Enable fallback (default: true)
RATE_LIMIT_FALLBACK="true"
```

⚠️ **Warning**: In-memory fallback is per-instance only! Not suitable for multi-instance production.

---

## Configuration

### Environment Variables

```bash
# Enable/Disable Redis Rate Limiting
ENABLE_REDIS_RATE_LIMIT="true"    # default: true

# Fallback to In-Memory When Redis Unavailable
RATE_LIMIT_FALLBACK="true"        # default: true

# Upstash Redis (Option 1)
UPSTASH_REDIS_REST_URL="https://your-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token-here"

# Traditional Redis (Option 2)
REDIS_URL="redis://localhost:6379"
```

### Rate Limit Rules

Configured in [src/config/app-constants.ts](../../src/config/app-constants.ts):

```typescript
export const RATE_LIMITS = {
  AUTH: 5,           // 5 requests/minute - Login attempts
  REGISTER: 3,       // 3 requests/minute - New registrations
  UPLOAD: 10,        // 10 requests/minute - File uploads
  CHECKOUT: 20,      // 20 requests/minute - Purchase operations
  PROFILE: 20,       // 20 requests/minute - Profile updates
  CART: 30,          // 30 requests/minute - Cart operations
  GENERAL_API: 30,   // 30 requests/minute - Other API endpoints
}
```

### Customizing Rate Limits

Edit [src/config/app-constants.ts](../../src/config/app-constants.ts) to change limits:

```typescript
export const RATE_LIMITS = {
  AUTH: 10,          // Increase login attempts to 10/min
  // ... other limits
}
```

Or add route-specific limits in [src/lib/redis/rate-limiter.ts](../../src/lib/redis/rate-limiter.ts):

```typescript
export function getRateLimitConfigForPath(pathname: string): RateLimitConfig {
  // Add custom route
  if (pathname.includes("/api/v1/custom")) {
    return { limit: 50, windowMs: 60000 };
  }
  // ... existing routes
}
```

---

## Usage

### In Middleware (Automatic)

Rate limiting is automatically applied to all API routes via [middleware.ts](../../middleware.ts):

```typescript
// middleware.ts applies rate limiting to all /api/* routes
export const config = {
  matcher: ['/api/:path*', ...],
}
```

### Manual Rate Limit Check (Advanced)

```typescript
import { checkRateLimit } from '@/lib/redis/rate-limiter';

// In API route
export async function POST(request: Request) {
  // Check rate limit manually
  const result = await checkRateLimit('user:123', {
    limit: 100,
    windowMs: 60000, // 1 minute
  });

  if (!result.success) {
    return new Response('Rate limit exceeded', {
      status: 429,
      headers: {
        'X-RateLimit-Limit': result.limit.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': result.reset.toString(),
        'Retry-After': result.retryAfter?.toString() || '60',
      },
    });
  }

  // Process request...
}
```

### Get Rate Limit Status

```typescript
import { getRateLimitStatus } from '@/lib/redis/rate-limiter';

// Check status without incrementing
const status = await getRateLimitStatus('user:123', {
  limit: 100,
  windowMs: 60000,
});

console.log(`Remaining: ${status.remaining}/${status.limit}`);
console.log(`Resets in: ${status.reset}s`);
```

### Reset Rate Limit

```typescript
import { resetRateLimit } from '@/lib/redis/rate-limiter';

// Useful for testing or manual override
await resetRateLimit('user:123');
```

---

## Rate Limit Rules

### Identifier Strategy

Rate limits are applied based on:

1. **Authenticated Users**: `user:{userId}`
   - More accurate
   - Can't be bypassed with VPN/proxy
   - Recommended for authenticated endpoints

2. **IP Address**: `ip:{ipAddress}`
   - For unauthenticated users
   - Falls back to this if no user session
   - Extracted from headers: `x-forwarded-for`, `x-real-ip`, `cf-connecting-ip`

3. **Anonymous**: `ip:anonymous`
   - Last resort if IP can't be determined
   - Not recommended for production

### Rate Limit Headers

All API responses include rate limit information:

```http
HTTP/1.1 200 OK
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 27
X-RateLimit-Reset: 45
```

When rate limit is exceeded:

```http
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 45
Retry-After: 45
Content-Type: application/json

{
  "success": false,
  "error": "Rate limit exceeded. Please try again later.",
  "retryAfter": 45
}
```

### Per-Route Configuration

| Route Pattern | Limit | Window | Identifier |
|---------------|-------|--------|------------|
| `/api/v1/login` | 5 | 1 min | IP address |
| `/api/v1/register` | 3 | 1 min | IP address |
| `/api/v1/upload/*` | 10 | 1 min | User ID or IP |
| `/api/v1/checkout` | 20 | 1 min | User ID or IP |
| `/api/v1/profile` | 20 | 1 min | User ID |
| `/api/v1/cart/*` | 30 | 1 min | User ID or IP |
| `/api/v1/*` (default) | 30 | 1 min | User ID or IP |

---

## Testing

### Unit Tests

```bash
npm test -- redis-rate-limiter
```

### Manual Testing

#### 1. Test Rate Limiting

```bash
# Test login endpoint (5 requests/min limit)
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/v1/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}' \
    -i
done

# Expected: First 5 succeed, 6th returns 429
```

#### 2. Test Rate Limit Headers

```bash
curl -i http://localhost:3000/api/v1/products

# Check response headers:
# X-RateLimit-Limit: 30
# X-RateLimit-Remaining: 29
# X-RateLimit-Reset: 60
```

#### 3. Test Redis Connection

```bash
# Check logs for Redis initialization
npm run dev | grep -i redis

# Expected output:
# ✅ Upstash Redis client initialized successfully
# or
# ✅ Using traditional Redis (ioredis) for rate limiting
# or
# ⚠️  No Redis connection available
```

#### 4. Test Fallback Mechanism

```bash
# Disable Redis temporarily
ENABLE_REDIS_RATE_LIMIT=false npm run dev

# Make API requests - should use in-memory fallback
curl http://localhost:3000/api/v1/products
```

### Load Testing

```bash
# Install autocannon
npm install -g autocannon

# Test rate limiting under load
autocannon -c 10 -d 10 http://localhost:3000/api/v1/products

# Expected: Should see mix of 200 OK and 429 Too Many Requests
```

---

## Monitoring

### Redis Client Status

```typescript
import { getRedisConfig } from '@/lib/redis/client';

// Get Redis configuration status
const config = getRedisConfig();
console.log('Redis Status:', {
  isInitialized: config.isInitialized,
  isAvailable: config.isAvailable,
  clientType: config.clientType, // 'upstash', 'ioredis', or null
  hasUpstashUrl: config.hasUpstashUrl,
  hasRedisUrl: config.hasRedisUrl,
});
```

### Logs

Rate limiting events are logged automatically:

```typescript
// Successful rate limit check
logger.debug('Rate limit check passed', {
  identifier: 'user:123',
  path: '/api/v1/products',
  remaining: 27,
});

// Rate limit exceeded
logger.warn('Rate limit exceeded', {
  identifier: 'ip:192.168.1.1',
  path: '/api/v1/login',
  limit: 5,
  remaining: 0,
});

// Redis error
logger.error('Redis rate limit error:', error);
```

### Metrics to Track

1. **Rate Limit Hit Rate**
   - % of requests that hit rate limits
   - Track by endpoint

2. **Fallback Usage**
   - How often in-memory fallback is used
   - Indicates Redis availability issues

3. **Response Times**
   - Redis adds ~5-10ms per request
   - Monitor for performance impact

4. **Redis Connection Status**
   - Uptime and availability
   - Connection errors

---

## Troubleshooting

### Issue: Rate limiting not working

**Symptoms**: Users can make unlimited requests

**Solutions**:

1. Check Redis connection:
   ```bash
   # Check logs
   npm run dev | grep -i redis
   ```

2. Verify environment variables:
   ```bash
   # Check .env
   cat .env | grep -E "(UPSTASH|REDIS_URL)"
   ```

3. Test Redis connection manually:
   ```bash
   # Upstash
   curl https://your-redis.upstash.io/get/test \
     -H "Authorization: Bearer your-token"

   # Traditional Redis
   redis-cli -h localhost -p 6379 ping
   ```

### Issue: 429 errors on all requests

**Symptoms**: All API requests return 429 Too Many Requests

**Solutions**:

1. Check rate limit configuration:
   ```typescript
   // src/config/app-constants.ts
   export const RATE_LIMITS = {
     GENERAL_API: 30, // Increase if too low
   }
   ```

2. Reset rate limits:
   ```typescript
   import { resetRateLimit } from '@/lib/redis/rate-limiter';
   await resetRateLimit('user:123');
   ```

3. Clear Redis cache:
   ```bash
   # Traditional Redis
   redis-cli FLUSHDB

   # Upstash
   curl -X POST https://your-redis.upstash.io/flushdb \
     -H "Authorization: Bearer your-token"
   ```

### Issue: Redis connection timeout

**Symptoms**: Slow API responses, timeout errors in logs

**Solutions**:

1. Check Redis server status
2. Verify network connectivity
3. Increase connection timeout:
   ```typescript
   // src/lib/redis/client.ts
   connectTimeout: 10000, // Increase to 10s
   ```

### Issue: Different rate limits per instance

**Symptoms**: Rate limiting inconsistent, depends on which server handles request

**Solutions**:

1. This indicates Redis is NOT being used
2. Check that all instances use same Redis credentials
3. Verify environment variables are set correctly on all instances

### Issue: Memory leak in fallback mode

**Symptoms**: Memory usage grows over time when using in-memory fallback

**Solutions**:

1. Enable Redis to avoid in-memory storage
2. The in-memory cleanup runs every 60 seconds
3. Restart application periodically if Redis is unavailable

---

## Production Deployment

### Pre-deployment Checklist

- [ ] Redis credentials configured
- [ ] Test rate limiting in staging
- [ ] Verify all instances connect to same Redis
- [ ] Configure proper rate limits for production traffic
- [ ] Set up monitoring and alerts
- [ ] Disable fallback for strict rate limiting: `RATE_LIMIT_FALLBACK=false`
- [ ] Test failover behavior when Redis is down
- [ ] Document rate limits in API documentation

### Vercel Deployment

1. **Add Environment Variables**
   - Go to Vercel project settings
   - Add `UPSTASH_REDIS_REST_URL`
   - Add `UPSTASH_REDIS_REST_TOKEN`

2. **Deploy**
   ```bash
   git push origin main
   # Vercel will auto-deploy
   ```

3. **Verify**
   - Check deployment logs for Redis initialization
   - Test rate limiting on production domain

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

ENV NODE_ENV=production
ENV UPSTASH_REDIS_REST_URL=your-url
ENV UPSTASH_REDIS_REST_TOKEN=your-token

EXPOSE 3000

CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t pkm-shop .
docker run -p 3000:3000 \
  -e UPSTASH_REDIS_REST_URL=your-url \
  -e UPSTASH_REDIS_REST_TOKEN=your-token \
  pkm-shop
```

### Kubernetes Deployment

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pkm-shop
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: pkm-shop
        image: pkm-shop:latest
        env:
        - name: UPSTASH_REDIS_REST_URL
          valueFrom:
            secretKeyRef:
              name: redis-credentials
              key: url
        - name: UPSTASH_REDIS_REST_TOKEN
          valueFrom:
            secretKeyRef:
              name: redis-credentials
              key: token
```

### Monitoring in Production

1. **Set up alerts**:
   - Redis connection failures
   - High rate of 429 responses
   - Fallback mode activation

2. **Track metrics**:
   - Rate limit hit rate per endpoint
   - Redis response times
   - Fallback usage percentage

3. **Log aggregation**:
   - Use Sentry, LogRocket, or similar
   - Monitor rate limit warnings

---

## Advanced Topics

### Custom Rate Limiting Strategies

#### Per-User Premium Tiers

```typescript
// Get user's subscription tier
const tier = await getUserTier(userId);

const limits = {
  free: { limit: 100, windowMs: 3600000 }, // 100/hour
  pro: { limit: 1000, windowMs: 3600000 }, // 1000/hour
  enterprise: { limit: 10000, windowMs: 3600000 }, // 10000/hour
};

const result = await checkRateLimit(
  `user:${userId}`,
  limits[tier]
);
```

#### Combined User + IP Limiting

```typescript
// Check both user and IP limits
const userLimit = await checkRateLimit(`user:${userId}`, userConfig);
const ipLimit = await checkRateLimit(`ip:${ipAddress}`, ipConfig);

if (!userLimit.success || !ipLimit.success) {
  return new Response('Rate limit exceeded', { status: 429 });
}
```

#### Dynamic Rate Limits Based on Load

```typescript
// Adjust limits based on server load
const serverLoad = await getServerLoad();
const multiplier = serverLoad > 80 ? 0.5 : 1.0;

const adjustedLimit = Math.floor(baseLimit * multiplier);

const result = await checkRateLimit(identifier, {
  limit: adjustedLimit,
  windowMs: 60000,
});
```

### Redis Key Patterns

All rate limit keys follow this pattern:

```
rate_limit:{identifier}
```

Examples:
- `rate_limit:user:123`
- `rate_limit:ip:192.168.1.1`
- `rate_limit:ip:anonymous`

To manually inspect Redis:

```bash
# List all rate limit keys
redis-cli KEYS "rate_limit:*"

# Get value
redis-cli GET "rate_limit:user:123"

# Get TTL
redis-cli TTL "rate_limit:user:123"
```

---

## Migration Guide

### From next-rate-limit to Redis Rate Limiter

The migration is **backward compatible** - no code changes needed in API routes!

#### Before (next-rate-limit)

```typescript
// middleware.ts
import rateLimit from 'next-rate-limit';

const limiter = rateLimit({
  interval: 60000,
  uniqueTokenPerInterval: 500,
});

// ... rate limiting logic
```

#### After (Redis Rate Limiter)

```typescript
// middleware.ts
import {
  checkRateLimit,
  getIdentifierFromRequest,
  getRateLimitConfigForPath,
} from '@/lib/redis/rate-limiter';

// Rate limiting is now Redis-based automatically!
```

#### What Changed

- ✅ Middleware automatically uses Redis
- ✅ Fallback to in-memory if Redis unavailable
- ✅ All API routes get Redis-based rate limiting
- ✅ No changes needed to individual API routes

---

## FAQ

### Q: Does this work with Vercel?

**A**: Yes! Use Upstash Redis (serverless-friendly, HTTP-based). No persistent connections required.

### Q: Can I use this with AWS Lambda?

**A**: Yes! Upstash Redis works perfectly with Lambda. Traditional Redis with persistent connections may have issues.

### Q: What happens if Redis goes down?

**A**: The system automatically falls back to in-memory rate limiting (if `RATE_LIMIT_FALLBACK=true`). Set to `false` for strict mode (deny all requests when Redis is down).

### Q: How much does Upstash cost?

**A**: Free tier includes:
- 10,000 commands/day
- 256 MB storage
- Perfect for development and small production apps

### Q: Can I use a different Redis provider?

**A**: Yes! Any Redis service works:
- Upstash (recommended for serverless)
- Redis Cloud
- AWS ElastiCache
- Azure Cache for Redis
- Self-hosted Redis

### Q: How do I test rate limiting locally?

**A**: Three options:
1. Use Upstash free tier (recommended)
2. Run Redis with Docker: `docker run -p 6379:6379 redis:latest`
3. Use in-memory fallback (no setup needed)

### Q: Does this affect API performance?

**A**: Minimal impact:
- Redis check adds ~5-10ms per request
- Upstash is optimized for low latency
- Trade-off is worth it for accurate rate limiting

---

## Related Documentation

- [API Documentation](/docs/03-development/API_DOCUMENTATION.md) - Complete API reference with rate limits
- [Environment Variables](/.env.example) - All configuration options
- [Middleware](/middleware.ts) - Where rate limiting is applied
- [App Constants](/src/config/app-constants.ts) - Rate limit configuration
- [Week 3 Plan](/docs/03-development/WEEK3_PLAN.md) - Implementation plan

---

## Support

For issues or questions:

1. Check [Troubleshooting](#troubleshooting) section
2. Review logs: `npm run dev | grep -i redis`
3. Open an issue in the project repository

---

**Implementation Complete**: Issue #76 ✅

*Last Updated: 2025-01-06*
*Version: 1.0.0*
