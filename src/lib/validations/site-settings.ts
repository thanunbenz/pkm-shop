import { z } from "zod";

// Site Settings Update Schema
export const siteSettingsUpdateSchema = z.object({
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
});

// Type export
export type SiteSettingsUpdateInput = z.infer<typeof siteSettingsUpdateSchema>;
