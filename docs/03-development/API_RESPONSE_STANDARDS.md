# API Response Standards

**Created:** 2025-01-05
**Issue:** #77 - Inconsistent API Responses
**Status:** Implemented

---

## 📋 Overview

This document defines standardized response formats for all API endpoints to ensure:
- Consistent client-side error handling
- Better TypeScript type safety
- Easier debugging and logging
- Clear API documentation

---

## 🎯 Standard Response Format

### Success Response

```typescript
{
  "success": true,
  "data": <T>,           // Response data (any type)
  "message": string,     // Optional success message
  "meta": {
    "timestamp": string, // ISO 8601 timestamp
    "requestId": string  // Request tracking ID
  }
}
```

### Error Response

```typescript
{
  "success": false,
  "error": string,       // Human-readable error message
  "details": unknown,    // Optional error details
  "code": string,        // Machine-readable error code
  "meta": {
    "timestamp": string,
    "requestId": string
  }
}
```

### Paginated Response

```typescript
{
  "success": true,
  "data": T[],
  "pagination": {
    "page": number,
    "limit": number,
    "total": number,
    "totalPages": number,
    "hasNext": boolean,
    "hasPrev": boolean
  },
  "meta": {
    "timestamp": string,
    "requestId": string
  }
}
```

---

## 🔧 Implementation

### 1. Import Helpers

```typescript
import {
  successResponse,
  errorResponse,
  paginatedResponse,
  notFoundResponse,
  validationErrorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  conflictResponse,
  rateLimitResponse,
  serverErrorResponse,
} from "@/lib/utils/api-response";
```

### 2. Success Response Example

```typescript
// GET /api/v1/products/:id
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id: parseInt(id) },
  });

  if (!product) {
    return notFoundResponse("Product not found", { productId: id });
  }

  return successResponse(product, "Product retrieved successfully");
}

// Response:
// {
//   "success": true,
//   "data": {
//     "id": 1,
//     "name": "Pokemon Card",
//     "price": 100
//   },
//   "message": "Product retrieved successfully",
//   "meta": {
//     "timestamp": "2025-01-05T10:00:00.000Z",
//     "requestId": "req_abc123"
//   }
// }
```

### 3. Error Response Example

```typescript
// POST /api/v1/products
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = productSchema.parse(body);

    const product = await prisma.product.create({
      data: validatedData,
    });

    return successResponse(product, "Product created successfully", 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(
        "Invalid product data",
        { issues: error.issues }
      );
    }

    if (error.code === "P2002") {
      return conflictResponse(
        "Product with this name already exists",
        { field: error.meta?.target }
      );
    }

    return serverErrorResponse("Failed to create product");
  }
}

// Error Response:
// {
//   "success": false,
//   "error": "Invalid product data",
//   "details": {
//     "issues": [
//       {
//         "path": ["price"],
//         "message": "Price must be a positive number"
//       }
//     ]
//   },
//   "code": "VALIDATION_ERROR",
//   "meta": {
//     "timestamp": "2025-01-05T10:00:00.000Z",
//     "requestId": "req_def456"
//   }
// }
```

### 4. Paginated Response Example

```typescript
// GET /api/v1/products
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const { page, take, skip } = getPaginationParams({
    page: parseInt(searchParams.get("page") || "1"),
    limit: parseInt(searchParams.get("limit") || "10"),
  });

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      skip,
      take,
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.count(),
  ]);

  const totalPages = Math.ceil(total / take);

  return paginatedResponse(products, {
    page,
    limit: take,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  });
}

// Response:
// {
//   "success": true,
//   "data": [...products],
//   "pagination": {
//     "page": 1,
//     "limit": 10,
//     "total": 100,
//     "totalPages": 10,
//     "hasNext": true,
//     "hasPrev": false
//   },
//   "meta": {
//     "timestamp": "2025-01-05T10:00:00.000Z",
//     "requestId": "req_ghi789"
//   }
// }
```

---

## 📊 Common Error Codes

### Authentication & Authorization

| Code | HTTP Status | Description |
|------|------------|-------------|
| `UNAUTHORIZED` | 401 | No valid authentication |
| `FORBIDDEN` | 403 | Authenticated but no permission |
| `INVALID_CREDENTIALS` | 401 | Wrong username/password |
| `SESSION_EXPIRED` | 401 | Session timeout |

### Validation

| Code | HTTP Status | Description |
|------|------------|-------------|
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `INVALID_INPUT` | 400 | Malformed request |
| `MISSING_REQUIRED_FIELD` | 400 | Required field missing |

