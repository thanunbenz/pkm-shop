# API Versioning Policy

**Created:** 2025-01-05
**Issue:** #78 - Missing API Versioning Strategy
**Current Version:** v1
**Status:** Active

---

## 📋 Overview

This document defines the versioning strategy for PKM Shop API to ensure:
- Backward compatibility for existing clients
- Clear communication of breaking changes
- Smooth migration paths for API consumers
- Maintainable codebase

---

## 🎯 Versioning Strategy

### URL-Based Versioning

We use **URL path versioning** for clear, explicit version identification:

```
/api/v1/products
/api/v2/products
```

**Why URL-based?**
- ✅ Simple and explicit
- ✅ Easy to test and debug
- ✅ Works with all HTTP clients
- ✅ Can run multiple versions simultaneously

---

## 📊 Version Lifecycle

### Version States

1. **Active** - Current recommended version
2. **Deprecated** - Still functional but discouraged
3. **Sunset** - Will be removed on specific date
4. **Retired** - No longer available

### Timeline Example

```
v1 Active (Current)
├─ v2 Released → v1 becomes Deprecated (6 months support)
├─ v2 Active → v1 Sunset announced (3 months notice)
└─ v1 Retired → v2 Active only
```

---

## 🔄 When to Version

### Major Version (Breaking Changes) → New Version

Create a new major version (v1 → v2) when making:

- **Removing fields** from response
  ```typescript
  // v1
  { id, name, email, phone }

  // v2 (removed phone)
  { id, name, email } // ❌ Breaking change
  ```

- **Changing response structure**
  ```typescript
  // v1
  { data: [...] }

  // v2
  { success: true, data: [...] } // ❌ Breaking change
  ```

- **Changing authentication method**
  ```typescript
  // v1: Session-based
  // v2: JWT token-based // ❌ Breaking change
  ```

- **Changing endpoint behavior**
  ```typescript
  // v1: GET /products returns all
  // v2: GET /products requires pagination // ❌ Breaking change
  ```

- **Removing endpoints**
  ```typescript
  // v1: DELETE /users/:id
  // v2: Endpoint removed // ❌ Breaking change
  ```

### Minor Version (Non-Breaking) → Same Version

Keep same version when making:

- **Adding optional fields**
  ```typescript
  // v1
  { id, name }

  // v1 (still)
  { id, name, email? } // ✅ Non-breaking
  ```

- **Adding new endpoints**
  ```typescript
  // v1
  GET /products

  // v1 (still)
  GET /products
  GET /products/:id/reviews // ✅ New endpoint
  ```

- **Deprecating fields** (not removing)
  ```typescript
  // v1
  {
    id,
    oldName, // Deprecated but still returned
    name     // New field
  }
  ```

- **Adding new query parameters**
  ```typescript
  // v1
  GET /products?category=box

  // v1 (still)
  GET /products?category=box&sort=price // ✅ Optional param
  ```

### Patch Version (Bug Fixes) → Same Version

Always keep same version for:

- Bug fixes
- Performance improvements
- Security patches
- Internal refactoring
- Documentation updates

---

## 🚀 Current API: v1

### Base URL

```
Production: https://pkmshop.com/api/v1
Development: http://localhost:3000/api/v1
```

### Available Endpoints

**Authentication:**
- `POST /api/v1/register` - User registration
- `POST /api/v1/login` - User login (via NextAuth)

**Products:**
- `GET /api/v1/products` - List products (with pagination)
- `GET /api/v1/products/recommend` - Get recommended products
- `POST /api/v1/products` - Create product (Admin)
- `PUT /api/v1/products/:id` - Update product (Admin)
- `DELETE /api/v1/products/:id` - Delete product (Admin)

**Cart:**
- `GET /api/v1/cart` - Get user cart
- `POST /api/v1/cart` - Add to cart
- `PUT /api/v1/cart/:id` - Update cart item
- `DELETE /api/v1/cart/:id` - Remove from cart
- `POST /api/v1/cart/sync` - Sync cart

