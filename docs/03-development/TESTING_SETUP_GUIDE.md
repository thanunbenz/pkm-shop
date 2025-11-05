# Testing Setup Guide - Issue #84

**Created:** 2025-01-05
**Status:** Ready to implement
**Priority:** High (moved from critical due to time constraints)
**Estimated Time:** 2-3 hours for basic setup + 10-15 days for full coverage

---

## 📋 Overview

This guide will help you set up a comprehensive testing infrastructure for the PKM Shop project.

**Current Status:** Zero test coverage
**Target:** Critical path coverage (Auth + Checkout + Payment)

---

## 🎯 Testing Strategy

### Phase 1: Basic Setup (2-3 hours) - **START HERE**
- Install testing dependencies
- Configure Vitest for Next.js 14
- Create test utilities and helpers
- Write first tests (validation utilities)

### Phase 2: Integration Tests (4-5 hours)
- Auth API tests (register, login)
- Purchase API tests (checkout flow)
- Payment verification tests

### Phase 3: Component Tests (3-4 hours)
- Profile page tests
- Cart component tests
- Form validation tests

### Phase 4: E2E Tests (Optional - 8-10 hours)
- Complete checkout flow
- Admin order management
- Payment proof upload

---

## 📦 Step 1: Install Dependencies

Run this command to install all testing dependencies:

