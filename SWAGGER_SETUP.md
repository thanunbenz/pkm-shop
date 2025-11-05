# Swagger/OpenAPI Setup Instructions

**Issue #85: Missing API Documentation**

## Installation Required

Due to permission restrictions, please run the following command manually:

```bash
npm install swagger-ui-react
```

Or if you encounter permission issues:

```bash
sudo chown -R $(whoami) node_modules/
npm install swagger-ui-react
```

## What's Been Created

1. ✅ `/src/lib/swagger/openapi-spec.ts` - Complete OpenAPI 3.0 specification
2. ✅ `/src/app/api/swagger/route.ts` - Swagger JSON endpoint
3. ✅ `/src/app/api-docs/page.tsx` - Swagger UI page (requires npm install)
4. ✅ `/docs/03-development/API_DOCUMENTATION.md` - Complete guide

## After Installation

1. Install the package:
   ```bash
   npm install swagger-ui-react
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Visit the API documentation:
   ```
   http://localhost:3000/api-docs
   ```

4. Access the raw OpenAPI spec:
   ```
   http://localhost:3000/api/swagger
   ```

## Features

- ✅ Complete API documentation for all 23 endpoints
- ✅ Interactive Swagger UI with "Try it out" functionality
- ✅ Authentication support (Bearer token)
- ✅ Request/response examples
- ✅ Schema definitions for all models
- ✅ Error responses documented
- ✅ Thai and English descriptions

## Next Steps

After running `npm install swagger-ui-react`, the API documentation will be fully functional at `/api-docs`.
