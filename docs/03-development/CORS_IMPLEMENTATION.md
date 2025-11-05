# CORS Implementation Guide

**Created:** 2025-01-05
**Issue:** #79 - Missing CORS Configuration
**Status:** ✅ Complete
**Version:** 1.0

---

## 📋 Overview

This document describes the CORS (Cross-Origin Resource Sharing) configuration implemented for PKM Shop API to enable secure cross-origin requests.

### Problem Solved

**Before:**
- No CORS headers configured
- API cannot be accessed from external domains
- SPA/Mobile apps cannot make requests
- Preflight OPTIONS requests not handled

**After:**
- Comprehensive CORS configuration
- Configurable allowed origins via environment variables
- Automatic localhost support in development
- Preflight request handling
- Secure credential support

---

## 🏗️ Architecture

### File Structure

```
src/
├── config/
│   └── cors.ts                      # CORS configuration
├── middleware.ts                     # CORS middleware integration
└── lib/
    └── startup-validation.ts         # CORS validation

.env.example                          # CORS environment variables
docs/
└── 03-development/
    └── CORS_IMPLEMENTATION.md        # This file
```

### Components

1. **CORS Configuration** ([src/config/cors.ts](../../src/config/cors.ts))
   - Centralized CORS settings
   - Origin validation functions
   - CORS header generation
   - Environment-based configuration

2. **Middleware Integration** ([middleware.ts](../../middleware.ts))
   - Global CORS handling for all API routes
   - Preflight OPTIONS request support
   - CORS headers on all responses
   - Error response CORS headers

3. **Startup Validation** ([src/lib/startup-validation.ts](../../src/lib/startup-validation.ts))
   - Validates CORS configuration on startup
   - Warns if ALLOWED_ORIGINS not set in production
   - Logs configured origins

---

## 🚀 Configuration

### Environment Variables

Add to your `.env` file:

```env
# -----------------------------------------------------------------------------
# CORS CONFIGURATION (Issue #79)
# -----------------------------------------------------------------------------
# Comma-separated list of allowed origins for CORS
# Development: Auto-allows localhost (no need to configure)
# Production: REQUIRED if API will be accessed from external domains

# Single origin
ALLOWED_ORIGINS="https://pkmshop.com"

# Multiple origins
ALLOWED_ORIGINS="https://pkmshop.com,https://www.pkmshop.com,https://app.pkmshop.com"

# With mobile app domains
ALLOWED_ORIGINS="https://pkmshop.com,https://api.pkmshop.com,https://mobile.pkmshop.com"
```

### Default Behavior

#### Development Mode (`NODE_ENV=development`):
- Automatically allows:
  - `http://localhost:3000`
  - `http://localhost:3001`
  - `http://127.0.0.1:3000`
  - `http://127.0.0.1:3001`
- Plus any origins specified in `ALLOWED_ORIGINS`
- No configuration needed for local development

#### Production Mode (`NODE_ENV=production`):
- Only origins listed in `ALLOWED_ORIGINS` are allowed
- **WARNING**: If `ALLOWED_ORIGINS` is not set, external origins will be blocked
- Startup validation logs configured origins

---

## 📖 CORS Headers

### Allowed Methods
```
GET, POST, PUT, DELETE, PATCH, OPTIONS
```

### Allowed Request Headers
```
Content-Type
Authorization
X-Requested-With
Accept
Origin
X-API-Key
```

### Exposed Response Headers
```
X-RateLimit-Limit
X-RateLimit-Remaining
X-RateLimit-Reset
X-API-Version
X-Request-ID
```

### Additional Headers
- `Access-Control-Allow-Credentials: true`
- `Access-Control-Max-Age: 86400` (24 hours)

---

## 🔧 How It Works

### 1. Preflight OPTIONS Requests

When a browser makes a cross-origin request with custom headers or non-simple methods, it first sends a preflight OPTIONS request:

```http
OPTIONS /api/v1/products HTTP/1.1
Origin: https://app.example.com
Access-Control-Request-Method: POST
Access-Control-Request-Headers: Content-Type, Authorization
```