**Purchases:**
- `GET /api/v1/purchases` - List purchases
- `POST /api/v1/purchases` - Create purchase (checkout)
- `GET /api/v1/purchases/:id` - Get purchase details
- `PUT /api/v1/purchases/:id` - Update purchase status (Staff)
- `GET /api/v1/purchases/codes` - Get purchased codes

**Codes:**
- `GET /api/v1/codes` - List codes (Admin)
- `POST /api/v1/codes` - Create code (Admin)
- `PUT /api/v1/codes/:id` - Update code (Admin)
- `DELETE /api/v1/codes/:id` - Delete code (Admin)

**Banners:**
- `GET /api/v1/banners` - List banners
- `POST /api/v1/banners` - Create banner (Admin)
- `PUT /api/v1/banners/:id` - Update banner (Admin)
- `DELETE /api/v1/banners/:id` - Delete banner (Admin)

**Upload:**
- `POST /api/v1/upload` - Upload file (Staff)
- `PUT /api/v1/upload/:id` - Update file (Staff)
- `DELETE /api/v1/upload/:id` - Delete file (Staff)

**Settings:**
- `GET /api/v1/settings` - Get site settings (Admin)
- `PUT /api/v1/settings` - Update settings (Admin)

**Profile:**
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update user profile

**Audit Logs:**
- `GET /api/v1/audit-logs` - List audit logs (Staff)
- `GET /api/v1/audit-logs/stats` - Get audit stats (Staff)
- `GET /api/v1/audit-logs/resource` - Get resource audit history (Staff)

---

## 📝 Deprecation Process

### Step 1: Mark as Deprecated

Add deprecation notice to endpoint:

```typescript
// src/app/api/v1/old-endpoint/route.ts

export async function GET(request: NextRequest) {
  const response = successResponse(data);

  // Add deprecation header
  response.headers.set("X-API-Deprecation", "true");
  response.headers.set("X-API-Sunset-Date", "2025-07-01");
  response.headers.set("X-API-Replacement", "/api/v2/new-endpoint");

  return response;
}
```

### Step 2: Update Documentation

Add deprecation notice to docs:

```markdown
## ⚠️ Deprecated Endpoints

- `GET /api/v1/old-endpoint`
  - **Deprecated:** 2025-01-05
  - **Sunset Date:** 2025-07-01
  - **Replacement:** `GET /api/v2/new-endpoint`
  - **Migration Guide:** See [Migration Guide](#migration)
```

### Step 3: Announce to Users

- Update API changelog
- Send email notifications
- Show warning in API responses
- Update SDK/client libraries

### Step 4: Monitor Usage

Track deprecated endpoint usage:

```typescript
logger.warn("Deprecated endpoint accessed", {
  endpoint: "/api/v1/old-endpoint",
  userAgent: request.headers.get("user-agent"),
  ip: getClientIp(request),
});
```

### Step 5: Sunset & Retire

After 6 months minimum:

```typescript
// Return 410 Gone
export async function GET(request: NextRequest) {
  return errorResponse(
    "This endpoint has been retired. Please use /api/v2/new-endpoint",
    410,
    {
      sunsetDate: "2025-07-01",
      replacement: "/api/v2/new-endpoint",
    },
    "ENDPOINT_RETIRED"
  );
}
```

---

## 🔧 Implementation Guidelines

### Version Headers

All API responses include version headers:

```typescript
// middleware.ts
if (pathname.startsWith('/api/v1')) {
  response.headers.set('X-API-Version', 'v1');
  response.headers.set('X-API-Deprecated', 'false');
  response.headers.set('X-API-Sunset-Date', ''); // Empty if not deprecated
}
```

### Response Format

