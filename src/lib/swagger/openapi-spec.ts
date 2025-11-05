/**
 * OpenAPI 3.0 Specification for PKM Shop API
 *
 * Complete API documentation for all endpoints with request/response schemas,
 * authentication, and error handling.
 *
 * Related: Issue #85 - Missing API Documentation
 */

export const openApiSpec = {
  openapi: "3.0.0",
  info: {
    title: "PKM Shop API",
    version: "1.0.0",
    description: "E-commerce API for PKM Shop - Digital product codes marketplace",
    contact: {
      name: "PKM Shop Support",
      email: "support@pkmshop.com",
    },
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT",
    },
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Development server",
    },
    {
      url: "https://pkmshop.com",
      description: "Production server",
    },
  ],
  tags: [
    { name: "Authentication", description: "User authentication and session management" },
    { name: "Products", description: "Product catalog management" },
    { name: "Cart", description: "Shopping cart operations" },
    { name: "Purchases", description: "Order and purchase management" },
    { name: "Codes", description: "Digital product code management" },
    { name: "Banners", description: "Homepage banner management" },
    { name: "Upload", description: "File upload operations" },
    { name: "Settings", description: "Site configuration" },
    { name: "Users", description: "User profile management" },
    { name: "Audit Logs", description: "Admin audit trail" },
  ],
  paths: {
    "/api/v1/register": {
      post: {
        tags: ["Authentication"],
        summary: "Register new user",
        description: "Create a new user account with email and password",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["fname", "lname", "email", "password"],
                properties: {
                  fname: {
                    type: "string",
                    description: "First name (Thai: ชื่อ)",
                    example: "สมชาย",
                  },
                  lname: {
                    type: "string",
                    description: "Last name (Thai: นามสกุล)",
                    example: "ใจดี",
                  },
                  email: {
                    type: "string",
                    format: "email",
                    description: "Email address",
                    example: "somchai@example.com",
                  },
                  password: {
                    type: "string",
                    minLength: 8,
                    description: "Password (minimum 8 characters)",
                    example: "SecurePass123",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "User registered successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/SuccessResponse",
                },
                example: {
                  success: true,
                  message: "ลงทะเบียนสำเร็จ",
                  data: {
                    id: 1,
                    fname: "สมชาย",
                    lname: "ใจดี",
                    email: "somchai@example.com",
                    role: "USER",
                  },
                },
              },
            },
          },
          400: {
            $ref: "#/components/responses/ValidationError",
          },
          409: {
            description: "Email already exists",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                example: {
                  success: false,
                  error: "อีเมลนี้ถูกใช้งานแล้ว",
                },
              },
            },
          },
          429: {
            $ref: "#/components/responses/RateLimitError",
          },
        },
      },
    },
    "/api/v1/products": {
      get: {
        tags: ["Products"],
        summary: "Get all products",
        description: "Retrieve paginated list of products with optional filters",
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1 },
            description: "Page number for pagination",
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 10, maximum: 100 },
            description: "Number of items per page (max 100)",
          },
          {
            name: "category",
            in: "query",
            schema: { type: "string", enum: ["PACK", "BOX", "PROMO"] },
            description: "Filter by product category",
          },
          {
            name: "issale",
            in: "query",
            schema: { type: "boolean" },
            description: "Filter by sale status",
          },
          {
            name: "isrecommend",
            in: "query",
            schema: { type: "boolean" },
            description: "Filter by recommended status",
          },
        ],
        responses: {
          200: {
            description: "List of products",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "object",
                          properties: {
                            products: {
                              type: "array",
                              items: { $ref: "#/components/schemas/Product" },
                            },
                            pagination: {
                              $ref: "#/components/schemas/Pagination",
                            },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          429: {
            $ref: "#/components/responses/RateLimitError",
          },
        },
      },
      post: {
        tags: ["Products"],
        summary: "Create product",
        description: "Create a new product (Admin/Operator only)",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ProductInput",
              },
            },
          },
        },
        responses: {
          201: {
            description: "Product created successfully",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/Product" },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: {
            $ref: "#/components/responses/UnauthorizedError",
          },
          403: {
            $ref: "#/components/responses/ForbiddenError",
          },
          400: {
            $ref: "#/components/responses/ValidationError",
          },
        },
      },
    },
    "/api/v1/products/{id}": {
      get: {
        tags: ["Products"],
        summary: "Get product by ID",
        description: "Retrieve detailed information about a specific product",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
            description: "Product ID",
          },
        ],
        responses: {
          200: {
            description: "Product details",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/Product" },
                      },
                    },
                  ],
                },
              },
            },
          },
          404: {
            description: "Product not found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
                example: {
                  success: false,
                  error: "ไม่พบสินค้า",
                },
              },
            },
          },
        },
      },
      put: {
        tags: ["Products"],
        summary: "Update product",
        description: "Update product information (Admin/Operator only)",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
            description: "Product ID",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ProductInput",
              },
            },
          },
        },
        responses: {
          200: {
            description: "Product updated successfully",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/Product" },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: {
            $ref: "#/components/responses/UnauthorizedError",
          },
          403: {
            $ref: "#/components/responses/ForbiddenError",
          },
          404: {
            description: "Product not found",
          },
        },
      },
      delete: {
        tags: ["Products"],
        summary: "Delete product",
        description: "Delete a product (Admin only)",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
            description: "Product ID",
          },
        ],
        responses: {
          200: {
            description: "Product deleted successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/SuccessResponse",
                },
              },
            },
          },
          401: {
            $ref: "#/components/responses/UnauthorizedError",
          },
          403: {
            $ref: "#/components/responses/ForbiddenError",
          },
          404: {
            description: "Product not found",
          },
        },
      },
    },
    "/api/v1/products/count": {
      get: {
        tags: ["Products"],
        summary: "Get product count",
        description: "Get total count of products with optional filters",
        parameters: [
          {
            name: "category",
            in: "query",
            schema: { type: "string", enum: ["PACK", "BOX", "PROMO"] },
          },
          {
            name: "issale",
            in: "query",
            schema: { type: "boolean" },
          },
        ],
        responses: {
          200: {
            description: "Product count",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "object",
                          properties: {
                            count: { type: "integer", example: 42 },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/products/recommend": {
      get: {
        tags: ["Products"],
        summary: "Get recommended products",
        description: "Retrieve products marked as recommended",
        parameters: [
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 10 },
            description: "Number of recommended products to return",
          },
        ],
        responses: {
          200: {
            description: "List of recommended products",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "array",
                          items: { $ref: "#/components/schemas/Product" },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/cart": {
      get: {
        tags: ["Cart"],
        summary: "Get user cart",
        description: "Retrieve current user's shopping cart items",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "Cart items",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "array",
                          items: { $ref: "#/components/schemas/CartItem" },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: {
            $ref: "#/components/responses/UnauthorizedError",
          },
        },
      },
      post: {
        tags: ["Cart"],
        summary: "Add item to cart",
        description: "Add a product to the shopping cart",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["productId", "quantity"],
                properties: {
                  productId: {
                    type: "integer",
                    description: "Product ID to add",
                    example: 1,
                  },
                  quantity: {
                    type: "integer",
                    minimum: 1,
                    description: "Quantity to add",
                    example: 2,
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Item added to cart",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/CartItem" },
                      },
                    },
                  ],
                },
              },
            },
          },
          400: {
            $ref: "#/components/responses/ValidationError",
          },
          401: {
            $ref: "#/components/responses/UnauthorizedError",
          },
          404: {
            description: "Product not found",
          },
        },
      },
      delete: {
        tags: ["Cart"],
        summary: "Clear cart",
        description: "Remove all items from the shopping cart",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "Cart cleared successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/SuccessResponse",
                },
              },
            },
          },
          401: {
            $ref: "#/components/responses/UnauthorizedError",
          },
        },
      },
    },
    "/api/v1/cart/sync": {
      post: {
        tags: ["Cart"],
        summary: "Sync cart",
        description: "Synchronize local cart with server cart (merge items)",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  items: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        productId: { type: "integer" },
                        quantity: { type: "integer", minimum: 1 },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Cart synced successfully",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "array",
                          items: { $ref: "#/components/schemas/CartItem" },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: {
            $ref: "#/components/responses/UnauthorizedError",
          },
        },
      },
    },
    "/api/v1/purchases": {
      get: {
        tags: ["Purchases"],
        summary: "Get purchases",
        description: "Retrieve purchases (user: own purchases, admin: all purchases)",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 10, maximum: 100 },
          },
          {
            name: "status",
            in: "query",
            schema: { type: "string", enum: ["PENDING", "COMPLETED", "CANCELED"] },
            description: "Filter by order status",
          },
        ],
        responses: {
          200: {
            description: "List of purchases",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "object",
                          properties: {
                            purchases: {
                              type: "array",
                              items: { $ref: "#/components/schemas/Purchase" },
                            },
                            pagination: {
                              $ref: "#/components/schemas/Pagination",
                            },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: {
            $ref: "#/components/responses/UnauthorizedError",
          },
        },
      },
      post: {
        tags: ["Purchases"],
        summary: "Create purchase",
        description: "Create a new purchase order from cart items",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["items"],
                properties: {
                  items: {
                    type: "array",
                    items: {
                      type: "object",
                      required: ["productId", "quantity"],
                      properties: {
                        productId: { type: "integer" },
                        quantity: { type: "integer", minimum: 1 },
                      },
                    },
                  },
                  paymentMethod: {
                    type: "string",
                    enum: ["manual", "promptpay", "truewallet"],
                    default: "manual",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Purchase created successfully",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/Purchase" },
                      },
                    },
                  ],
                },
              },
            },
          },
          400: {
            description: "Invalid request or insufficient stock",
          },
          401: {
            $ref: "#/components/responses/UnauthorizedError",
          },
        },
      },
    },
    "/api/v1/purchases/{id}": {
      get: {
        tags: ["Purchases"],
        summary: "Get purchase by ID",
        description: "Retrieve detailed information about a specific purchase",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
            description: "Purchase ID",
          },
        ],
        responses: {
          200: {
            description: "Purchase details",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/Purchase" },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: {
            $ref: "#/components/responses/UnauthorizedError",
          },
          403: {
            description: "Not authorized to view this purchase",
          },
          404: {
            description: "Purchase not found",
          },
        },
      },
      put: {
        tags: ["Purchases"],
        summary: "Update purchase status",
        description: "Update purchase and payment status (Admin/Operator only)",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
            description: "Purchase ID",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: {
                    type: "string",
                    enum: ["PENDING", "COMPLETED", "CANCELED"],
                  },
                  paymentStatus: {
                    type: "string",
                    enum: ["PENDING", "SUCCESS", "FAILED"],
                  },
                  adminNotes: {
                    type: "string",
                    description: "Admin notes for this order",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Purchase updated successfully",
          },
          401: {
            $ref: "#/components/responses/UnauthorizedError",
          },
          403: {
            $ref: "#/components/responses/ForbiddenError",
          },
          404: {
            description: "Purchase not found",
          },
        },
      },
    },
    "/api/v1/purchases/codes": {
      get: {
        tags: ["Purchases"],
        summary: "Get purchase codes",
        description: "Retrieve product codes for completed purchases",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "purchaseId",
            in: "query",
            required: true,
            schema: { type: "integer" },
            description: "Purchase ID",
          },
        ],
        responses: {
          200: {
            description: "Product codes for the purchase",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              id: { type: "integer" },
                              code: { type: "string", example: "ABCD-1234-EFGH-5678" },
                              product: {
                                type: "object",
                                properties: {
                                  name: { type: "string" },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: {
            $ref: "#/components/responses/UnauthorizedError",
          },
          403: {
            description: "Purchase not completed or not authorized",
          },
          404: {
            description: "Purchase not found",
          },
        },
      },
    },
    "/api/v1/codes": {
      get: {
        tags: ["Codes"],
        summary: "Get product codes",
        description: "Retrieve product codes with filters (Admin/Operator only)",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 10, maximum: 100 },
          },
          {
            name: "productId",
            in: "query",
            schema: { type: "integer" },
            description: "Filter by product ID",
          },
          {
            name: "isUsed",
            in: "query",
            schema: { type: "boolean" },
            description: "Filter by usage status",
          },
        ],
        responses: {
          200: {
            description: "List of product codes",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "object",
                          properties: {
                            codes: {
                              type: "array",
                              items: { $ref: "#/components/schemas/Code" },
                            },
                            pagination: {
                              $ref: "#/components/schemas/Pagination",
                            },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: {
            $ref: "#/components/responses/UnauthorizedError",
          },
          403: {
            $ref: "#/components/responses/ForbiddenError",
          },
        },
      },
      post: {
        tags: ["Codes"],
        summary: "Create product code",
        description: "Add a new product code (Admin/Operator only)",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["code", "productId"],
                properties: {
                  code: {
                    type: "string",
                    description: "Product code",
                    example: "ABCD-1234-EFGH-5678",
                  },
                  productId: {
                    type: "integer",
                    description: "Product ID this code belongs to",
                    example: 1,
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Code created successfully",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/Code" },
                      },
                    },
                  ],
                },
              },
            },
          },
          400: {
            $ref: "#/components/responses/ValidationError",
          },
          401: {
            $ref: "#/components/responses/UnauthorizedError",
          },
          403: {
            $ref: "#/components/responses/ForbiddenError",
          },
          409: {
            description: "Code already exists",
          },
        },
      },
    },
    "/api/v1/codes/{id}": {
      delete: {
        tags: ["Codes"],
        summary: "Delete product code",
        description: "Delete a product code (Admin only, cannot delete used codes)",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
            description: "Code ID",
          },
        ],
        responses: {
          200: {
            description: "Code deleted successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/SuccessResponse",
                },
              },
            },
          },
          400: {
            description: "Cannot delete used code",
          },
          401: {
            $ref: "#/components/responses/UnauthorizedError",
          },
          403: {
            $ref: "#/components/responses/ForbiddenError",
          },
          404: {
            description: "Code not found",
          },
        },
      },
    },
    "/api/v1/banners": {
      get: {
        tags: ["Banners"],
        summary: "Get all banners",
        description: "Retrieve all banners (active only for public, all for admin)",
        parameters: [
          {
            name: "activeOnly",
            in: "query",
            schema: { type: "boolean", default: true },
            description: "Show only active banners",
          },
        ],
        responses: {
          200: {
            description: "List of banners",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "array",
                          items: { $ref: "#/components/schemas/Banner" },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Banners"],
        summary: "Create banner",
        description: "Create a new homepage banner (Admin only)",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/BannerInput",
              },
            },
          },
        },
        responses: {
          201: {
            description: "Banner created successfully",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/Banner" },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: {
            $ref: "#/components/responses/UnauthorizedError",
          },
          403: {
            $ref: "#/components/responses/ForbiddenError",
          },
        },
      },
    },
    "/api/v1/banners/{id}": {
      get: {
        tags: ["Banners"],
        summary: "Get banner by ID",
        description: "Retrieve a specific banner",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Banner UUID",
          },
        ],
        responses: {
          200: {
            description: "Banner details",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/Banner" },
                      },
                    },
                  ],
                },
              },
            },
          },
          404: {
            description: "Banner not found",
          },
        },
      },
      put: {
        tags: ["Banners"],
        summary: "Update banner",
        description: "Update banner information (Admin only)",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Banner UUID",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/BannerInput",
              },
            },
          },
        },
        responses: {
          200: {
            description: "Banner updated successfully",
          },
          401: {
            $ref: "#/components/responses/UnauthorizedError",
          },
          403: {
            $ref: "#/components/responses/ForbiddenError",
          },
          404: {
            description: "Banner not found",
          },
        },
      },
      delete: {
        tags: ["Banners"],
        summary: "Delete banner",
        description: "Delete a banner (Admin only)",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Banner UUID",
          },
        ],
        responses: {
          200: {
            description: "Banner deleted successfully",
          },
          401: {
            $ref: "#/components/responses/UnauthorizedError",
          },
          403: {
            $ref: "#/components/responses/ForbiddenError",
          },
          404: {
            description: "Banner not found",
          },
        },
      },
    },
    "/api/v1/upload": {
      post: {
        tags: ["Upload"],
        summary: "Upload file",
        description: "Upload an image or PDF file (Admin/Operator only)",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["file"],
                properties: {
                  file: {
                    type: "string",
                    format: "binary",
                    description: "File to upload (images: JPG/PNG/WEBP, max 5MB; PDF: max 5MB)",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "File uploaded successfully",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "object",
                          properties: {
                            id: { type: "integer", example: 1 },
                            name: { type: "string", example: "image.jpg" },
                            path: { type: "string", example: "/uploads/1234567890-image.jpg" },
                            size: { type: "integer", example: 1024000 },
                            createdAt: { type: "string", format: "date-time" },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          400: {
            description: "Invalid file type or size",
          },
          401: {
            $ref: "#/components/responses/UnauthorizedError",
          },
          403: {
            $ref: "#/components/responses/ForbiddenError",
          },
          413: {
            description: "File too large (max 5MB)",
          },
        },
      },
    },
    "/api/v1/upload/{id}": {
      put: {
        tags: ["Upload"],
        summary: "Update uploaded file",
        description: "Replace an existing uploaded file (Admin/Operator only)",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
            description: "File ID",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["file"],
                properties: {
                  file: {
                    type: "string",
                    format: "binary",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "File updated successfully",
          },
          400: {
            description: "Invalid file type or size",
          },
          401: {
            $ref: "#/components/responses/UnauthorizedError",
          },
          403: {
            $ref: "#/components/responses/ForbiddenError",
          },
          404: {
            description: "File not found",
          },
        },
      },
      delete: {
        tags: ["Upload"],
        summary: "Delete uploaded file",
        description: "Delete an uploaded file (Admin/Operator only)",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
            description: "File ID",
          },
        ],
        responses: {
          200: {
            description: "File deleted successfully",
          },
          401: {
            $ref: "#/components/responses/UnauthorizedError",
          },
          403: {
            $ref: "#/components/responses/ForbiddenError",
          },
          404: {
            description: "File not found",
          },
        },
      },
    },
    "/api/v1/settings": {
      get: {
        tags: ["Settings"],
        summary: "Get site settings",
        description: "Retrieve site configuration and settings",
        responses: {
          200: {
            description: "Site settings",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/SiteSettings" },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      put: {
        tags: ["Settings"],
        summary: "Update site settings",
        description: "Update site configuration (Admin only)",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/SiteSettings",
              },
            },
          },
        },
        responses: {
          200: {
            description: "Settings updated successfully",
          },
          401: {
            $ref: "#/components/responses/UnauthorizedError",
          },
          403: {
            $ref: "#/components/responses/ForbiddenError",
          },
        },
      },
    },
    "/api/v1/users/profile": {
      get: {
        tags: ["Users"],
        summary: "Get user profile",
        description: "Retrieve current user's profile information",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "User profile",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: { $ref: "#/components/schemas/User" },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: {
            $ref: "#/components/responses/UnauthorizedError",
          },
        },
      },
      put: {
        tags: ["Users"],
        summary: "Update user profile",
        description: "Update current user's profile information",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  fname: {
                    type: "string",
                    description: "First name",
                  },
                  lname: {
                    type: "string",
                    description: "Last name",
                  },
                  email: {
                    type: "string",
                    format: "email",
                    description: "Email address",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Profile updated successfully",
          },
          400: {
            $ref: "#/components/responses/ValidationError",
          },
          401: {
            $ref: "#/components/responses/UnauthorizedError",
          },
          409: {
            description: "Email already in use",
          },
        },
      },
    },
    "/api/v1/audit-logs": {
      get: {
        tags: ["Audit Logs"],
        summary: "Get audit logs",
        description: "Retrieve admin action audit trail (Admin only)",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 50, maximum: 100 },
          },
          {
            name: "userId",
            in: "query",
            schema: { type: "integer" },
            description: "Filter by user ID",
          },
          {
            name: "action",
            in: "query",
            schema: {
              type: "string",
              enum: ["CREATE", "UPDATE", "DELETE", "LOGIN", "LOGOUT", "APPROVE", "REJECT", "DELIVER"],
            },
            description: "Filter by action type",
          },
          {
            name: "resource",
            in: "query",
            schema: { type: "string" },
            description: "Filter by resource type (Product, Code, Purchase, etc.)",
          },
        ],
        responses: {
          200: {
            description: "List of audit logs",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "object",
                          properties: {
                            logs: {
                              type: "array",
                              items: { $ref: "#/components/schemas/AuditLog" },
                            },
                            pagination: {
                              $ref: "#/components/schemas/Pagination",
                            },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: {
            $ref: "#/components/responses/UnauthorizedError",
          },
          403: {
            $ref: "#/components/responses/ForbiddenError",
          },
        },
      },
    },
    "/api/v1/audit-logs/stats": {
      get: {
        tags: ["Audit Logs"],
        summary: "Get audit log statistics",
        description: "Retrieve statistics about admin actions (Admin only)",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "Audit log statistics",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "object",
                          properties: {
                            totalActions: { type: "integer" },
                            byAction: {
                              type: "object",
                              additionalProperties: { type: "integer" },
                            },
                            byResource: {
                              type: "object",
                              additionalProperties: { type: "integer" },
                            },
                            recentActions: {
                              type: "array",
                              items: { $ref: "#/components/schemas/AuditLog" },
                            },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: {
            $ref: "#/components/responses/UnauthorizedError",
          },
          403: {
            $ref: "#/components/responses/ForbiddenError",
          },
        },
      },
    },
    "/api/v1/audit-logs/resource": {
      get: {
        tags: ["Audit Logs"],
        summary: "Get audit logs for a resource",
        description: "Retrieve audit trail for a specific resource (Admin only)",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "resource",
            in: "query",
            required: true,
            schema: { type: "string" },
            description: "Resource type (e.g., Product, Code, Purchase)",
          },
          {
            name: "resourceId",
            in: "query",
            required: true,
            schema: { type: "string" },
            description: "Resource ID",
          },
        ],
        responses: {
          200: {
            description: "Audit logs for the resource",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/SuccessResponse" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "array",
                          items: { $ref: "#/components/schemas/AuditLog" },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: {
            $ref: "#/components/responses/UnauthorizedError",
          },
          403: {
            $ref: "#/components/responses/ForbiddenError",
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "JWT token obtained from NextAuth.js authentication",
      },
    },
    schemas: {
      SuccessResponse: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: true,
          },
          message: {
            type: "string",
            example: "Operation completed successfully",
          },
          data: {
            type: "object",
            description: "Response data",
          },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: false,
          },
          error: {
            type: "string",
            example: "An error occurred",
          },
          errorCode: {
            type: "string",
            example: "VALIDATION_ERROR",
          },
        },
      },
      Pagination: {
        type: "object",
        properties: {
          page: {
            type: "integer",
            example: 1,
          },
          limit: {
            type: "integer",
            example: 10,
          },
          total: {
            type: "integer",
            example: 100,
          },
          totalPages: {
            type: "integer",
            example: 10,
          },
        },
      },
      User: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            example: 1,
          },
          fname: {
            type: "string",
            example: "สมชาย",
          },
          lname: {
            type: "string",
            example: "ใจดี",
          },
          email: {
            type: "string",
            format: "email",
            example: "somchai@example.com",
          },
          role: {
            type: "string",
            enum: ["USER", "OPERATOR", "ADMIN"],
            example: "USER",
          },
          createdAt: {
            type: "string",
            format: "date-time",
          },
        },
      },
      Product: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            example: 1,
          },
          name: {
            type: "string",
            example: "Steam Wallet 100฿",
          },
          description: {
            type: "string",
            example: "Steam Wallet code สำหรับเติมเงินในบัญชี Steam",
          },
          price: {
            type: "number",
            format: "float",
            example: 100,
          },
          discountprice: {
            type: "number",
            format: "float",
            example: 90,
          },
          issale: {
            type: "boolean",
            example: true,
          },
          isrecommend: {
            type: "boolean",
            example: false,
          },
          image: {
            type: "string",
            nullable: true,
            example: "/uploads/steam-wallet.jpg",
          },
          imageId: {
            type: "string",
            nullable: true,
          },
          category: {
            type: "string",
            enum: ["PACK", "BOX", "PROMO"],
            example: "PACK",
          },
          createdAt: {
            type: "string",
            format: "date-time",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
          },
        },
      },
      ProductInput: {
        type: "object",
        required: ["name", "price", "discountprice", "issale", "isrecommend", "category"],
        properties: {
          name: {
            type: "string",
            minLength: 1,
            example: "Steam Wallet 100฿",
          },
          description: {
            type: "string",
            nullable: true,
          },
          price: {
            type: "number",
            format: "float",
            minimum: 0,
            example: 100,
          },
          discountprice: {
            type: "number",
            format: "float",
            minimum: 0,
            example: 90,
          },
          issale: {
            type: "boolean",
            example: true,
          },
          isrecommend: {
            type: "boolean",
            example: false,
          },
          image: {
            type: "string",
            nullable: true,
          },
          imageId: {
            type: "string",
            nullable: true,
          },
          category: {
            type: "string",
            enum: ["PACK", "BOX", "PROMO"],
            example: "PACK",
          },
        },
      },
      CartItem: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            example: 1,
          },
          userId: {
            type: "integer",
            example: 1,
          },
          productId: {
            type: "integer",
            example: 1,
          },
          quantity: {
            type: "integer",
            example: 2,
          },
          product: {
            $ref: "#/components/schemas/Product",
          },
          createdAt: {
            type: "string",
            format: "date-time",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
          },
        },
      },
      Purchase: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            example: 1,
          },
          userId: {
            type: "integer",
            example: 1,
          },
          productId: {
            type: "integer",
            example: 1,
          },
          quantity: {
            type: "integer",
            example: 2,
          },
          totalAmount: {
            type: "number",
            format: "float",
            example: 200,
          },
          status: {
            type: "string",
            enum: ["PENDING", "COMPLETED", "CANCELED"],
            example: "PENDING",
          },
          user: {
            $ref: "#/components/schemas/User",
          },
          product: {
            $ref: "#/components/schemas/Product",
          },
          payment: {
            $ref: "#/components/schemas/Payment",
          },
          createdAt: {
            type: "string",
            format: "date-time",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
          },
        },
      },
      Payment: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            example: 1,
          },
          purchaseId: {
            type: "integer",
            example: 1,
          },
          paymentMethod: {
            type: "string",
            enum: ["manual", "promptpay", "truewallet"],
            example: "manual",
          },
          paymentStatus: {
            type: "string",
            enum: ["PENDING", "SUCCESS", "FAILED"],
            example: "PENDING",
          },
          transactionId: {
            type: "string",
            nullable: true,
            example: "TXN-123456",
          },
          paymentProof: {
            type: "string",
            nullable: true,
            example: "/uploads/payment-proof.jpg",
          },
          adminNotes: {
            type: "string",
            nullable: true,
          },
          paidAt: {
            type: "string",
            format: "date-time",
            nullable: true,
          },
          createdAt: {
            type: "string",
            format: "date-time",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
          },
        },
      },
      Code: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            example: 1,
          },
          code: {
            type: "string",
            example: "ABCD-1234-EFGH-5678",
          },
          isUsed: {
            type: "boolean",
            example: false,
          },
          productId: {
            type: "integer",
            example: 1,
          },
          product: {
            $ref: "#/components/schemas/Product",
          },
          createdAt: {
            type: "string",
            format: "date-time",
          },
        },
      },
      Banner: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid",
            example: "123e4567-e89b-12d3-a456-426614174000",
          },
          title: {
            type: "string",
            example: "Summer Sale 2024",
          },
          description: {
            type: "string",
            nullable: true,
            example: "Up to 50% off on selected items",
          },
          image: {
            type: "string",
            example: "/uploads/banner-1.jpg",
          },
          imageId: {
            type: "string",
            nullable: true,
          },
          link: {
            type: "string",
            nullable: true,
            example: "/products?category=PROMO",
          },
          isActive: {
            type: "boolean",
            example: true,
          },
          order: {
            type: "integer",
            example: 1,
          },
          createdAt: {
            type: "string",
            format: "date-time",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
          },
        },
      },
      BannerInput: {
        type: "object",
        required: ["title", "image"],
        properties: {
          title: {
            type: "string",
            minLength: 1,
          },
          description: {
            type: "string",
            nullable: true,
          },
          image: {
            type: "string",
            minLength: 1,
          },
          imageId: {
            type: "string",
            nullable: true,
          },
          link: {
            type: "string",
            nullable: true,
          },
          isActive: {
            type: "boolean",
            default: true,
          },
          order: {
            type: "integer",
            minimum: 0,
            default: 0,
          },
        },
      },
      SiteSettings: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            example: 1,
          },
          welcomeTitle: {
            type: "string",
            example: "Welcome to PKM Shop",
          },
          welcomeSubtitle: {
            type: "string",
            nullable: true,
          },
          showWelcome: {
            type: "boolean",
            example: true,
          },
          supportEmail: {
            type: "string",
            format: "email",
            nullable: true,
          },
          enableEmailNotifications: {
            type: "boolean",
            example: true,
          },
          shopName: {
            type: "string",
            nullable: true,
          },
          seoTitle: {
            type: "string",
            nullable: true,
          },
          seoDescription: {
            type: "string",
            nullable: true,
          },
          seoKeywords: {
            type: "string",
            nullable: true,
          },
          logoUrl: {
            type: "string",
            nullable: true,
          },
          faviconUrl: {
            type: "string",
            nullable: true,
          },
          primaryColor: {
            type: "string",
            nullable: true,
          },
          disclaimer: {
            type: "string",
            nullable: true,
          },
        },
      },
      AuditLog: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            example: 1,
          },
          userId: {
            type: "integer",
            example: 1,
          },
          action: {
            type: "string",
            enum: ["CREATE", "UPDATE", "DELETE", "LOGIN", "LOGOUT", "APPROVE", "REJECT", "DELIVER"],
            example: "UPDATE",
          },
          resource: {
            type: "string",
            example: "Product",
          },
          resourceId: {
            type: "string",
            example: "123",
          },
          description: {
            type: "string",
            example: "Updated product price from 100 to 90",
          },
          metadata: {
            type: "string",
            nullable: true,
            description: "JSON string with additional details",
          },
          ipAddress: {
            type: "string",
            nullable: true,
            example: "192.168.1.1",
          },
          userAgent: {
            type: "string",
            nullable: true,
          },
          user: {
            $ref: "#/components/schemas/User",
          },
          createdAt: {
            type: "string",
            format: "date-time",
          },
        },
      },
    },
    responses: {
      UnauthorizedError: {
        description: "Unauthorized - Authentication required",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ErrorResponse",
            },
            example: {
              success: false,
              error: "กรุณาเข้าสู่ระบบ",
              errorCode: "UNAUTHORIZED",
            },
          },
        },
      },
      ForbiddenError: {
        description: "Forbidden - Insufficient permissions",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ErrorResponse",
            },
            example: {
              success: false,
              error: "คุณไม่มีสิทธิ์ในการดำเนินการนี้",
              errorCode: "FORBIDDEN",
            },
          },
        },
      },
      ValidationError: {
        description: "Validation Error - Invalid input data",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                success: {
                  type: "boolean",
                  example: false,
                },
                error: {
                  type: "string",
                  example: "การตรวจสอบข้อมูลล้มเหลว",
                },
                errors: {
                  type: "object",
                  additionalProperties: {
                    type: "array",
                    items: {
                      type: "string",
                    },
                  },
                  example: {
                    "email": ["Invalid email format"],
                    "password": ["Password must be at least 8 characters"],
                  },
                },
              },
            },
          },
        },
      },
      RateLimitError: {
        description: "Rate Limit Exceeded",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ErrorResponse",
            },
            example: {
              success: false,
              error: "Rate limit exceeded. Please try again later.",
              errorCode: "RATE_LIMIT_EXCEEDED",
            },
          },
        },
        headers: {
          "Retry-After": {
            description: "Seconds until rate limit resets",
            schema: {
              type: "integer",
              example: 60,
            },
          },
          "X-RateLimit-Limit": {
            description: "Total rate limit",
            schema: {
              type: "integer",
              example: 100,
            },
          },
          "X-RateLimit-Remaining": {
            description: "Remaining requests",
            schema: {
              type: "integer",
              example: 0,
            },
          },
        },
      },
    },
  },
};
