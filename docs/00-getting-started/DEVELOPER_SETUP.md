# Developer Setup Guide - PKM Shop

**Complete guide for setting up PKM Shop development environment**

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Development Tools](#development-tools)
- [Project Structure](#project-structure)
- [Common Tasks](#common-tasks)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required

- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **npm** 9.x or higher (comes with Node.js)
- **MySQL** 8.0 or higher ([Download](https://dev.mysql.com/downloads/mysql/))
- **Git** ([Download](https://git-scm.com/downloads))

### Recommended

- **VS Code** with extensions:
  - ESLint
  - Prettier
  - Prisma
  - Tailwind CSS IntelliSense
- **Docker** (optional, for Redis/MySQL containers)
- **Postman** or **Insomnia** (for API testing)

### Verify Installation

```bash
node --version    # Should be 18.x or higher
npm --version     # Should be 9.x or higher
mysql --version   # Should be 8.0 or higher
git --version     # Any recent version
```

---

## Installation

### 1. Clone Repository

```bash
# Clone the repository
git clone <repository-url> pkm-shop
cd pkm-shop

# Check current branch
git branch
```

### 2. Install Dependencies

```bash
# Install all dependencies
npm install

# This installs:
# - Next.js and React
# - Prisma (database ORM)
# - NextAuth.js (authentication)
# - Zod (validation)
# - Winston (logging)
# - And 50+ other packages
```

**Installation Time:** ~2-3 minutes (depending on internet speed)

---

## Environment Configuration

### 1. Create Environment File

```bash
# Copy the example environment file
cp .env.example .env
```

### 2. Configure Required Variables

Edit `.env` file and set these **REQUIRED** variables:

#### Database Configuration

```bash
# MySQL connection string
# Format: mysql://username:password@host:port/database
DATABASE_URL="mysql://root:your_password@localhost:3306/pkm_shop"
```

#### Authentication

```bash
# Generate a secure secret key
# Run this command to generate: openssl rand -base64 32
NEXTAUTH_SECRET="your-generated-secret-key-here"

# Application URL
NEXTAUTH_URL="http://localhost:3000"
```

#### Email Configuration

```bash
# Get API key from https://resend.com
# Free tier includes 3,000 emails/month
RESEND_API_KEY="re_your_resend_api_key_here"

# Sender email (must be verified domain in Resend)
EMAIL_FROM="noreply@yourdomain.com"
```

### 3. Optional Configuration

#### Redis Rate Limiting (Recommended for Production)

```bash
# Option 1: Upstash Redis (serverless, free tier available)
# Get from https://console.upstash.com
UPSTASH_REDIS_REST_URL="https://your-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token-here"

# Option 2: Traditional Redis
REDIS_URL="redis://localhost:6379"
```

#### CORS Configuration

```bash
# Comma-separated list of allowed origins
# Not needed for development (localhost auto-allowed)
ALLOWED_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"
```

#### Session Configuration (Optional)

```bash
# All have sensible defaults in code
SESSION_MAX_AGE=2592000              # 30 days
SESSION_UPDATE_AGE=86400             # 24 hours
SESSION_IDLE_TIMEOUT=604800000       # 7 days
```

### 4. Generate NEXTAUTH_SECRET

```bash
# On macOS/Linux
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Or use online generator
# https://auth-secret-gen.vercel.app
```

### 5. Verify Configuration

```bash
# Start the server to check for validation errors
npm run dev

# Look for startup validation messages
# ✅ All environment variables validated
# ✅ Database connection successful
# ✅ Redis connection successful (if configured)
```

---

## Database Setup

### Option 1: Local MySQL (Recommended for Development)

#### 1. Start MySQL Server

```bash
# macOS (with Homebrew)
brew services start mysql

# Linux
sudo systemctl start mysql

# Windows
# Start MySQL from Services or MySQL Workbench
```

#### 2. Create Database

```bash
# Connect to MySQL
mysql -u root -p

# Create database
CREATE DATABASE pkm_shop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Create user (optional)
CREATE USER 'pkm_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON pkm_shop.* TO 'pkm_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### 3. Run Migrations

```bash
# Run all database migrations
npx prisma migrate dev

# This will:
# - Create all tables
# - Set up indexes
# - Add CHECK constraints
# - Set up relationships
```

#### 4. Seed Database (Optional)

```bash
# Populate database with sample data
npm run seed

# This creates:
# - Admin user (admin@pkmshop.com / admin123)
# - Sample products
# - Sample categories
# - Test data for development
```

### Option 2: Docker MySQL (Alternative)

```bash
# Start MySQL in Docker
docker run -d \
  --name pkm-mysql \
  -e MYSQL_ROOT_PASSWORD=root_password \
  -e MYSQL_DATABASE=pkm_shop \
  -e MYSQL_USER=pkm_user \
  -e MYSQL_PASSWORD=pkm_password \
  -p 3306:3306 \
  mysql:8.0

# Wait for MySQL to start (30 seconds)
sleep 30

# Update .env
DATABASE_URL="mysql://pkm_user:pkm_password@localhost:3306/pkm_shop"

# Run migrations
npx prisma migrate dev
```

### Verify Database Setup

```bash
# Open Prisma Studio (database GUI)
npx prisma studio

# Opens at http://localhost:5555
# Browse tables, view data, make changes
```

---

## Running the Application

### Development Mode

```bash
# Start development server with hot reload
npm run dev

# Server starts at http://localhost:3000
# API available at http://localhost:3000/api/v1
# API docs at http://localhost:3000/api-docs
```

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm run start

# Production mode runs at http://localhost:3000
```

### Different Port

```bash
# Run on different port
PORT=3001 npm run dev
```

---

## Development Tools

### Prisma Studio (Database GUI)

```bash
# Open database management interface
npx prisma studio

# Access at http://localhost:5555
```

### ESLint (Code Linting)

```bash
# Check code quality
npm run lint

# Auto-fix issues
npm run lint -- --fix
```

### TypeScript Type Checking

```bash
# Check types without building
npx tsc --noEmit
```

### Prisma Commands

```bash
# Generate Prisma Client
npx prisma generate

# Create new migration
npx prisma migrate dev --name description

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# View migration status
npx prisma migrate status

# Format schema file
npx prisma format
```

---

## Project Structure

```
pkm-shop/
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── (main)/            # Main site pages
│   │   ├── (dashboard)/       # Admin dashboard
│   │   ├── api/               # API routes
│   │   │   └── v1/           # API v1 endpoints
│   │   └── api-docs/          # Swagger UI
│   ├── components/            # React components
│   │   └── ui/               # Reusable UI components
│   ├── config/                # Configuration files
│   │   ├── app-constants.ts  # App constants
│   │   ├── cors.ts           # CORS configuration
│   │   └── i18n/             # Internationalization
│   ├── lib/                   # Utility libraries
│   │   ├── redis/            # Redis client & rate limiter
│   │   ├── utils/            # Utility functions
│   │   ├── logger.ts         # Winston logger
│   │   └── startup-validation.ts
│   ├── types/                 # TypeScript types
│   ├── hooks/                 # React hooks
│   └── features/              # Feature modules
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # Database migrations
│   └── seed.ts                # Database seeder
├── public/                    # Static files
│   └── uploads/               # User uploads
├── docs/                      # Documentation
│   ├── 00-getting-started/   # Setup guides
│   ├── 01-project/           # Project info
│   ├── 02-security/          # Security docs
│   ├── 03-development/       # Development guides
│   └── issues/               # Issue tracking
├── tests/                     # Test files
│   ├── unit/                 # Unit tests
│   └── integration/          # Integration tests
├── .env                       # Environment variables (git ignored)
├── .env.example               # Environment template
├── middleware.ts              # Next.js middleware
├── next.config.js             # Next.js configuration
├── tailwind.config.js         # Tailwind CSS config
├── tsconfig.json              # TypeScript config
└── package.json               # Dependencies
```

---

## Common Tasks

### Creating a New API Endpoint

1. **Create route file:**

```typescript
// src/app/api/v1/your-endpoint/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/utils/api-response';

export async function GET(request: NextRequest) {
  const session = await getSession(request);

  if (!session) {
    return unauthorizedResponse();
  }

  // Your logic here
  const data = await fetchData();

  return successResponse(data);
}
```

2. **Add to OpenAPI spec** (`src/lib/swagger/openapi-spec.ts`)

### Creating a New Database Table

1. **Update Prisma schema:**

```prisma
// prisma/schema.prisma
model YourModel {
  id        String   @id @default(uuid())
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("your_table_name")
}
```

2. **Create migration:**

```bash
npx prisma migrate dev --name add_your_model
```

3. **Generate client:**

```bash
npx prisma generate
```

### Adding a New Page

```typescript
// src/app/(main)/your-page/page.tsx
export default function YourPage() {
  return (
    <div>
      <h1>Your Page</h1>
    </div>
  );
}
```

### Adding Authentication to a Page

```typescript
// src/app/(main)/protected/page.tsx
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/options';

export default async function ProtectedPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return <div>Protected Content</div>;
}
```

---

## Testing

### Run All Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- src/lib/validation.test.ts

# Run with coverage
npm test -- --coverage
```

### Test Structure

```
tests/
├── unit/              # Unit tests
│   └── lib/
│       ├── validation.test.ts
│       └── startup-validation.test.ts
└── integration/       # Integration tests (coming soon)
```

### Writing Tests

```typescript
// tests/unit/your-module.test.ts
import { describe, it, expect } from 'vitest';
import { yourFunction } from '@/lib/your-module';

describe('yourFunction', () => {
  it('should work correctly', () => {
    const result = yourFunction('input');
    expect(result).toBe('expected output');
  });
});
```

---

## Troubleshooting

### Database Connection Issues

**Error:** `Can't reach database server`

```bash
# Check MySQL is running
mysql -u root -p -e "SELECT 1"

# Check DATABASE_URL is correct
echo $DATABASE_URL

# Test connection
mysql -u root -p pkm_shop
```

### Port Already in Use

**Error:** `Port 3000 is already in use`

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

### Prisma Client Not Generated

**Error:** `Cannot find module '@prisma/client'`

```bash
# Generate Prisma Client
npx prisma generate

# Install dependencies
npm install
```

### Environment Variables Not Loading

**Error:** `NEXTAUTH_SECRET is required`

```bash
# Check .env file exists
ls -la .env

# Verify file content
cat .env | grep NEXTAUTH_SECRET

# Restart development server
npm run dev
```

### Type Errors

```bash
# Check for type errors
npx tsc --noEmit

# Regenerate Prisma types
npx prisma generate

# Restart TypeScript server in VS Code
# Cmd+Shift+P -> TypeScript: Restart TS Server
```

### Redis Connection Failed

**Error:** `Redis client not available`

This is **not critical** - the application falls back to in-memory rate limiting.

To fix:

```bash
# Option 1: Set up Upstash Redis (free)
# https://console.upstash.com

# Option 2: Run Redis locally
docker run -p 6379:6379 redis:latest

# Option 3: Disable Redis (use in-memory)
ENABLE_REDIS_RATE_LIMIT=false npm run dev
```

For more troubleshooting, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

---

## Development Workflow

### Recommended Git Workflow

```bash
# 1. Create feature branch
git checkout -b feature/your-feature

# 2. Make changes
# ... edit files ...

# 3. Run tests and checks
npm test
npm run lint
npx tsc --noEmit

# 4. Commit changes
git add .
git commit -m "feat: your feature description"

# 5. Push to remote
git push origin feature/your-feature

# 6. Create pull request
```

### Code Style

- Use TypeScript for all new files
- Follow ESLint rules (`npm run lint`)
- Use Prettier for formatting
- Add JSDoc comments for functions
- Write tests for new features

### Commit Message Convention

```
type(scope): description

feat: new feature
fix: bug fix
docs: documentation
style: formatting
refactor: code restructuring
test: adding tests
chore: maintenance
```

---

## Next Steps

Now that you have the development environment set up:

1. **Explore the codebase:**
   - Read [Architecture Overview](../01-project/ARCHITECTURE.md)
   - Review [API Documentation](http://localhost:3000/api-docs)
   - Check [Project Structure](../01-project/PROJECT_STRUCTURE.md)

2. **Learn about features:**
   - [Authentication System](../03-development/AUTHENTICATION.md)
   - [Rate Limiting](../03-development/REDIS_RATE_LIMITER.md)
   - [Internationalization](../03-development/I18N_IMPLEMENTATION.md)
   - [API Response Standards](../03-development/API_RESPONSE_STANDARDS.md)

3. **Start developing:**
   - Pick an issue from [TODO.md](../../TODO.md)
   - Read [Contributing Guide](../01-project/CONTRIBUTING.md)
   - Join the development chat (if available)

---

## Additional Resources

- [Quick Start Guide](QUICK_START.md) - Get running in 5 minutes
- [Troubleshooting Guide](TROUBLESHOOTING.md) - Common issues
- [Architecture Documentation](../01-project/ARCHITECTURE.md) - System design
- [API Documentation](http://localhost:3000/api-docs) - Interactive API docs
- [Security Guide](../02-security/SECURITY_IMPROVEMENTS.md) - Security best practices
- [Deployment Guide](../03-development/DEPLOYMENT.md) - Production deployment

---

## Getting Help

- 📖 Check [Documentation](../README.md)
- 🐛 Review [Troubleshooting Guide](TROUBLESHOOTING.md)
- 💬 Ask in team chat (if available)
- 🚀 Open an issue on GitHub

---

**Last Updated:** 2025-01-06
**Version:** 1.0.0
**Estimated Setup Time:** 15-30 minutes
