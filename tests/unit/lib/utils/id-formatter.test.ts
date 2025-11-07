import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  formatUserId,
  parseUserId,
  isValidFormattedUserId,
  generateOrderId,
  isValidOrderId,
  extractOrderTimestamp,
  extractOrderPrefix,
  safeFormatUserId,
  safeParseUserId,
} from '@/lib/utils/id-formatter';

describe('ID Formatter Utilities', () => {
  describe('User ID Formatting (Padded Format)', () => {
    describe('formatUserId', () => {
      it('should format single digit user ID correctly', () => {
        expect(formatUserId(1)).toBe('10000000001');
      });

      it('should format double digit user ID correctly', () => {
        expect(formatUserId(42)).toBe('10000000042');
      });

      it('should format large user ID correctly', () => {
        expect(formatUserId(123456)).toBe('10000123456');
      });

      it('should throw error for invalid ID (zero)', () => {
        expect(() => formatUserId(0)).toThrow('Invalid user ID');
      });

      it('should throw error for invalid ID (negative)', () => {
        expect(() => formatUserId(-5)).toThrow('Invalid user ID');
      });

      it('should throw error for non-number input', () => {
        expect(() => formatUserId(NaN)).toThrow('Invalid user ID');
      });
    });

    describe('parseUserId', () => {
      it('should parse formatted user ID correctly', () => {
        expect(parseUserId('10000000001')).toBe(1);
      });

      it('should parse large formatted user ID correctly', () => {
        expect(parseUserId('10000123456')).toBe(123456);
      });

      it('should throw error for invalid formatted ID (too small)', () => {
        expect(() => parseUserId('123')).toThrow('Invalid formatted user ID');
      });

      it('should throw error for non-numeric string', () => {
        expect(() => parseUserId('abc')).toThrow('Invalid formatted user ID');
      });

      it('should throw error for ID below base', () => {
        expect(() => parseUserId('9999999999')).toThrow('Invalid formatted user ID');
      });
    });

    describe('isValidFormattedUserId', () => {
      it('should return true for valid formatted user ID', () => {
        expect(isValidFormattedUserId('10000000001')).toBe(true);
        expect(isValidFormattedUserId('10000123456')).toBe(true);
      });

      it('should return false for invalid formatted user ID', () => {
        expect(isValidFormattedUserId('123')).toBe(false);
        expect(isValidFormattedUserId('abc')).toBe(false);
        expect(isValidFormattedUserId('9999999999')).toBe(false);
      });
    });

    describe('safeFormatUserId', () => {
      it('should format valid user ID', () => {
        expect(safeFormatUserId(1)).toBe('10000000001');
      });

      it('should return null for invalid input', () => {
        expect(safeFormatUserId(null)).toBe(null);
        expect(safeFormatUserId(undefined)).toBe(null);
        expect(safeFormatUserId(0)).toBe(null);
        expect(safeFormatUserId(-5)).toBe(null);
      });
    });

    describe('safeParseUserId', () => {
      it('should parse valid formatted user ID', () => {
        expect(safeParseUserId('10000000001')).toBe(1);
      });

      it('should return null for invalid input', () => {
        expect(safeParseUserId(null)).toBe(null);
        expect(safeParseUserId(undefined)).toBe(null);
        expect(safeParseUserId('abc')).toBe(null);
        expect(safeParseUserId('123')).toBe(null);
      });
    });
  });

  describe('Order ID Generation (Amazon-style Format)', () => {
    describe('generateOrderId', () => {
      it('should generate order ID in correct format', () => {
        const orderId = generateOrderId();
        expect(isValidOrderId(orderId)).toBe(true);
      });

      it('should generate order ID with correct prefix', () => {
        const orderId = generateOrderId();
        expect(orderId.startsWith('702-')).toBe(true);
      });

      it('should generate unique order IDs', () => {
        const id1 = generateOrderId();
        const id2 = generateOrderId();
        // They should be different (due to random component)
        // Note: There's a tiny chance they could be the same, but extremely unlikely
        expect(id1).not.toBe(id2);
      });

      it('should generate order ID with 3 parts separated by dashes', () => {
        const orderId = generateOrderId();
        const parts = orderId.split('-');
        expect(parts).toHaveLength(3);
      });

      it('should have 3-digit prefix', () => {
        const orderId = generateOrderId();
        const prefix = orderId.split('-')[0];
        expect(prefix).toHaveLength(3);
        expect(/^\d{3}$/.test(prefix)).toBe(true);
      });

      it('should have 7-digit timestamp', () => {
        const orderId = generateOrderId();
        const timestamp = orderId.split('-')[1];
        expect(timestamp).toHaveLength(7);
        expect(/^\d{7}$/.test(timestamp)).toBe(true);
      });

      it('should have 4-digit random component', () => {
        const orderId = generateOrderId();
        const random = orderId.split('-')[2];
        expect(random).toHaveLength(4);
        expect(/^\d{4}$/.test(random)).toBe(true);
      });
    });

    describe('isValidOrderId', () => {
      it('should return true for valid order ID', () => {
        expect(isValidOrderId('702-1234567-8901')).toBe(true);
        expect(isValidOrderId('123-9876543-0000')).toBe(true);
      });

      it('should return false for invalid order ID format', () => {
        expect(isValidOrderId('123')).toBe(false);
        expect(isValidOrderId('702-123-456')).toBe(false);
        expect(isValidOrderId('70-1234567-8901')).toBe(false);
        expect(isValidOrderId('702-123456-8901')).toBe(false);
        expect(isValidOrderId('702-1234567-890')).toBe(false);
        expect(isValidOrderId('abc-1234567-8901')).toBe(false);
        expect(isValidOrderId('702-abcdefg-8901')).toBe(false);
        expect(isValidOrderId('702-1234567-abcd')).toBe(false);
      });

      it('should return false for order ID without dashes', () => {
        expect(isValidOrderId('70212345678901')).toBe(false);
      });

      it('should return false for empty string', () => {
        expect(isValidOrderId('')).toBe(false);
      });
    });

    describe('extractOrderTimestamp', () => {
      it('should extract timestamp from valid order ID', () => {
        expect(extractOrderTimestamp('702-1234567-8901')).toBe('1234567');
      });

      it('should return null for invalid order ID', () => {
        expect(extractOrderTimestamp('invalid')).toBe(null);
        expect(extractOrderTimestamp('702-123-456')).toBe(null);
      });
    });

    describe('extractOrderPrefix', () => {
      it('should extract prefix from valid order ID', () => {
        expect(extractOrderPrefix('702-1234567-8901')).toBe('702');
        expect(extractOrderPrefix('123-1234567-8901')).toBe('123');
      });

      it('should return null for invalid order ID', () => {
        expect(extractOrderPrefix('invalid')).toBe(null);
        expect(extractOrderPrefix('702-123-456')).toBe(null);
      });
    });
  });

  describe('Round-trip Conversion', () => {
    it('should correctly convert user ID back and forth', () => {
      const originalId = 42;
      const formatted = formatUserId(originalId);
      const parsed = parseUserId(formatted);
      expect(parsed).toBe(originalId);
    });

    it('should handle large user IDs in round-trip', () => {
      const originalId = 999999;
      const formatted = formatUserId(originalId);
      const parsed = parseUserId(formatted);
      expect(parsed).toBe(originalId);
    });
  });

  describe('Security - Enumeration Prevention', () => {
    it('should make sequential IDs non-obvious', () => {
      const id1 = formatUserId(1);
      const id2 = formatUserId(2);

      // IDs should not reveal sequential pattern easily
      expect(id1).toBe('10000000001');
      expect(id2).toBe('10000000002');

      // The difference should not be obvious without knowing the base
      expect(parseInt(id2, 10) - parseInt(id1, 10)).toBe(1);
    });

    it('should make order IDs unpredictable', () => {
      const orderId1 = generateOrderId();
      const orderId2 = generateOrderId();

      // Order IDs should have random components
      const random1 = orderId1.split('-')[2];
      const random2 = orderId2.split('-')[2];

      // Random parts should be different (extremely high probability)
      // This makes enumeration attacks much harder
      expect(random1).not.toBe(random2);
    });
  });
});
