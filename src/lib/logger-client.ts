/**
 * Client-safe logger for browser environment
 * Falls back to console when Winston is not available
 */

// Simple console-based logger for client-side
const clientLogger = {
  error: (message: string, meta?: Record<string, unknown>) => {
    if (typeof window !== 'undefined') {
      console.error('[ERROR]', message, meta);
    }
  },

  warn: (message: string, meta?: Record<string, unknown>) => {
    if (typeof window !== 'undefined') {
      console.warn('[WARN]', message, meta);
    }
  },

  info: (message: string, meta?: Record<string, unknown>) => {
    if (typeof window !== 'undefined') {
      console.info('[INFO]', message, meta);
    }
  },

  http: (message: string, meta?: Record<string, unknown>) => {
    if (typeof window !== 'undefined') {
      console.log('[HTTP]', message, meta);
    }
  },

  debug: (message: string, meta?: Record<string, unknown>) => {
    if (typeof window !== 'undefined') {
      console.debug('[DEBUG]', message, meta);
    }
  },
};

export default clientLogger;
