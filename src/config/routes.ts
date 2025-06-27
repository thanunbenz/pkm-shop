import { ROUTES } from './constants';

export const publicRoutes = [
  ROUTES.HOME,
  ROUTES.LOGIN,
  ROUTES.REGISTER,
];

export const authRoutes = [
  ROUTES.LOGIN,
  ROUTES.REGISTER,
];

export const protectedRoutes = [
  ROUTES.DASHBOARD,
  ROUTES.PRODUCTS,
];

export const apiAuthPrefix = '/api/auth';

export const DEFAULT_LOGIN_REDIRECT = ROUTES.DASHBOARD; 