All v1 endpoints use standardized response format (Issue #77):

```typescript
// Success
{
  "success": true,
  "data": {...},
  "message": "Optional success message",
  "meta": {
    "timestamp": "2025-01-05T10:00:00.000Z",
    "requestId": "req_abc123"
  }
}

// Error
{
  "success": false,
  "error": "Error message",
  "details": {...},
  "code": "ERROR_CODE",
  "meta": {
    "timestamp": "2025-01-05T10:00:00.000Z",
    "requestId": "req_abc123"
  }
}
```

### Backward Compatibility Checklist

When creating v2:

- [ ] All v1 breaking changes documented
- [ ] Migration guide created
- [ ] Test suite for both versions
- [ ] v1 deprecation headers added
- [ ] 6-month sunset timeline announced
- [ ] SDK/client library updated
- [ ] API documentation updated
- [ ] Monitoring for deprecated endpoint usage

---

## 🎯 Migration Example: v1 → v2

### Scenario: Change Response Structure

**v1 (Current):**
```typescript
// GET /api/v1/products
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}
```

**v2 (New Standard):**
```typescript
// GET /api/v2/products
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  },
  "meta": {
    "timestamp": "2025-01-05T10:00:00.000Z",
    "requestId": "req_abc123"
  }
}
```

### Migration Steps:

1. **Create v2 endpoint** with new structure
2. **Mark v1 as deprecated** (2025-01-05)
3. **Announce changes** in API docs and email
4. **Support both versions** for 6 months
5. **Sunset v1** (2025-07-01)
6. **Retire v1** after confirmed migration

### Client Migration:

```typescript
// Old client (v1)
const response = await fetch('/api/v1/products');
const { data, pagination } = await response.json();

// New client (v2)
const response = await fetch('/api/v2/products');
const { success, data, pagination, meta } = await response.json();

if (!success) {
  // Handle error with standardized format
  console.error(data.error, data.code);
}
```

---

## 📊 Version Comparison Matrix

| Feature | v1 (Current) | v2 (Future) |
|---------|-------------|-------------|
| **Response Format** | Inconsistent | Standardized |
| **Error Format** | Varies | Consistent with codes |
| **Pagination** | Basic | Enhanced metadata |
| **Deprecation Headers** | No | Yes |
| **Request IDs** | No | Yes |
| **Timestamps** | Inconsistent | ISO 8601 standard |
| **CORS Headers** | Basic | Configurable |

---

## 🛠️ Tools & Utilities

### Check API Version

```bash
curl -I https://pkmshop.com/api/v1/products

# Response headers:
# X-API-Version: v1
# X-API-Deprecated: false
```

### Monitor Deprecated Endpoints

```typescript
// lib/analytics/api-usage.ts
export function trackDeprecatedEndpointUsage(
  endpoint: string,
  version: string
) {
  logger.warn("Deprecated endpoint accessed", {
    endpoint,
    version,
    timestamp: new Date().toISOString(),
  });

  // Send to analytics platform
  analytics.track("deprecated_endpoint_accessed", {
    endpoint,
    version,
  });
}
```

---

## 📚 Related Documentation

- [API Response Standards](./API_RESPONSE_STANDARDS.md) (Issue #77)
- [N+1 Query Prevention](./N+1_QUERY_PREVENTION.md) (Issue #74)
- [Security Implementation](../02-security/SECURITY_IMPROVEMENTS.md)

---

## 🎯 Future Considerations

### v2 Roadmap (Potential Features)

1. **GraphQL Support** - Flexible queries
2. **Webhook System** - Real-time notifications
3. **Bulk Operations** - Batch updates
4. **Advanced Filtering** - Complex queries with operators
5. **Rate Limit Tiers** - Different limits for different users
6. **API Keys** - Alternative to session auth

### When to Create v2?

Consider v2 when:
- Multiple breaking changes accumulate
- Major feature additions require structural changes
- Performance requires fundamental redesign
- Security updates mandate authentication changes

**Current Assessment:** v1 is sufficient for foreseeable future

---

## ✅ Checklist for New Endpoints

When creating new API endpoints:

- [ ] Use standard response format from `api-response.ts`
- [ ] Include proper error codes
- [ ] Add request/response types
- [ ] Document in API docs
- [ ] Add rate limiting
- [ ] Include proper authentication
- [ ] Write unit tests
- [ ] Add audit logging (if needed)
- [ ] Follow naming conventions
- [ ] Use proper HTTP methods (GET, POST, PUT, DELETE)

---

**Policy Version:** 1.0
**Last Updated:** 2025-01-05
**Next Review:** 2025-07-01
