# PKM Shop - Architecture & Tech Stack

**Last Updated:** 2025-11-07
**Version:** 3.0.0
**Status:** Production Ready

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Data Flow](#data-flow)
5. [Security Architecture](#security-architecture)
6. [Performance Optimization](#performance-optimization)
7. [Scalability Considerations](#scalability-considerations)

---

## 🏗️ Architecture Overview

### Architecture Pattern

PKM Shop follows a **modern full-stack architecture** with the following characteristics:

- **Framework**: Next.js 15 (App Router)
- **Rendering**: Hybrid (SSR, SSG, CSR as needed)
- **API**: RESTful API with Next.js API Routes
- **Database**: MySQL with Prisma ORM
- **Authentication**: NextAuth.js (session-based)
- **Deployment**: Vercel-ready (or any Node.js platform)

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client (Browser)                         │
│  - React Components (Server & Client)                       │
│  - TailwindCSS Styling                                       │
│  - Next.js App Router                                        │
└─────────────────────────────────────────────────────────────┘
                            ↕️
┌─────────────────────────────────────────────────────────────┐
│                   Next.js Server (Edge/Node)                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Middleware Layer                                    │   │
│  │  - Authentication (NextAuth.js)                      │   │
│  │  - Rate Limiting (Redis/In-Memory)                   │   │
│  │  - CORS Configuration                                │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  API Routes (/api/v1/*)                             │   │
│  │  - RESTful Endpoints                                 │   │
│  │  - Input Validation (Zod)                            │   │
│  │  - Error Handling                                    │   │
│  │  - Audit Logging (Winston)                           │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Business Logic Layer                                │   │
│  │  - Services & Utilities                              │   │
│  │  - Email Service (SendGrid)                          │   │
│  │  - ID Obfuscation                                    │   │
│  │  - File Upload Handler                               │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕️
┌─────────────────────────────────────────────────────────────┐
│                   Data Layer                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   MySQL DB   │  │  Redis Cache │  │  File System │     │
│  │  (Prisma)    │  │  (Optional)  │  │  (Uploads)   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↕️
┌─────────────────────────────────────────────────────────────┐
│                   External Services                          │
│  - SendGrid (Email)                                          │
│  - Sentry (Error Tracking)                                   │
│  - Vercel Analytics (Optional)                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15.1.4 | React framework with App Router |
| **React** | 18.3.1 | UI library |
| **TypeScript** | 5.7.3 | Type safety |
| **TailwindCSS** | 3.4.1 | Styling |
| **next-intl** | - | Internationalization (Thai/English) |
| **React Icons** | 5.4.0 | Icon library |
| **React Toastify** | 11.0.3 | Toast notifications |
| **Zustand** | 5.0.3 | State management |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js API Routes** | 15.1.4 | RESTful API endpoints |
| **Prisma** | 6.10.1 | ORM & database toolkit |
| **MySQL** | 8.0+ | Relational database |
| **NextAuth.js** | 4.24.11 | Authentication |
| **Zod** | 4.1.12 | Schema validation |
| **bcrypt** | 5.1.1 | Password hashing |
| **jsonwebtoken** | 9.0.2 | JWT token generation |

### Infrastructure & DevOps

| Technology | Version | Purpose |
|------------|---------|---------|
| **Winston** | 3.18.3 | Logging framework |
| **Sentry** | 10.22.0 | Error tracking & monitoring |
| **Redis** | Optional | Rate limiting & caching |
| **next-rate-limit** | 0.0.3 | API rate limiting |
| **Vitest** | 4.0.7 | Unit testing |
| **@testing-library/react** | 16.3.0 | Component testing |

### Email & Communication

| Technology | Version | Purpose |
|------------|---------|---------|
| **SendGrid** | 8.1.6 | Transactional emails (primary) |
| **@react-email** | 4.3.2 | Email templates |

### Security

| Technology | Purpose |
|------------|---------|
| **bcrypt** | Password hashing |
| **NextAuth.js** | Session management |
| **CORS** | Cross-origin resource sharing |
| **Rate Limiting** | API protection |
| **Input Validation** | XSS & injection prevention |
| **ID Obfuscation** | Enumeration attack prevention |

---

## 📁 Project Structure

```
pkm-shop/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── [locale]/                 # Internationalized routes
│   │   │   ├── (auth)/              # Auth route group
│   │   │   ├── (dashboard)/         # Dashboard route group
│   │   │   ├── search/              # Search page
│   │   │   └── ...
│   │   ├── api/                     # API routes
│   │   │   └── v1/                  # API v1
│   │   │       ├── auth/            # Authentication endpoints
│   │   │       ├── users/           # User management
│   │   │       ├── products/        # Product CRUD + Search
│   │   │       ├── orders/          # Order management
│   │   │       ├── codes/           # Game code management
│   │   │       ├── banners/         # Banner management
│   │   │       └── upload/          # File upload
│   │   └── globals.css              # Global styles
│   │
│   ├── components/                   # React components
│   │   ├── ui/                      # Reusable UI components
│   │   ├── forms/                   # Form components
│   │   ├── ProductSearch.tsx        # Search component
│   │   └── ...
│   │
│   ├── lib/                         # Utilities & libraries
│   │   ├── prisma.ts               # Prisma client singleton
│   │   ├── logger.ts               # Winston logger config
│   │   ├── email.ts                # Email service (SendGrid)
│   │   ├── rate-limit.ts           # Rate limiting utility
│   │   ├── startup-validation.ts   # Environment validation
│   │   ├── utils/                  # Utility functions
│   │   │   ├── api-response.ts     # API response helpers
│   │   │   ├── pagination.ts       # Pagination utility
│   │   │   ├── id-formatter.ts     # ID obfuscation
│   │   │   └── ...
│   │   └── validations/            # Zod schemas
│   │       ├── user.ts             # User validation
│   │       ├── product.ts          # Product validation
│   │       └── ...
│   │
│   ├── hooks/                       # Custom React hooks
│   │   ├── useDebounce.ts          # Debounce hook
│   │   └── ...
│   │
│   ├── config/                      # Configuration files
│   │   ├── cors.ts                 # CORS configuration
│   │   └── ...
│   │
│   ├── features/                    # Feature modules
│   │   ├── products/               # Product feature
│   │   ├── orders/                 # Order feature
│   │   └── ...
│   │
│   └── middleware.ts                # Next.js middleware
│
├── prisma/
│   ├── schema.prisma               # Database schema
│   ├── migrations/                 # Database migrations
│   └── seed.ts                     # Database seeding
│
├── tests/
│   ├── unit/                       # Unit tests
│   │   ├── lib/                    # Library tests
│   │   └── ...
│   └── integration/                # Integration tests (future)
│
├── public/                          # Static files
│   ├── uploads/                    # User uploads
│   └── ...
│
├── docs/                            # Documentation
│   ├── 00-getting-started/         # Getting started guides
│   ├── 01-project/                 # Project documentation
│   ├── 02-security/                # Security docs
│   ├── 03-development/             # Development guides
│   └── issues/                     # Issue tracking
│
└── [config files]                   # Various config files
    ├── .env.example                # Environment template
    ├── package.json                # Dependencies
    ├── tsconfig.json               # TypeScript config
    ├── tailwind.config.ts          # Tailwind config
    ├── vitest.config.ts            # Test config
    └── ...
```

---

## 🔄 Data Flow

### 1. Authentication Flow

```
User Login Request
    ↓
[Middleware] Check session
    ↓
[API Route] /api/v1/auth/login
    ↓
[Validation] Zod schema validation
    ↓
[Database] Find user by email
    ↓
[bcrypt] Compare password hash
    ↓
[NextAuth] Create session
    ↓
[Response] Return user data + session cookie
```

### 2. API Request Flow (Protected Route)

```
Client Request
    ↓
[Middleware]
    → Check authentication (NextAuth session)
    → Apply rate limiting
    → Validate CORS
    ↓
[API Route Handler]
    → Parse request
    → Validate input (Zod)
    → Check authorization (role-based)
    ↓
[Business Logic]
    → Process request
    → Database operations (Prisma)
    → External services (if needed)
    ↓
[Audit Logging] Log action (Winston)
    ↓
[Response]
    → Format response (success/error)
    → Set appropriate headers
    → Return JSON
```

### 3. Product Search Flow

```
User Types in Search Box
    ↓
[Debounce] Wait 300ms
    ↓
[Client Component] ProductSearch
    ↓
[API Call] GET /api/v1/products/search?q=...
    ↓
[API Route]
    → Validate query params
    → Build Prisma query with filters
    → Execute FULLTEXT search
    → Apply pagination
    ↓
[Database] MySQL FULLTEXT search
    ↓
[Response] Return products + pagination
    ↓
[Client] Update UI with results
```

### 4. Order Processing Flow

```
User Submits Order
    ↓
[Validation] Check product availability
    ↓
[Database Transaction]
    → Create Order record
    → Reserve game codes
    → Update inventory
    ↓
[Email Service] Send confirmation email
    ↓
[Audit Log] Log order creation
    ↓
[Response] Return order details
```

---

## 🔐 Security Architecture

### Authentication & Authorization

1. **Session-Based Auth** (NextAuth.js)
   - HTTP-only cookies
   - CSRF protection
   - Secure session storage

2. **Role-Based Access Control (RBAC)**
   - Roles: `ADMIN`, `OPERATOR`, `CUSTOMER`
   - Middleware-based route protection
   - API-level permission checks

3. **Password Security**
   - bcrypt hashing (10 rounds)
   - Password strength validation
   - Password reset tokens with expiration

### API Security

1. **Rate Limiting**
   - Configurable limits per endpoint
   - Redis-based (production) or in-memory (development)
   - IP-based tracking

2. **Input Validation**
   - Zod schema validation on all inputs
   - SQL injection prevention (Prisma ORM)
   - XSS protection (React auto-escaping)

3. **CORS Configuration**
   - Whitelisted origins
   - Credential support
   - Method restrictions

### Data Security

1. **ID Obfuscation**
   - Padded user IDs (10000000001 format)
   - Prevents enumeration attacks
   - Amazon-style order IDs (ready for Phase 2)

2. **File Upload Security**
   - MIME type validation
   - Magic bytes verification
   - File size limits (5MB)
   - Path traversal prevention
   - Sanitized filenames

3. **Audit Logging**
   - Winston logger for all actions
   - User action tracking
   - Error monitoring (Sentry)

---

## ⚡ Performance Optimization

### Database Optimization

1. **Indexes**
   - FULLTEXT index on `Product(name, description)`
   - Regular indexes on `price`, `createdAt`, `category`, `issale`
   - Foreign key indexes auto-created by Prisma

2. **Query Optimization**
   - Pagination to limit result sets
   - Select only required fields
   - Efficient JOIN operations

3. **Connection Pooling**
   - Prisma connection pool
   - Singleton pattern for client

### Frontend Optimization

1. **Code Splitting**
   - Dynamic imports for heavy components
   - Route-based code splitting (Next.js default)

2. **Image Optimization**
   - Next.js Image component
   - Automatic WebP conversion
   - Lazy loading

3. **Caching Strategy**
   - Static generation where possible
   - ISR (Incremental Static Regeneration)
   - Client-side caching (React Query ready)

### API Optimization

1. **Response Compression**
   - Gzip/Brotli compression
   - Minified JSON responses

2. **Debouncing**
   - Search input debounced (300ms)
   - Autocomplete debounced (200ms)

3. **Pagination**
   - Cursor-based pagination ready
   - Page-based pagination implemented
   - Configurable page sizes

---

## 📈 Scalability Considerations

### Horizontal Scaling

**Current State:**
- Single Next.js instance
- MySQL database
- Optional Redis for rate limiting

**Future Scaling Path:**

1. **Load Balancing**
   ```
   [Load Balancer]
        ↓
   [Next.js Instance 1]  [Next.js Instance 2]  [Next.js Instance 3]
        ↓                      ↓                      ↓
              [Shared MySQL Database]
                       ↓
                 [Redis Cluster]
   ```

2. **Database Scaling**
   - Read replicas for heavy read operations
   - Database connection pooling
   - Query caching (Redis)

3. **File Storage Scaling**
   - Move to object storage (S3, Google Cloud Storage)
   - CDN for static assets
   - Image optimization service

### Vertical Scaling

**Optimization Points:**

1. **Memory Usage**
   - Efficient state management
   - Garbage collection optimization
   - Memory leak prevention

2. **CPU Optimization**
   - Async operations
   - Worker threads for heavy tasks
   - Caching frequently accessed data

3. **Database Performance**
   - Query optimization
   - Index tuning
   - Connection pool sizing

### Monitoring & Observability

**Current:**
- Winston logging
- Sentry error tracking
- Console logs (development)

**Future:**
- APM (Application Performance Monitoring)
- Database query monitoring
- Real-time metrics dashboard
- Alerts for critical errors

---

## 🔍 API Versioning Strategy

**Current:** `/api/v1/*`

**Future Versions:**
- Breaking changes → `/api/v2/*`
- Maintain v1 for backward compatibility
- Deprecation warnings in headers
- Migration guides for clients

---

## 📊 Testing Strategy

### Unit Tests
- Utility functions
- Validation schemas
- Business logic

### Integration Tests (Future)
- API endpoints
- Database operations
- External service integration

### E2E Tests (Future)
- Critical user flows
- Checkout process
- Authentication flow

**Current Coverage:**
- ✅ 59 unit tests (100% passing)
- ⏳ Integration tests (planned)
- ⏳ E2E tests (planned)

---

## 🚀 Deployment Architecture

### Vercel (Recommended)

```
[GitHub Repository]
       ↓
[Vercel Build]
       ↓
[Next.js Edge/Node Runtime]
       ↓
[MySQL Database] ← External (PlanetScale, Railway, etc.)
       ↓
[Redis] ← Optional (Upstash, Redis Cloud)
```

### Self-Hosted (Alternative)

```
[CI/CD Pipeline]
       ↓
[Docker Container] or [Node.js Server]
       ↓
[Reverse Proxy] (Nginx/Apache)
       ↓
[MySQL Database]
[Redis Cache]
```

---

## 📚 Additional Resources

- [Quick Start Guide](../00-getting-started/QUICK_START.md)
- [Developer Setup](../00-getting-started/DEVELOPER_SETUP.md)
- [Security Documentation](../02-security/SECURITY_IMPROVEMENTS.md)
- [API Documentation](../03-development/API_RESPONSE_STANDARDS.md)
- [Testing Setup](../03-development/TESTING_SETUP_GUIDE.md)

---

**Maintained by:** PKM Shop Development Team
**Last Review:** 2025-11-07
**Next Review:** Quarterly
