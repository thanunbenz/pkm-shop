import { describe, it, expect } from 'vitest';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
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
        expect(result.error.issues.some((issue) =>
          issue.message.includes('รหัสผ่าน')
        )).toBe(true);
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
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('รหัสผ่านไม่ตรงกัน');
      }
    });

    it('should reject invalid email format', () => {
      const invalidData = {
        fname: 'John',
        lname: 'Doe',
        email: 'invalid-email',
        password: 'Test123!@#',
        confirmPassword: 'Test123!@#',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject name with special characters', () => {
      const invalidData = {
        fname: 'John@123',
        lname: 'Doe',
        email: 'john@example.com',
        password: 'Test123!@#',
        confirmPassword: 'Test123!@#',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept Thai names', () => {
      const validData = {
        fname: 'สมชาย',
        lname: 'ใจดี',
        email: 'somchai@example.com',
        password: 'Test123!@#',
        confirmPassword: 'Test123!@#',
      };

      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const validData = {
        email: 'john@example.com',
        password: 'Test123!@#',
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should convert email to lowercase', () => {
      const data = {
        email: 'JOHN@EXAMPLE.COM',
        password: 'Test123!@#',
      };

      const result = loginSchema.parse(data);
      expect(result.email).toBe('john@example.com');
    });

    it('should trim email whitespace', () => {
      const data = {
        email: '  john@example.com  ',
        password: 'Test123!@#',
      };

      const result = loginSchema.parse(data);
      expect(result.email).toBe('john@example.com');
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

    it('should allow partial updates', () => {
      const data = {
        fname: 'John',
      };

      const result = updateProfileSchema.parse(data);
      expect(result.fname).toBe('John');
      expect(result.lname).toBeUndefined();
      expect(result.email).toBeUndefined();
    });

    it('should reject empty names', () => {
      const invalidData = {
        fname: '  ',
        lname: 'Doe',
      };

      const result = updateProfileSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('changePasswordSchema', () => {
    it('should validate correct password change', () => {
      const validData = {
        currentPassword: 'OldPass123!@#',
        newPassword: 'NewPass123!@#',
        confirmNewPassword: 'NewPass123!@#',
      };

      const result = changePasswordSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject weak new password', () => {
      const invalidData = {
        currentPassword: 'OldPass123!@#',
        newPassword: 'weak',
        confirmNewPassword: 'weak',
      };

      const result = changePasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject mismatched new passwords', () => {
      const invalidData = {
        currentPassword: 'OldPass123!@#',
        newPassword: 'NewPass123!@#',
        confirmNewPassword: 'Different123!@#',
      };

      const result = changePasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('รหัสผ่านใหม่ไม่ตรงกัน');
      }
    });
  });
});
