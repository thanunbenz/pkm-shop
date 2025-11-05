import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { validateEmailConfig, getEnvInfo } from '@/lib/startup-validation';

describe('Startup Validation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment for each test
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

    it('should throw error in production without API key', () => {
      process.env.NODE_ENV = 'production';
      delete process.env.RESEND_API_KEY;

      expect(() => validateEmailConfig()).toThrow('RESEND_API_KEY is required');
    });
  });

  describe('getEnvInfo', () => {
    it('should return environment info', () => {
      process.env.JWT_SECRET = 'test-secret';
      process.env.DATABASE_URL = 'mysql://test';
      process.env.RESEND_API_KEY = 're_test_key';

      const info = getEnvInfo();

      expect(info.hasJwtSecret).toBe(true);
      expect(info.hasDatabaseUrl).toBe(true);
      expect(info.hasResendApiKey).toBe(true);
    });

    it('should detect missing environment variables', () => {
      delete process.env.JWT_SECRET;
      delete process.env.RESEND_API_KEY;

      const info = getEnvInfo();

      expect(info.hasJwtSecret).toBe(false);
      expect(info.hasResendApiKey).toBe(false);
    });

    it('should include NODE_ENV in info', () => {
      process.env.NODE_ENV = 'test';

      const info = getEnvInfo();

      expect(info.nodeEnv).toBe('test');
    });
  });
});