\`\`\`bash
npm install --save-dev vitest @vitejs/plugin-react \\
  @testing-library/react @testing-library/jest-dom \\
  @testing-library/user-event jsdom \\
  @vitest/ui happy-dom
\`\`\`

**If you get permission errors**, try one of these:
\`\`\`bash
# Option 1: Fix permissions (recommended)
sudo chown -R $(whoami) node_modules

# Option 2: Clean install
rm -rf node_modules package-lock.json
npm install
npm install --save-dev [dependencies above]
\`\`\`

---

## ⚙️ Step 2: Create Vitest Configuration

Create `vitest.config.ts` in the project root:

\`\`\`typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'out'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData/',
        '.next/',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
\`\`\`

---

## 🔧 Step 3: Create Test Setup File

Create `tests/setup.ts`:

\`\`\`typescript
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock environment variables
process.env.NEXTAUTH_SECRET = 'test-secret';
process.env.NEXTAUTH_URL = 'http://localhost:3000';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.DATABASE_URL = 'mysql://test:test@localhost:3306/test';
process.env.RESEND_API_KEY = 're_test_key';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock NextAuth
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(() => ({
    data: null,
    status: 'unauthenticated',
  })),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));
\`\`\`

---

## 📝 Step 4: Update package.json Scripts

Add these scripts to `package.json`:

\`\`\`json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:run": "vitest run"
  }
}
\`\`\`

---

## 🧪 Step 5: Create Test Utilities

Create `tests/utils/test-helpers.ts`:

\`\`\`typescript
import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';

/**
 * Custom render with providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { ...options });
}

/**
 * Create mock NextRequest
 */
export function createMockRequest(
  url: string,
  init?: RequestInit & { headers?: Record<string, string> }
): Request {
  const headers = new Headers(init?.headers || {});

  return new Request(url, {
    ...init,
    headers,
  });
}

/**
 * Mock Prisma client for testing
 */
export const mockPrisma = {
  user: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  product: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  purchase: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  payment: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  $transaction: vi.fn((callback) => callback(mockPrisma)),
};

/**
 * Mock session for authenticated tests
 */
export const mockSession = {
  user: {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'USER',
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

/**
 * Mock admin session
 */
export const mockAdminSession = {
  user: {
    id: '1',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'ADMIN',
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};
\`\`\`

---

## ✅ Step 6: Write First Tests

### Example 1: Validation Tests

Create `tests/unit/lib/validations/user.test.ts`:

\`\`\`typescript
import { describe, it, expect } from 'vitest';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema
} from '@/lib/validations/user';

describe('User Validation Schemas', () => {
  describe('registerSchema', () => {
    it('should validate correct registration data', () => {
      const validData = {
        fname: 'John',
        lname: 'Doe',
        email: 'john@example.com',
        password: 'Test123!@#',
        confirmPassword: 'Test123!@#',
      };

      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject weak password', () => {
      const invalidData = {
        fname: 'John',
        lname: 'Doe',
        email: 'john@example.com',
        password: 'weak',
        confirmPassword: 'weak',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('รหัสผ่าน');
      }
    });

    it('should reject mismatched passwords', () => {
      const invalidData = {
        fname: 'John',
        lname: 'Doe',
        email: 'john@example.com',
        password: 'Test123!@#',
        confirmPassword: 'Different123!@#',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('updateProfileSchema', () => {
    it('should trim whitespace from names', () => {
      const data = {
        fname: '  John  ',
        lname: '  Doe  ',
        email: ' john@example.com ',
      };

      const result = updateProfileSchema.parse(data);
      expect(result.fname).toBe('John');
      expect(result.lname).toBe('Doe');
      expect(result.email).toBe('john@example.com');
    });

    it('should convert email to lowercase', () => {
      const data = {
        email: 'JOHN@EXAMPLE.COM',
      };

      const result = updateProfileSchema.parse(data);
      expect(result.email).toBe('john@example.com');
    });
  });
});
\`\`\`

### Example 2: Startup Validation Tests

Create `tests/unit/lib/startup-validation.test.ts`:

\`\`\`typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { validateEmailConfig, getEnvInfo } from '@/lib/startup-validation';

describe('Startup Validation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('validateEmailConfig', () => {
    it('should return true for valid Resend API key', () => {
      process.env.RESEND_API_KEY = 're_valid_key_12345';
      const result = validateEmailConfig();
      expect(result).toBe(true);
    });

    it('should return false for missing API key in development', () => {
      process.env.NODE_ENV = 'development';
      delete process.env.RESEND_API_KEY;
      const result = validateEmailConfig();
      expect(result).toBe(false);
    });

    it('should warn for invalid API key format', () => {
      process.env.RESEND_API_KEY = 'invalid_format';
      const result = validateEmailConfig();
      expect(result).toBe(false);
    });
  });

  describe('getEnvInfo', () => {
    it('should return environment info', () => {
      process.env.JWT_SECRET = 'test-secret';
      process.env.DATABASE_URL = 'mysql://test';

      const info = getEnvInfo();

      expect(info.hasJwtSecret).toBe(true);
      expect(info.hasDatabaseUrl).toBe(true);
    });
  });
});
\`\`\`

---

## 🚀 Step 7: Run Tests

\`\`\`bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run tests once (CI mode)
npm run test:run
\`\`\`

---

## 📊 Expected Results

After running the validation tests, you should see:

\`\`\`
✓ tests/unit/lib/validations/user.test.ts (8)
  ✓ User Validation Schemas (8)
    ✓ registerSchema (3)
      ✓ should validate correct registration data
      ✓ should reject weak password
      ✓ should reject mismatched passwords
    ✓ updateProfileSchema (2)
      ✓ should trim whitespace from names
      ✓ should convert email to lowercase

✓ tests/unit/lib/startup-validation.test.ts (3)
  ✓ Startup Validation (3)
    ✓ validateEmailConfig (3)
    ✓ getEnvInfo (1)

Test Files  2 passed (2)
Tests  11 passed (11)
\`\`\`

---

## 📈 Next Steps (Priority Order)

### 1. **Critical Path Tests** (4-5 hours)
- Auth API tests (register, login, session)
- Purchase creation tests
- Payment verification tests

### 2. **Component Tests** (3-4 hours)
- Profile page component
- Cart component
- Product list component

### 3. **Integration Tests** (4-5 hours)
- Complete checkout flow
- Order management flow
- Admin operations

### 4. **E2E Tests** (Optional - 8-10 hours)
- Use Playwright for full user flows
- Test critical user journeys
- Test admin workflows

---

## 🎯 Coverage Goals

**Minimum (Production-Ready):**
- ✅ Validation utilities: 100%
- ✅ Auth APIs: 80%+
- ✅ Purchase APIs: 80%+
- ✅ Payment APIs: 80%+

**Target (Quality):**
- Unit Tests: 80%+ coverage
- Integration Tests: All critical paths
- E2E Tests: 3-5 critical flows

**Full Coverage (Excellence):**
- Overall: 90%+ coverage
- All API endpoints tested
- All components tested
- All user flows tested

---

## 🐛 Troubleshooting

### Permission Errors
\`\`\`bash
sudo chown -R $(whoami) node_modules
\`\`\`

### Module Not Found
\`\`\`bash
npm install
npx prisma generate
\`\`\`

### Test Timeout
Increase timeout in vitest.config.ts:
\`\`\`typescript
test: {
  testTimeout: 10000,
}
\`\`\`

### Database Connection Errors
Mock Prisma in tests (see test-helpers.ts)

---

## 📚 Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Next.js Testing Guide](https://nextjs.org/docs/app/building-your-application/testing)
- [Test-Driven Development](https://martinfowler.com/bliki/TestDrivenDevelopment.html)

---

## ✅ Checklist

Before considering Issue #84 complete:

- [ ] Install all testing dependencies
- [ ] Configure Vitest
- [ ] Create test setup file
- [ ] Write validation tests (11+ tests)
- [ ] Write startup validation tests (3+ tests)
- [ ] All tests passing
- [ ] Coverage > 20% (basic)
- [ ] Auth API tests (5+ tests)
- [ ] Purchase API tests (5+ tests)
- [ ] Coverage > 40% (good)
- [ ] Component tests (10+ tests)
- [ ] Integration tests (10+ tests)
- [ ] Coverage > 60% (excellent)
- [ ] E2E tests (optional)
- [ ] Coverage > 80% (comprehensive)

---

**Status:** Ready to implement
**Time Required:** 2-3 hours for basic setup + tests
**Dependencies:** None (can start immediately)
**Blocker:** Requires npm install permission fix

Run the installation command above to get started!
