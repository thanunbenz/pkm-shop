# Week 1 Medium Priority Issues - Implementation Plan

**Created:** 2025-01-05
**Status:** Ready to implement
**Estimated Time:** 15-20 hours
**Priority:** Medium (Quality Improvements)

---

## 📋 Overview

This document provides a detailed implementation plan for Week 1 Medium Priority issues from the Additional Issues Report.

**Issues to Address:**
- Issue #67: Console.log in Production
- Issue #72: Magic Numbers
- Issue #74: N+1 Query Potential
- Issue #77: Inconsistent API Responses
- Issue #78: Missing API Versioning Strategy

---

## Issue #67: Console.log in Production (2-3 hours)

### **Problem:**
Found 10 files with `console.log/error/warn` that should use the logger instead.

### **Files Affected:**
1. `src/lib/startup-validation.ts` - 8 instances
2. `src/app/(main)/profile/page.tsx` - 2 instances
3. `src/lib/utils/refresh-token.ts` - 4 instances
4. `src/components/ui/ProductManagementTable.tsx`
5. `src/components/ui/CodeDataTable.tsx`
6. `src/app/(dashboard)/product/page.tsx`
7. Error boundary files (keep as-is for debugging)

### **Implementation Steps:**

#### Step 1: Replace in startup-validation.ts
\`\`\`typescript
// Before
console.warn('⚠️  Warning: RESEND_API_KEY not set');
console.log('✅ Environment variables validation passed');
console.error('Error message');

// After
import logger from '@/lib/logger';

logger.warn('RESEND_API_KEY not set - emails will not be sent');
logger.info('Environment variables validation passed');
logger.error('Validation error', { error });
\`\`\`

#### Step 2: Replace in profile/page.tsx
\`\`\`typescript
// Before
console.error("Error fetching profile:", error);

// After
import logger from '@/lib/logger';

logger.error('Failed to fetch user profile', {
  error: error instanceof Error ? error.message : 'Unknown error',
  userId: session?.user?.id,
});
\`\`\`

#### Step 3: Replace in refresh-token.ts
\`\`\`typescript
// Before
console.error("Error validating refresh token:", error);

// After
import logger from '@/lib/logger';

logger.error('Failed to validate refresh token', {
  error: error instanceof Error ? error.message : 'Unknown error',
  tokenPreview: token.substring(0, 10) + '...',
});
\`\`\`

### **Benefits:**
- ✅ Proper log levels in production
- ✅ Structured logging with context
- ✅ Log rotation and management
- ✅ Better debugging capabilities

---

## Issue #72: Magic Numbers (2-3 hours)

### **Problem:**
Hardcoded numbers throughout the codebase make maintenance difficult.

### **Common Magic Numbers:**
- Rate limits: 5, 10, 20, 30
- File sizes: 5242880 (5MB)
- Pagination: 10, 20, 50
- Timeouts: 60000, 120000
- Token expiry: 30 days, 7 days

### **Implementation Steps:**

#### Step 1: Create constants file
\`\`\`typescript
// src/config/app-constants.ts

export const RATE_LIMITS = {
  AUTH: 5,              // Auth endpoints: 5 req/min
  REGISTER: 3,          // Registration: 3 req/min
  UPLOAD: 10,           // Upload: 10 req/min
  GENERAL_API: 30,      // General API: 30 req/min
  CHECKOUT: 20,         // Checkout: 20 req/min
} as const;

export const FILE_LIMITS = {
  MAX_SIZE: 5 * 1024 * 1024,  // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  ALLOWED_EXTENSIONS: ['.pdf', '.jpg', '.jpeg', '.png', '.webp'],
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  ALLOWED_PAGE_SIZES: [10, 20, 50, 100],
} as const;

export const TIMEOUTS = {
  REQUEST: 120000,      // 2 minutes
  DATABASE: 30000,      // 30 seconds
  EMAIL: 10000,         // 10 seconds
} as const;

export const TOKEN_EXPIRY = {
  SESSION: 30 * 24 * 60 * 60,     // 30 days
  REFRESH_TOKEN: 7 * 24 * 60 * 60, // 7 days
  RESET_PASSWORD: 60 * 60,         // 1 hour
} as const;
\`\`\`

#### Step 2: Replace in middleware
\`\`\`typescript
// Before
const rateLimits: Record<string, number> = {
  '/api/auth': 5,
  '/api/v1/register': 3,
  '/api/v1/upload': 10,
  '/api/v1': 30,
};

// After
import { RATE_LIMITS } from '@/config/app-constants';

const rateLimits: Record<string, number> = {
  '/api/auth': RATE_LIMITS.AUTH,
  '/api/v1/register': RATE_LIMITS.REGISTER,
  '/api/v1/upload': RATE_LIMITS.UPLOAD,
  '/api/v1': RATE_LIMITS.GENERAL_API,
};
\`\`\`

#### Step 3: Replace in upload routes
\`\`\`typescript
// Before
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// After
import { FILE_LIMITS } from '@/config/app-constants';

const MAX_FILE_SIZE = FILE_LIMITS.MAX_SIZE;
\`\`\`

### **Benefits:**
- ✅ Centralized configuration
- ✅ Easy to modify limits
- ✅ Self-documenting code
- ✅ Type-safe constants

---

## Issue #74: N+1 Query Potential (3-4 hours)

### **Problem:**
Pagination endpoints may cause N+1 queries without proper includes.

### **Files to Check:**
- Purchase list API
- Product list API
- Order history API
- Audit log API

### **Implementation Steps:**

#### Step 1: Optimize Purchase List
\`\`\`typescript
// Before (potential N+1)
const purchases = await prisma.purchase.findMany({
  take: limit,
  skip: offset,
  orderBy: { createdAt: 'desc' },
});

// Each purchase.user, purchase.product requires separate query

// After (optimized)
const purchases = await prisma.purchase.findMany({
  take: limit,
  skip: offset,
  orderBy: { createdAt: 'desc' },
  include: {
    user: {
      select: {
        id: true,
        fname: true,
        lname: true,
        email: true,
      },
    },
    product: {
      select: {
        id: true,
        name: true,
        price: true,
        image: true,
      },
    },
    payment: {
      select: {
        paymentStatus: true,
        paymentMethod: true,
      },
    },
  },
});
\`\`\`

#### Step 2: Add Pagination Helper
\`\`\`typescript
// src/lib/utils/pagination.ts

import { PAGINATION } from '@/config/app-constants';

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export function getPaginationParams(
  params: PaginationParams
): { take: number; skip: number; page: number } {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(
    params.limit || PAGINATION.DEFAULT_PAGE_SIZE,
    PAGINATION.MAX_PAGE_SIZE
  );

  return {
    page,
    take: limit,
    skip: (page - 1) * limit,
  };
}

export function createPaginationResult<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginationResult<T> {
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}
\`\`\`

### **Benefits:**
- ✅ No N+1 queries
- ✅ Faster response times
- ✅ Reduced database load
- ✅ Better performance at scale

---

## Issue #77: Inconsistent API Responses (5-6 hours)

### **Problem:**
API responses use different formats:
- Some: `{ success, data, error }`
- Some: `{ data, message }`
- Some: `{ error }` only

### **Implementation Steps:**

#### Step 1: Create Standard Response Types
\`\`\`typescript
// src/types/api-response.ts

export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: any;
  code?: string;
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface PaginatedApiResponse<T = any> extends ApiSuccessResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
\`\`\`

#### Step 2: Create Response Helpers
\`\`\`typescript
// src/lib/utils/api-response.ts

import { NextResponse } from 'next/server';
import type { ApiSuccessResponse, ApiErrorResponse, PaginatedApiResponse } from '@/types/api-response';

export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
      meta: {
        timestamp: new Date().toISOString(),
      },
    },
    { status }
  );
}

export function errorResponse(
  error: string,
  details?: any,
  status: number = 400
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
      details,
      meta: {
        timestamp: new Date().toISOString(),
      },
    },
    { status }
  );
}

export function paginatedResponse<T>(
  data: T[],
  pagination: PaginatedApiResponse<T>['pagination'],
  message?: string
): NextResponse<PaginatedApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    pagination,
    message,
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
}
\`\`\`

#### Step 3: Update All API Routes
\`\`\`typescript
// Before
return NextResponse.json({ data: users }, { status: 200 });
return NextResponse.json({ error: "Not found" }, { status: 404 });

// After
import { successResponse, errorResponse } from '@/lib/utils/api-response';

return successResponse(users);
return errorResponse("Not found", undefined, 404);
\`\`\`

### **Benefits:**
- ✅ Consistent API responses
- ✅ Better client-side error handling
- ✅ TypeScript type safety
- ✅ Easier debugging

---

## Issue #78: Missing API Versioning Strategy (2-3 hours)

### **Problem:**
No documented API versioning policy or migration strategy.

### **Implementation Steps:**

#### Step 1: Create Versioning Policy Document
\`\`\`markdown
# API Versioning Policy

## Current Version: v1

### Versioning Strategy
- URL-based versioning: `/api/v1/`, `/api/v2/`
- Semantic versioning for breaking changes
- Backward compatibility for at least 6 months

### When to Version
1. **Major (Breaking) Changes:**
   - Removing fields
   - Changing response structure
   - Changing authentication
   → Create new version (v2)

2. **Minor (Non-Breaking) Changes:**
   - Adding optional fields
   - Adding new endpoints
   - Deprecating (not removing) fields
   → Keep same version (v1)

3. **Patch Changes:**
   - Bug fixes
   - Performance improvements
   - Security updates
   → Keep same version (v1)

### Deprecation Process
1. Mark as deprecated in docs
2. Add warning header in response
3. Keep for 6 months minimum
4. Remove in next major version

### Migration Example
\`\`\`typescript
// v1 (deprecated)
GET /api/v1/users
{ id, name, email }

// v2 (current)
GET /api/v2/users
{
  id,
  firstName,
  lastName,
  email,
  profile: { ... }
}
\`\`\`
\`\`\`

#### Step 2: Add Version Header Middleware
\`\`\`typescript
// Add to middleware.ts

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Add API version header
  if (request.nextUrl.pathname.startsWith('/api/v1')) {
    response.headers.set('X-API-Version', 'v1');
    response.headers.set('X-API-Deprecated', 'false');
  }

  return response;
}
\`\`\`

### **Benefits:**
- ✅ Clear versioning strategy
- ✅ Smooth API evolution
- ✅ Backward compatibility
- ✅ Better developer experience

---

## 📊 Implementation Priority

### **Recommended Order:**

1. **Issue #78 (2-3h)** - Documentation first
   - Creates foundation for other work
   - Quick win

2. **Issue #72 (2-3h)** - Extract magic numbers
   - Easier to implement
   - Immediate value

3. **Issue #67 (2-3h)** - Replace console.log
   - Straightforward find-and-replace
   - Production readiness improvement

4. **Issue #77 (5-6h)** - Standardize API responses
   - Requires updating many files
   - High impact on consistency

5. **Issue #74 (3-4h)** - Optimize pagination
   - Technical complexity
   - Performance improvement

### **Total Time:** 15-20 hours

---

## ✅ Completion Checklist

- [ ] Issue #78: API versioning policy documented
- [ ] Issue #72: All magic numbers extracted to constants
- [ ] Issue #67: All console.log replaced with logger
- [ ] Issue #77: All API responses standardized
- [ ] Issue #74: All pagination optimized (no N+1)
- [ ] Run TypeScript type check
- [ ] Run tests
- [ ] Update documentation
- [ ] Commit changes

---

## 📝 Notes

**Non-Blocking:** These issues are quality improvements and do not block production deployment.

**Benefits:** Improved maintainability, consistency, and developer experience.

**Next Steps:** After completing Week 1, proceed to Week 2 medium priority issues.

---

*Ready to implement - Estimated 15-20 hours total*
