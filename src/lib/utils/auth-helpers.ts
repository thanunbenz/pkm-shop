import { Session } from "next-auth";

/**
 * Role hierarchy and permissions
 */
export const ROLES = {
  USER: "USER",
  OPERATOR: "OPERATOR",
  ADMIN: "ADMIN",
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];

/**
 * Check if user has staff access (OPERATOR or ADMIN)
 * Use this for most dashboard/management features
 */
export function isStaff(role?: string | null): boolean {
  return role === ROLES.OPERATOR || role === ROLES.ADMIN;
}

/**
 * Check if user is ADMIN only
 * Use this for sensitive settings/configurations
 */
export function isAdmin(role?: string | null): boolean {
  return role === ROLES.ADMIN;
}

/**
 * Check if user is OPERATOR only
 */
export function isOperator(role?: string | null): boolean {
  return role === ROLES.OPERATOR;
}

/**
 * Check if user is regular USER only
 */
export function isUser(role?: string | null): boolean {
  return role === ROLES.USER;
}

/**
 * Check if session user has staff access
 */
export function hasStaffAccess(session: Session | null): boolean {
  return session ? isStaff(session.user?.role) : false;
}

/**
 * Check if session user is ADMIN
 */
export function hasAdminAccess(session: Session | null): boolean {
  return session ? isAdmin(session.user?.role) : false;
}

/**
 * Get user role display name (Thai)
 */
export function getRoleDisplayName(role?: string | null): string {
  switch (role) {
    case ROLES.ADMIN:
      return "ผู้ดูแลระบบ";
    case ROLES.OPERATOR:
      return "พนักงาน";
    case ROLES.USER:
      return "ผู้ใช้งาน";
    default:
      return "ไม่ระบุ";
  }
}

/**
 * Permissions map for different features
 */
export const PERMISSIONS = {
  // Product management (OPERATOR & ADMIN)
  MANAGE_PRODUCTS: [ROLES.OPERATOR, ROLES.ADMIN],
  VIEW_PRODUCTS: [ROLES.OPERATOR, ROLES.ADMIN],
  CREATE_PRODUCT: [ROLES.OPERATOR, ROLES.ADMIN],
  UPDATE_PRODUCT: [ROLES.OPERATOR, ROLES.ADMIN],
  DELETE_PRODUCT: [ROLES.OPERATOR, ROLES.ADMIN],

  // Order management (OPERATOR & ADMIN)
  MANAGE_ORDERS: [ROLES.OPERATOR, ROLES.ADMIN],
  VIEW_ORDERS: [ROLES.OPERATOR, ROLES.ADMIN],
  UPDATE_ORDER_STATUS: [ROLES.OPERATOR, ROLES.ADMIN],

  // Upload files (OPERATOR & ADMIN)
  UPLOAD_FILES: [ROLES.OPERATOR, ROLES.ADMIN],
  DELETE_FILES: [ROLES.OPERATOR, ROLES.ADMIN],

  // User management (OPERATOR & ADMIN)
  VIEW_USERS: [ROLES.OPERATOR, ROLES.ADMIN],

  // System settings (ADMIN ONLY)
  MANAGE_SETTINGS: [ROLES.ADMIN],
  MANAGE_ROLES: [ROLES.ADMIN],
  VIEW_SYSTEM_LOGS: [ROLES.ADMIN],
  MANAGE_PAYMENTS: [ROLES.ADMIN],
  MANAGE_INTEGRATIONS: [ROLES.ADMIN],
} as const;

/**
 * Check if user has permission for a specific feature
 */
export function hasPermission(
  role: string | null | undefined,
  permission: keyof typeof PERMISSIONS
): boolean {
  if (!role) return false;
  return PERMISSIONS[permission].includes(role as UserRole);
}

/**
 * Get unauthorized error response
 */
export function getUnauthorizedError(requiredRole?: string) {
  return {
    error: "Unauthorized",
    message: requiredRole
      ? `This action requires ${requiredRole} role`
      : "You don't have permission to perform this action",
  };
}
