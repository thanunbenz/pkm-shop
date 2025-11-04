/**
 * Audit Logging Utilities
 *
 * Provides comprehensive audit trail for all admin operations.
 * Tracks CREATE, UPDATE, DELETE, LOGIN, LOGOUT, APPROVE, REJECT, and DELIVER actions.
 *
 * Usage:
 * ```typescript
 * import { logAudit, AuditAction } from '@/lib/utils/audit-logger';
 *
 * await logAudit({
 *   userId: session.user.id,
 *   action: AuditAction.UPDATE,
 *   resource: 'Product',
 *   resourceId: product.id.toString(),
 *   description: `Updated product: ${product.name}`,
 *   metadata: { changes: { price: { old: 100, new: 150 } } },
 *   ipAddress: getClientIp(request),
 *   userAgent: request.headers.get('user-agent') || undefined,
 * });
 * ```
 */

import prisma from '@/lib/db';
import logger from '@/lib/logger';

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  DELIVER = 'DELIVER',
}

export interface AuditLogData {
  userId: number | string;
  action: AuditAction;
  resource: string;
  resourceId: string;
  description: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Log an audit event to the database
 *
 * @param data - Audit log data
 * @returns Promise<void>
 */
export async function logAudit(data: AuditLogData): Promise<void> {
  try {
    const userId = typeof data.userId === 'string' ? parseInt(data.userId) : data.userId;

    await prisma.auditLog.create({
      data: {
        userId,
        action: data.action,
        resource: data.resource,
        resourceId: data.resourceId,
        description: data.description,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });

    // Also log to application logger for immediate visibility
    logger.info('Audit Log', {
      userId,
      action: data.action,
      resource: data.resource,
      resourceId: data.resourceId,
      description: data.description,
      ipAddress: data.ipAddress,
    });
  } catch (error) {
    // Log error but don't throw - audit logging should not break operations
    logger.error('Failed to create audit log', {
      error: error instanceof Error ? error.message : 'Unknown error',
      data,
    });
  }
}

/**
 * Log a CREATE action
 */
export async function logCreate(
  userId: number | string,
  resource: string,
  resourceId: string,
  description: string,
  metadata?: Record<string, any>,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  return logAudit({
    userId,
    action: AuditAction.CREATE,
    resource,
    resourceId,
    description,
    metadata,
    ipAddress,
    userAgent,
  });
}

/**
 * Log an UPDATE action
 */
export async function logUpdate(
  userId: number | string,
  resource: string,
  resourceId: string,
  description: string,
  metadata?: Record<string, any>,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  return logAudit({
    userId,
    action: AuditAction.UPDATE,
    resource,
    resourceId,
    description,
    metadata,
    ipAddress,
    userAgent,
  });
}

/**
 * Log a DELETE action
 */
export async function logDelete(
  userId: number | string,
  resource: string,
  resourceId: string,
  description: string,
  metadata?: Record<string, any>,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  return logAudit({
    userId,
    action: AuditAction.DELETE,
    resource,
    resourceId,
    description,
    metadata,
    ipAddress,
    userAgent,
  });
}

/**
 * Log a LOGIN action
 */
export async function logLogin(
  userId: number | string,
  description: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  return logAudit({
    userId,
    action: AuditAction.LOGIN,
    resource: 'User',
    resourceId: userId.toString(),
    description,
    ipAddress,
    userAgent,
  });
}

/**
 * Log a LOGOUT action
 */
export async function logLogout(
  userId: number | string,
  description: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  return logAudit({
    userId,
    action: AuditAction.LOGOUT,
    resource: 'User',
    resourceId: userId.toString(),
    description,
    ipAddress,
    userAgent,
  });
}

/**
 * Log an APPROVE action (for payment verification, order approval, etc.)
 */
export async function logApprove(
  userId: number | string,
  resource: string,
  resourceId: string,
  description: string,
  metadata?: Record<string, any>,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  return logAudit({
    userId,
    action: AuditAction.APPROVE,
    resource,
    resourceId,
    description,
    metadata,
    ipAddress,
    userAgent,
  });
}

/**
 * Log a REJECT action (for payment rejection, order cancellation, etc.)
 */
export async function logReject(
  userId: number | string,
  resource: string,
  resourceId: string,
  description: string,
  metadata?: Record<string, any>,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  return logAudit({
    userId,
    action: AuditAction.REJECT,
    resource,
    resourceId,
    description,
    metadata,
    ipAddress,
    userAgent,
  });
}

/**
 * Log a DELIVER action (for code delivery)
 */
export async function logDeliver(
  userId: number | string,
  resource: string,
  resourceId: string,
  description: string,
  metadata?: Record<string, any>,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  return logAudit({
    userId,
    action: AuditAction.DELIVER,
    resource,
    resourceId,
    description,
    metadata,
    ipAddress,
    userAgent,
  });
}

/**
 * Helper to get client IP from request
 */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  return 'unknown';
}

/**
 * Retrieve audit logs with filtering and pagination
 *
 * @param options - Query options
 * @returns Promise with audit logs and total count
 */
export async function getAuditLogs(options: {
  userId?: number;
  action?: AuditAction;
  resource?: string;
  resourceId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}): Promise<{ logs: any[]; total: number }> {
  const {
    userId,
    action,
    resource,
    resourceId,
    startDate,
    endDate,
    limit = 50,
    offset = 0,
  } = options;

  const where: any = {};

  if (userId !== undefined) {
    where.userId = userId;
  }

  if (action) {
    where.action = action;
  }

  if (resource) {
    where.resource = resource;
  }

  if (resourceId) {
    where.resourceId = resourceId;
  }

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) {
      where.createdAt.gte = startDate;
    }
    if (endDate) {
      where.createdAt.lte = endDate;
    }
  }

  try {
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          user: {
            select: {
              id: true,
              fname: true,
              lname: true,
              email: true,
              role: true,
            },
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return { logs, total };
  } catch (error) {
    logger.error('Failed to retrieve audit logs', {
      error: error instanceof Error ? error.message : 'Unknown error',
      options,
    });
    throw error;
  }
}

