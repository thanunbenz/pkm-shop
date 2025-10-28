import { z } from "zod";

// Register Schema
export const registerSchema = z.object({
  fname: z
    .string()
    .min(2, "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร")
    .max(50, "ชื่อต้องไม่เกิน 50 ตัวอักษร")
    .regex(/^[a-zA-Zก-๙\s]+$/, "ชื่อต้องเป็นตัวอักษรเท่านั้น"),

  lname: z
    .string()
    .min(2, "นามสกุลต้องมีอย่างน้อย 2 ตัวอักษร")
    .max(50, "นามสกุลต้องไม่เกิน 50 ตัวอักษร")
    .regex(/^[a-zA-Zก-๙\s]+$/, "นามสกุลต้องเป็นตัวอักษรเท่านั้น"),

  email: z
    .string()
    .email("รูปแบบอีเมลไม่ถูกต้อง")
    .toLowerCase()
    .trim(),

  password: z
    .string()
    .min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร")
    .max(100, "รหัสผ่านต้องไม่เกิน 100 ตัวอักษร")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "รหัสผ่านต้องมีตัวพิมพ์เล็ก พิมพ์ใหญ่ และตัวเลข"
    ),

  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "รหัสผ่านไม่ตรงกัน",
  path: ["confirmPassword"],
});

// Login Schema
export const loginSchema = z.object({
  email: z
    .string()
    .email("รูปแบบอีเมลไม่ถูกต้อง")
    .toLowerCase()
    .trim(),

  password: z
    .string()
    .min(1, "กรุณาใส่รหัสผ่าน"),
});

// Update Profile Schema
export const updateProfileSchema = z.object({
  fname: z
    .string()
    .min(2, "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร")
    .max(50, "ชื่อต้องไม่เกิน 50 ตัวอักษร")
    .optional(),

  lname: z
    .string()
    .min(2, "นามสกุลต้องมีอย่างน้อย 2 ตัวอักษร")
    .max(50, "นามสกุลต้องไม่เกิน 50 ตัวอักษร")
    .optional(),

  email: z
    .string()
    .email("รูปแบบอีเมลไม่ถูกต้อง")
    .toLowerCase()
    .trim()
    .optional(),
});

// Change Password Schema
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "กรุณาใส่รหัสผ่านปัจจุบัน"),

  newPassword: z
    .string()
    .min(8, "รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร")
    .max(100, "รหัสผ่านใหม่ต้องไม่เกิน 100 ตัวอักษร")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "รหัสผ่านใหม่ต้องมีตัวพิมพ์เล็ก พิมพ์ใหญ่ และตัวเลข"
    ),

  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "รหัสผ่านใหม่ไม่ตรงกัน",
  path: ["confirmNewPassword"],
});

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
