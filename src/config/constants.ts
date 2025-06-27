export const APP_NAME = 'Pokémon TCG Live Code Store';
export const APP_DESCRIPTION = 'Buy Pokémon TCG Live codes securely with various payment methods.';

export const API_VERSION = 'v1';
export const API_BASE_URL = `/api/${API_VERSION}`;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PRODUCTS: '/products',
} as const;

export const AUTH_CONFIG = {
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
  SESSION_MAX_AGE: 30 * 24 * 60 * 60, // 30 days
} as const;

export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  UPLOAD_DIR: './public/uploads',
} as const; 