**Middleware Response:**
```http
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin, X-API-Key
Access-Control-Max-Age: 86400
Access-Control-Allow-Credentials: true
```

### 2. Actual Request

After preflight succeeds, the actual request is sent:

```http
POST /api/v1/products HTTP/1.1
Origin: https://app.example.com
Content-Type: application/json
Authorization: Bearer token123

{
  "name": "New Product",
  "price": 1000
}
```

**API Response:**
```http
HTTP/1.1 201 Created
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Expose-Headers: X-RateLimit-Limit, X-RateLimit-Remaining, X-API-Version
Access-Control-Allow-Credentials: true
Content-Type: application/json

{
  "success": true,
  "data": { ... }
}
```

---

## 💻 Usage Examples

### Frontend (React/Next.js)

```typescript
// Client-side API call from external domain
async function fetchProducts() {
  try {
    const response = await fetch('https://api.pkmshop.com/api/v1/products', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include', // Include cookies
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch products:', error);
    throw error;
  }
}
```

### Mobile App (React Native)

```typescript
// Mobile app API call
async function createOrder(orderData: OrderData) {
  try {
    const response = await fetch('https://api.pkmshop.com/api/v1/purchases', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(orderData),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error);
    }

    return result.data;
  } catch (error) {
    console.error('Failed to create order:', error);
    throw error;
  }
}
```

### Axios Configuration

```typescript
// Configure axios with CORS
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.pkmshop.com/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Usage
const products = await api.get('/products');
const order = await api.post('/purchases', orderData);
```

---

## 🧪 Testing CORS

### 1. Test with cURL

```bash
# Test preflight request
curl -X OPTIONS \
  -H "Origin: https://example.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization" \
  -i \
  http://localhost:3000/api/v1/products

# Expected: 204 No Content with CORS headers
```

```bash
# Test actual request
curl -X GET \
  -H "Origin: https://example.com" \
  -H "Content-Type: application/json" \
  -i \
  http://localhost:3000/api/v1/products

# Expected: 200 OK with CORS headers
```

### 2. Test with Browser Console

```javascript
// Open browser console on a different domain, then:

fetch('http://localhost:3000/api/v1/products', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
})
  .then(response => response.json())
  .then(data => console.log('Success:', data))
  .catch(error => console.error('CORS Error:', error));

// Check Network tab for:
// - OPTIONS request (preflight)
// - GET request (actual)
// - CORS headers in responses
```

### 3. Test with Postman

1. Send request to `http://localhost:3000/api/v1/products`
2. Check "Headers" tab in response
3. Look for `Access-Control-Allow-Origin` header

---

## 🔒 Security Considerations

### 1. Origin Validation

**❌ Bad (Allow all origins):**
```typescript
// Don't do this in production!
Access-Control-Allow-Origin: *
```

**✅ Good (Specific origins):**
```typescript
// Only allow configured origins
Access-Control-Allow-Origin: https://pkmshop.com
```

### 2. Credentials

- `Access-Control-Allow-Credentials: true` is set
- Required for cookies and authorization headers
- **Important**: Cannot use `*` for origin when credentials are enabled

### 3. Exposed Headers

Only essential headers are exposed:
- Rate limit information
- API version
- Request ID

Sensitive headers (like Set-Cookie) are NOT exposed.

### 4. Max Age

- Preflight cache: 24 hours (`86400` seconds)
- Reduces number of preflight requests
- Browsers will cache for this duration

---

## 🐛 Troubleshooting

### Issue: CORS Error in Browser

```
Access to fetch at 'http://localhost:3000/api/v1/products' from origin 'http://localhost:3001'
has been blocked by CORS policy
```

**Solutions:**

1. **Check ALLOWED_ORIGINS**:
   ```env
   # Add your origin
   ALLOWED_ORIGINS="http://localhost:3001"
   ```

2. **Restart server** after changing .env:
   ```bash
   npm run dev
   ```

