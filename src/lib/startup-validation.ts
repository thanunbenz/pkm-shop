/**
 * Startup Validation Utility
 *
 * Validates required environment variables at application startup
 * to fail fast instead of failing at runtime.
 *
 * Related Issues:
 * - Issue #65: Hardcoded JWT Secret Fallback
 * - Issue #66: Email API Key Not Validated at Startup
 * - Issue #67: Replace console.log with logger
 */

import logger from './logger';

interface EnvValidationResult {
  isValid: boolean;
  missingVars: string[];
  errors: string[];
}

/**
 * Required environment variables for production
 */
const REQUIRED_ENV_VARS = {
  // Authentication
  JWT_SECRET: 'JWT_SECRET is required for secure authentication',
  NEXTAUTH_SECRET: 'NEXTAUTH_SECRET is required for NextAuth.js',
  NEXTAUTH_URL: 'NEXTAUTH_URL is required for NextAuth.js callbacks',

  // Database
  DATABASE_URL: 'DATABASE_URL is required for database connection',

  // Email (Optional in development, required in production)
  RESEND_API_KEY: 'RESEND_API_KEY is required for sending emails',
} as const;

/**
 * Optional environment variables (warnings only)
 */
const OPTIONAL_ENV_VARS = {
  EMAIL_FROM: 'EMAIL_FROM is recommended for email sender address',
  EMAIL_SUPPORT: 'EMAIL_SUPPORT is recommended for support email',
} as const;

/**
 * Validate all required environment variables
 *
 * @throws Error if critical environment variables are missing
 */
export function validateRequiredEnvVars(): EnvValidationResult {
  const missingVars: string[] = [];
  const errors: string[] = [];

  // Check required variables
  for (const [key, description] of Object.entries(REQUIRED_ENV_VARS)) {
    if (!process.env[key]) {
      // In development, RESEND_API_KEY is optional (will use console logging)
      if (key === 'RESEND_API_KEY' && process.env.NODE_ENV === 'development') {
        logger.warn(`${description} (optional in development)`, { envVar: key });
        continue;
      }

      missingVars.push(key);
      errors.push(description);
    }
  }

  // Check optional variables (warnings only)
  for (const [key, description] of Object.entries(OPTIONAL_ENV_VARS)) {
    if (!process.env[key]) {
      logger.warn(description, { envVar: key, optional: true });
    }
  }

  const isValid = missingVars.length === 0;

  if (!isValid) {
    const errorMessage = [
      '❌ Missing required environment variables:',
      '',
      ...missingVars.map(key => `  - ${key}: ${REQUIRED_ENV_VARS[key as keyof typeof REQUIRED_ENV_VARS]}`),
      '',
      '📝 Please check your .env file or environment configuration.',
      '   See .env.example for reference.',
    ].join('\n');

    throw new Error(errorMessage);
  }

  return { isValid, missingVars, errors };
}

/**
 * Validate environment variables on module load (for constants.ts)
 * This runs immediately when the module is imported
 */
export function validateEnvOnStartup() {
  try {
    validateRequiredEnvVars();
    logger.info('Environment variables validation passed');
  } catch (error) {
    logger.error('Environment validation failed', {
      error: error instanceof Error ? error.message : 'Unknown validation error',
    });

    // In production, exit the process
    if (process.env.NODE_ENV === 'production') {
      logger.error('Cannot start application without required environment variables');
      process.exit(1);
    } else {
      // In development, just warn but allow to continue
      logger.warn('Development mode: Continuing despite missing environment variables');
    }
  }
}

/**
 * Validate email configuration specifically
 */
export function validateEmailConfig(): boolean {
  if (!process.env.RESEND_API_KEY) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'RESEND_API_KEY is required in production for sending emails. ' +
        'Please set it in your environment variables.'
      );
    }
    logger.warn('RESEND_API_KEY not set - emails will not be sent', {
      nodeEnv: process.env.NODE_ENV,
    });
    return false;
  }

  // Validate API key format (Resend keys start with "re_")
  if (!process.env.RESEND_API_KEY.startsWith('re_')) {
    logger.warn('RESEND_API_KEY format looks invalid (should start with "re_")', {
      keyPrefix: process.env.RESEND_API_KEY.substring(0, 3),
    });
    return false;
  }

  return true;
}

/**
 * Get environment info for debugging
 */
export function getEnvInfo() {
  return {
    nodeEnv: process.env.NODE_ENV,
    hasJwtSecret: !!process.env.JWT_SECRET,
    hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    hasResendApiKey: !!process.env.RESEND_API_KEY,
    hasEmailFrom: !!process.env.EMAIL_FROM,
    hasEmailSupport: !!process.env.EMAIL_SUPPORT,
  };
}
