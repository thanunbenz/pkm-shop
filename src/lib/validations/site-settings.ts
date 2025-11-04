import { z } from "zod";

// Site Settings Update Schema
export const siteSettingsUpdateSchema = z.object({
  // Welcome Section
  welcomeTitle: z
    .string()
    .min(1, "ชื่อหัวข้อต้องมีอย่างน้อย 1 ตัวอักษร")
    .max(200, "ชื่อหัวข้อต้องไม่เกิน 200 ตัวอักษร")
    .trim()
    .optional(),

  welcomeSubtitle: z
    .string()
    .max(500, "รายละเอียดต้องไม่เกิน 500 ตัวอักษร")
    .trim()
    .nullable()
    .optional(),

  showWelcome: z
    .boolean({ message: "showWelcome ต้องเป็น boolean" })
    .optional(),

  // Email Configuration (Issue #57)
  supportEmail: z
    .string()
    .email("รูปแบบอีเมลไม่ถูกต้อง")
    .trim()
    .nullable()
    .optional(),

  enableEmailNotifications: z
    .boolean({ message: "enableEmailNotifications ต้องเป็น boolean" })
    .optional(),

  // SEO & Branding (Issue #58 - for future use)
  shopName: z
    .string()
    .min(1, "ชื่อร้านต้องมีอย่างน้อย 1 ตัวอักษร")
    .max(100, "ชื่อร้านต้องไม่เกิน 100 ตัวอักษร")
    .trim()
    .nullable()
    .optional(),

  seoTitle: z
    .string()
    .max(60, "SEO Title ต้องไม่เกิน 60 ตัวอักษร")
    .trim()
    .nullable()
    .optional(),

  seoDescription: z
    .string()
    .max(160, "SEO Description ต้องไม่เกิน 160 ตัวอักษร")
    .trim()
    .nullable()
    .optional(),

  seoKeywords: z
    .string()
    .max(255, "SEO Keywords ต้องไม่เกิน 255 ตัวอักษร")
    .trim()
    .nullable()
    .optional(),

  logoUrl: z
    .string()
    .url("รูปแบบ URL ไม่ถูกต้อง")
    .trim()
    .nullable()
    .optional(),

  faviconUrl: z
    .string()
    .url("รูปแบบ URL ไม่ถูกต้อง")
    .trim()
    .nullable()
    .optional(),

  primaryColor: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "รูปแบบสีไม่ถูกต้อง (ต้องเป็น hex เช่น #FF0000)")
    .trim()
    .nullable()
    .optional(),

  disclaimer: z
    .string()
    .max(1000, "ข้อความ disclaimer ต้องไม่เกิน 1000 ตัวอักษร")
    .trim()
    .nullable()
    .optional(),
});

// Type export
export type SiteSettingsUpdateInput = z.infer<typeof siteSettingsUpdateSchema>;