/**
 * Get audit logs for a specific resource
 */
export async function getResourceAuditLogs(
  resource: string,
  resourceId: string,
  limit: number = 50
): Promise<any[]> {
  try {
    return await prisma.auditLog.findMany({
      where: {
        resource,
        resourceId,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            fname: true,
            lname: true,
            email: true,
            role: true,
          },
        },
      },
    });
  } catch (error) {
    logger.error('Failed to retrieve resource audit logs', {
      error: error instanceof Error ? error.message : 'Unknown error',
      resource,
      resourceId,
    });
    return [];
  }
}

/**
 * Get recent audit logs for a user
 */
export async function getUserAuditLogs(
  userId: number,
  limit: number = 50
): Promise<any[]> {
  try {
    return await prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            fname: true,
            lname: true,
            email: true,
            role: true,
          },
        },
      },
    });
  } catch (error) {
    logger.error('Failed to retrieve user audit logs', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId,
    });
    return [];
  }
}

/**
 * Get audit log statistics
 */
export async function getAuditStats(startDate?: Date, endDate?: Date): Promise<{
  totalLogs: number;
  byAction: Record<string, number>;
  byResource: Record<string, number>;
  byUser: Array<{ userId: number; userName: string; count: number }>;
}> {
  const where: any = {};

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) {
      where.createdAt.gte = startDate;
    }
    if (endDate) {
      where.createdAt.lte = endDate;
    }
  }

  try {
    const [totalLogs, actionStats, resourceStats, userStats] = await Promise.all([
      prisma.auditLog.count({ where }),

      prisma.auditLog.groupBy({
        by: ['action'],
        where,
        _count: true,
      }),

      prisma.auditLog.groupBy({
        by: ['resource'],
        where,
        _count: true,
      }),

      prisma.auditLog.groupBy({
        by: ['userId'],
        where,
        _count: true,
        orderBy: { _count: { userId: 'desc' } },
        take: 10,
      }),
    ]);

    // Get user details for top users
    const userIds = userStats.map((stat) => stat.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, fname: true, lname: true },
    });

    const userMap = new Map(users.map((u) => [u.id, `${u.fname} ${u.lname}`]));

    return {
      totalLogs,
      byAction: Object.fromEntries(
        actionStats.map((stat) => [stat.action, stat._count])
      ),
      byResource: Object.fromEntries(
        resourceStats.map((stat) => [stat.resource, stat._count])
      ),
      byUser: userStats.map((stat) => ({
        userId: stat.userId,
        userName: userMap.get(stat.userId) || 'Unknown',
        count: stat._count,
      })),
    };
  } catch (error) {
    logger.error('Failed to retrieve audit statistics', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}
