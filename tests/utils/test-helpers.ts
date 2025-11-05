import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { vi } from 'vitest';

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
  code: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
  },
  cart: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
  },
  purchaseCode: {
    create: vi.fn(),
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

/**
 * Mock operator session
 */
export const mockOperatorSession = {
  user: {
    id: '2',
    email: 'operator@example.com',
    name: 'Operator User',
    role: 'OPERATOR',
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};