3. **Check browser console** for exact error message

4. **Verify origin format**:
   - Include protocol: `https://` or `http://`
   - Include port if not standard: `http://localhost:3001`
   - No trailing slash: ❌ `https://example.com/`
   - Correct: ✅ `https://example.com`

### Issue: Preflight Request Fails

**Symptoms:**
- OPTIONS request returns 404 or 500
- Actual request never sent

**Solutions:**

1. Check middleware is properly configured
2. Verify request has `Origin` header
3. Check if using custom headers that trigger preflight

### Issue: Credentials Not Working

**Symptoms:**
- Cookies not sent/received
- Authorization header missing

**Solutions:**

1. Add `credentials: 'include'` to fetch:
   ```typescript
   fetch(url, {
     credentials: 'include', // or 'same-origin'
   })
   ```

2. Check `Access-Control-Allow-Credentials` header is `true`

3. Verify origin is not `*` when using credentials

### Issue: Production CORS Not Working

**Symptoms:**
- Works in development, fails in production
- No CORS headers in production responses

**Solutions:**

1. **Set ALLOWED_ORIGINS in production**:
   ```env
   ALLOWED_ORIGINS="https://pkmshop.com,https://www.pkmshop.com"
   ```

2. **Check startup logs**:
   ```
   ✅ CORS configured for 2 origin(s): ['https://pkmshop.com', 'https://www.pkmshop.com']
   ```

3. **Verify deployment environment variables** are set

---

## 📊 CORS Configuration Examples

### Example 1: Single Domain

```env
# Main website only
ALLOWED_ORIGINS="https://pkmshop.com"
```

### Example 2: Main + WWW

```env
# Support both www and non-www
ALLOWED_ORIGINS="https://pkmshop.com,https://www.pkmshop.com"
```

### Example 3: Multiple Subdomains

```env
# Main site + API subdomain + Admin panel
ALLOWED_ORIGINS="https://pkmshop.com,https://api.pkmshop.com,https://admin.pkmshop.com"
```

### Example 4: Development + Production

```env
# For staging environment
ALLOWED_ORIGINS="https://staging.pkmshop.com,http://localhost:3000"
```

### Example 5: Mobile Apps

```env
# Web + iOS + Android
ALLOWED_ORIGINS="https://pkmshop.com,capacitor://localhost,http://localhost"
```

---

## 🎯 Best Practices

### 1. Environment-Specific Configuration

```env
# Development
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:3001"

# Staging
ALLOWED_ORIGINS="https://staging.pkmshop.com"

# Production
ALLOWED_ORIGINS="https://pkmshop.com,https://www.pkmshop.com"
```

### 2. Monitoring

Log CORS rejections for security monitoring:

```typescript
// In cors.ts
if (!isOriginAllowed(origin)) {
  logger.warn('CORS request blocked', {
    origin,
    allowedOrigins: getAllowedOrigins(),
  });
}
```

### 3. Documentation

Document all allowed origins and their purposes:

```typescript
// In .env comments
# Production domains
# - https://pkmshop.com         - Main website
# - https://www.pkmshop.com     - WWW redirect
# - https://app.pkmshop.com     - Mobile web app
# - https://admin.pkmshop.com   - Admin panel
ALLOWED_ORIGINS="..."
```

---

## 📚 Related Documentation

- [API Response Standards](./API_RESPONSE_STANDARDS.md) - Issue #77
- [API Versioning Policy](./API_VERSIONING_POLICY.md) - Issue #78
- [I18N Implementation](./I18N_IMPLEMENTATION.md) - Issue #71

---

## 🔗 Resources

- [MDN CORS Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [W3C CORS Specification](https://www.w3.org/TR/cors/)
- [Next.js Custom Server & CORS](https://nextjs.org/docs/advanced-features/custom-server)

---

**Implementation Complete:** ✅
**Status:** Production Ready
**Issue:** #79 - Missing CORS Configuration
**Last Updated:** 2025-01-05