### Resources

| Code | HTTP Status | Description |
|------|------------|-------------|
| `NOT_FOUND` | 404 | Resource not found |
| `ALREADY_EXISTS` | 409 | Duplicate resource |
| `CONFLICT` | 409 | State conflict |

### Rate Limiting

| Code | HTTP Status | Description |
|------|------------|-------------|
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `TOO_MANY_REQUESTS` | 429 | Rate limit hit |

### Server Errors

| Code | HTTP Status | Description |
|------|------------|-------------|
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected server error |
| `DATABASE_ERROR` | 500 | Database operation failed |
| `EXTERNAL_SERVICE_ERROR` | 502 | Third-party service error |

### Business Logic

| Code | HTTP Status | Description |
|------|------------|-------------|
| `INSUFFICIENT_STOCK` | 400 | Not enough inventory |
| `PAYMENT_FAILED` | 402 | Payment processing error |
| `INVALID_OPERATION` | 400 | Operation not allowed |

---

## 🛠️ Helper Functions Reference

### Success Responses

```typescript
// Basic success
successResponse(data, message?, status?, meta?)

// Paginated
paginatedResponse(data, pagination, message?, meta?)

// Offset paginated
offsetPaginatedResponse(data, pagination, message?, meta?)
```

### Error Responses

```typescript
// Generic error
errorResponse(error, status?, details?, code?, meta?)

// Shortcuts
unauthorizedResponse(message?, details?)     // 401
forbiddenResponse(message?, details?)        // 403
notFoundResponse(message?, details?)         // 404
validationErrorResponse(message?, details?)  // 400
conflictResponse(message?, details?)         // 409
rateLimitResponse(message?, retryAfter?)     // 429
serverErrorResponse(message?, details?)      // 500
```

### Response Modifiers

```typescript
// Add custom headers
withHeaders(response, { "X-Custom": "value" })

// Add rate limit headers
withRateLimitHeaders(response, limit, remaining, resetTime)

// Add CORS headers
withCorsHeaders(response, origin?)
```

---

## 📝 Migration Guide

### Before (Inconsistent)

```typescript
// Old code - inconsistent formats
return NextResponse.json({ data: users }, { status: 200 });
return NextResponse.json({ error: "Not found" }, { status: 404 });
return NextResponse.json({ success: false, message: "Error" }, { status: 400 });
```

### After (Standardized)

```typescript
// New code - consistent format
return successResponse(users);
return notFoundResponse("User not found");
return errorResponse("Invalid input", 400, details, "VALIDATION_ERROR");
```

---

## 🎯 Type Safety

### TypeScript Integration

```typescript
import type {
  ApiSuccessResponse,
  ApiErrorResponse,
  PaginatedApiResponse,
  ApiErrorCode,
} from "@/types/api-response";

// Type-safe response handling
async function fetchProduct(id: number): Promise<ApiSuccessResponse<Product>> {
  const response = await fetch(`/api/v1/products/${id}`);
  const data: ApiSuccessResponse<Product> = await response.json();

  if (!data.success) {
    throw new Error(data.error);
  }

  return data;
}
```

### Type Guards

```typescript
import {
  isSuccessResponse,
  isErrorResponse,
  isPaginatedResponse,
} from "@/types/api-response";

const response = await fetchData();

if (isSuccessResponse(response)) {
  // TypeScript knows this is ApiSuccessResponse
  console.log(response.data);
}

if (isErrorResponse(response)) {
  // TypeScript knows this is ApiErrorResponse
  console.error(response.error, response.code);
}

if (isPaginatedResponse(response)) {
  // TypeScript knows this is PaginatedApiResponse
  console.log(response.pagination.totalPages);
}
```

---

## ✅ Checklist for New Endpoints

When creating new API endpoints:

- [ ] Use `successResponse()` for success cases
- [ ] Use appropriate error helpers for failures
- [ ] Include proper error codes
- [ ] Add descriptive messages
- [ ] Include relevant details in errors
- [ ] Use correct HTTP status codes
- [ ] Add TypeScript types
- [ ] Test success and error paths
- [ ] Document response format
- [ ] Add rate limiting if needed

---

## 📚 Related Documentation

- [API Versioning Policy](./API_VERSIONING_POLICY.md) (Issue #78)
- [Pagination Utilities](./N+1_QUERY_PREVENTION.md) (Issue #74)
- [Rate Limiting](../../02-security/SECURITY_IMPROVEMENTS.md)

---

**Last Updated:** 2025-01-05
**Next Review:** 2025-03-01
