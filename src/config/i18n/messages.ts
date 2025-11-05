/**
 * Internationalization (i18n) Messages
 *
 * Centralized error and success messages for Thai/English bilingual support.
 * Related: Issue #71 - Inconsistent Error Messages
 */

export type Language = "th" | "en";
export type MessageKey = keyof typeof messages.en;

/**
 * Message dictionary with Thai and English translations
 */
export const messages = {
  // English messages
  en: {
    // Authentication & Authorization
    "auth.required": "Authentication required",
    "auth.unauthorized": "You are not authorized to perform this action",
    "auth.forbidden": "Access forbidden",
    "auth.sessionExpired": "Your session has expired. Please log in again",
    "auth.invalidCredentials": "Invalid email or password",
    "auth.emailRequired": "Email is required",
    "auth.passwordRequired": "Password is required",
    "auth.emailNotFound": "No account found with this email",
    "auth.incorrectPassword": "Incorrect password",
    "auth.tooManyAttempts": "Too many login attempts. Please try again later",

    // Registration
    "register.success": "Registration successful! Welcome aboard",
    "register.emailExists": "This email is already registered. Please log in",
    "register.tooManyAttempts": "Too many registration attempts. Please try again later",
    "register.error": "Registration failed. Please try again",

    // Validation
    "validation.failed": "Validation failed",
    "validation.invalidEmail": "Invalid email format",
    "validation.invalidData": "Invalid data provided",
    "validation.firstNameRequired": "First name is required",
    "validation.firstNameTooShort": "First name must be at least 2 characters",
    "validation.lastNameRequired": "Last name is required",
    "validation.lastNameTooShort": "Last name must be at least 2 characters",
    "validation.emailRequired": "Email is required",
    "validation.emailInvalid": "Invalid email format",
    "validation.passwordRequired": "Password is required",
    "validation.passwordTooShort": "Password must be at least 8 characters",
    "validation.passwordMismatch": "Passwords do not match",
    "validation.confirmPasswordRequired": "Please confirm your password",

    // Profile
    "profile.loadError": "Failed to load profile data",
    "profile.updateSuccess": "Profile updated successfully",
    "profile.updateError": "Failed to update profile",
    "profile.noChanges": "No changes detected",
    "profile.passwordRequired": "Current password is required for email changes",

    // Products
    "product.notFound": "Product not found",
    "product.createSuccess": "Product created successfully",
    "product.createError": "Failed to create product",
    "product.updateSuccess": "Product updated successfully",
    "product.updateError": "Failed to update product",
    "product.deleteSuccess": "Product deleted successfully",
    "product.deleteError": "Failed to delete product",
    "product.outOfStock": "This product is currently out of stock",

    // Cart
    "cart.addSuccess": "Item added to cart",
    "cart.addError": "Failed to add item to cart",
    "cart.updateSuccess": "Cart updated successfully",
    "cart.updateError": "Failed to update cart",
    "cart.removeSuccess": "Item removed from cart",
    "cart.removeError": "Failed to remove item",
    "cart.syncSuccess": "Cart synchronized successfully",
    "cart.syncError": "Failed to synchronize cart",
    "cart.empty": "Your cart is empty",

    // Purchases/Orders
    "purchase.notFound": "Order not found",
    "purchase.createSuccess": "Order created successfully",
    "purchase.createError": "Failed to create order",
    "purchase.updateSuccess": "Order updated successfully",
    "purchase.updateError": "Failed to update order",
    "purchase.insufficientCodes": "Not enough codes available for this product",

    // Codes
    "code.notFound": "Code not found",
    "code.createSuccess": "Code created successfully",
    "code.createError": "Failed to create code",
    "code.updateSuccess": "Code updated successfully",
    "code.updateError": "Failed to update code",
    "code.deleteSuccess": "Code deleted successfully",
    "code.deleteError": "Failed to delete code",
    "code.alreadyExists": "This code already exists",

    // Banners
    "banner.notFound": "Banner not found",
    "banner.createSuccess": "Banner created successfully",
    "banner.createError": "Failed to create banner",
    "banner.updateSuccess": "Banner updated successfully",
    "banner.updateError": "Failed to update banner",
    "banner.deleteSuccess": "Banner deleted successfully",
    "banner.deleteError": "Failed to delete banner",

    // Upload
    "upload.success": "File uploaded successfully",
    "upload.error": "Failed to upload file",
    "upload.invalidType": "Invalid file type. Allowed types: {types}",
    "upload.tooLarge": "File too large. Maximum size: {size}MB",
    "upload.deleteSuccess": "File deleted successfully",
    "upload.deleteError": "Failed to delete file",
    "upload.rateLimitExceeded": "Upload rate limit exceeded. Please try again later",

    // Settings
    "settings.loadError": "Failed to load settings",
    "settings.updateSuccess": "Settings updated successfully",
    "settings.updateError": "Failed to update settings",

    // Rate Limiting
    "rateLimit.exceeded": "Rate limit exceeded. Please try again later",
    "rateLimit.tooManyRequests": "Too many requests. Please slow down",

    // General Errors
    "error.unexpected": "An unexpected error occurred. Please try again",
    "error.serverError": "Server error. Please try again later",
    "error.notFound": "Resource not found",
    "error.badRequest": "Bad request. Please check your input",
    "error.networkError": "Network error. Please check your connection",
    "error.timeout": "Request timeout. Please try again",

    // Success Messages
    "success.operationComplete": "Operation completed successfully",
    "success.changesSaved": "Changes saved successfully",
    "success.actionComplete": "Action completed successfully",
  },

  // Thai messages (ข้อความภาษาไทย)
  th: {
    // การยืนยันตัวตนและสิทธิ์
    "auth.required": "กรุณาเข้าสู่ระบบ",
    "auth.unauthorized": "คุณไม่มีสิทธิ์ในการดำเนินการนี้",
    "auth.forbidden": "ไม่อนุญาตให้เข้าถึง",
    "auth.sessionExpired": "เซสชันหมดอายุแล้ว กรุณาเข้าสู่ระบบอีกครั้ง",
    "auth.invalidCredentials": "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
    "auth.emailRequired": "กรุณาระบุอีเมล",
    "auth.passwordRequired": "กรุณาระบุรหัสผ่าน",
    "auth.emailNotFound": "ไม่พบอีเมลนี้ในระบบ",
    "auth.incorrectPassword": "รหัสผ่านไม่ถูกต้อง",
    "auth.tooManyAttempts": "พยายามเข้าสู่ระบบหลายครั้งเกินไป กรุณาลองใหม่ภายหลัง",

    // การลงทะเบียน
    "register.success": "ลงทะเบียนสำเร็จ! ยินดีต้อนรับ",
    "register.emailExists": "อีเมลนี้ถูกใช้งานแล้ว กรุณาเข้าสู่ระบบ",
    "register.tooManyAttempts": "พยายามลงทะเบียนหลายครั้งเกินไป กรุณาลองใหม่ภายหลัง",
    "register.error": "การลงทะเบียนล้มเหลว กรุณาลองใหม่อีกครั้ง",

    // การตรวจสอบความถูกต้อง
    "validation.failed": "การตรวจสอบความถูกต้องล้มเหลว",
    "validation.invalidEmail": "รูปแบบอีเมลไม่ถูกต้อง",
    "validation.invalidData": "ข้อมูลที่ส่งมาไม่ถูกต้อง",
    "validation.firstNameRequired": "กรุณาระบุชื่อ",
    "validation.firstNameTooShort": "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร",
    "validation.lastNameRequired": "กรุณาระบุนามสกุล",
    "validation.lastNameTooShort": "นามสกุลต้องมีอย่างน้อย 2 ตัวอักษร",
    "validation.emailRequired": "กรุณาระบุอีเมล",
    "validation.emailInvalid": "รูปแบบอีเมลไม่ถูกต้อง",
    "validation.passwordRequired": "กรุณาระบุรหัสผ่าน",
    "validation.passwordTooShort": "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร",
    "validation.passwordMismatch": "รหัสผ่านไม่ตรงกัน",
    "validation.confirmPasswordRequired": "กรุณายืนยันรหัสผ่าน",

    // โปรไฟล์
    "profile.loadError": "ไม่สามารถโหลดข้อมูลโปรไฟล์ได้",
    "profile.updateSuccess": "อัปเดตโปรไฟล์สำเร็จ",
    "profile.updateError": "ไม่สามารถอัปเดตโปรไฟล์ได้",
    "profile.noChanges": "ไม่พบการเปลี่ยนแปลงข้อมูล",
    "profile.passwordRequired": "ต้องระบุรหัสผ่านปัจจุบันเพื่อเปลี่ยนอีเมล",

    // สินค้า
    "product.notFound": "ไม่พบสินค้า",
    "product.createSuccess": "เพิ่มสินค้าสำเร็จ",
    "product.createError": "ไม่สามารถเพิ่มสินค้าได้",
    "product.updateSuccess": "อัปเดตสินค้าสำเร็จ",
    "product.updateError": "ไม่สามารถอัปเดตสินค้าได้",
    "product.deleteSuccess": "ลบสินค้าสำเร็จ",
    "product.deleteError": "ไม่สามารถลบสินค้าได้",
    "product.outOfStock": "สินค้านี้หมดสต็อกชั่วคราว",

    // ตะกร้าสินค้า
    "cart.addSuccess": "เพิ่มสินค้าลงตะกร้าแล้ว",
    "cart.addError": "ไม่สามารถเพิ่มสินค้าลงตะกร้าได้",
    "cart.updateSuccess": "อัปเดตตะกร้าสำเร็จ",
    "cart.updateError": "ไม่สามารถอัปเดตตะกร้าได้",
    "cart.removeSuccess": "ลบสินค้าออกจากตะกร้าแล้ว",
    "cart.removeError": "ไม่สามารถลบสินค้าได้",
    "cart.syncSuccess": "ซิงค์ตะกร้าสำเร็จ",
    "cart.syncError": "ไม่สามารถซิงค์ตะกร้าได้",
    "cart.empty": "ตะกร้าสินค้าว่างเปล่า",

    // คำสั่งซื้อ
    "purchase.notFound": "ไม่พบคำสั่งซื้อ",
    "purchase.createSuccess": "สร้างคำสั่งซื้อสำเร็จ",
    "purchase.createError": "ไม่สามารถสร้างคำสั่งซื้อได้",
    "purchase.updateSuccess": "อัปเดตคำสั่งซื้อสำเร็จ",
    "purchase.updateError": "ไม่สามารถอัปเดตคำสั่งซื้อได้",
    "purchase.insufficientCodes": "โค้ดสินค้านี้ไม่เพียงพอ",

    // โค้ดสินค้า
    "code.notFound": "ไม่พบโค้ด",
    "code.createSuccess": "เพิ่มโค้ดสำเร็จ",
    "code.createError": "ไม่สามารถเพิ่มโค้ดได้",
    "code.updateSuccess": "อัปเดตโค้ดสำเร็จ",
    "code.updateError": "ไม่สามารถอัปเดตโค้ดได้",
    "code.deleteSuccess": "ลบโค้ดสำเร็จ",
    "code.deleteError": "ไม่สามารถลบโค้ดได้",
    "code.alreadyExists": "โค้ดนี้มีอยู่ในระบบแล้ว",

    // แบนเนอร์
    "banner.notFound": "ไม่พบแบนเนอร์",
    "banner.createSuccess": "เพิ่มแบนเนอร์สำเร็จ",
    "banner.createError": "ไม่สามารถเพิ่มแบนเนอร์ได้",
    "banner.updateSuccess": "อัปเดตแบนเนอร์สำเร็จ",
    "banner.updateError": "ไม่สามารถอัปเดตแบนเนอร์ได้",
    "banner.deleteSuccess": "ลบแบนเนอร์สำเร็จ",
    "banner.deleteError": "ไม่สามารถลบแบนเนอร์ได้",

    // การอัปโหลดไฟล์
    "upload.success": "อัปโหลดไฟล์สำเร็จ",
    "upload.error": "ไม่สามารถอัปโหลดไฟล์ได้",
    "upload.invalidType": "ประเภทไฟล์ไม่ถูกต้อง ประเภทที่อนุญาต: {types}",
    "upload.tooLarge": "ไฟล์ใหญ่เกินไป ขนาดสูงสุด: {size}MB",
    "upload.deleteSuccess": "ลบไฟล์สำเร็จ",
    "upload.deleteError": "ไม่สามารถลบไฟล์ได้",
    "upload.rateLimitExceeded": "อัปโหลดเกินจำนวนที่กำหนด กรุณาลองใหม่ภายหลัง",

    // การตั้งค่า
    "settings.loadError": "ไม่สามารถโหลดการตั้งค่าได้",
    "settings.updateSuccess": "อัปเดตการตั้งค่าสำเร็จ",
    "settings.updateError": "ไม่สามารถอัปเดตการตั้งค่าได้",

    // การจำกัดอัตรา
    "rateLimit.exceeded": "เกินขีดจำกัดการเรียกใช้ กรุณาลองใหม่ภายหลัง",
    "rateLimit.tooManyRequests": "มีการร้องขอมากเกินไป กรุณาชะลอการใช้งาน",

    // ข้อผิดพลาดทั่วไป
    "error.unexpected": "เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง",
    "error.serverError": "เกิดข้อผิดพลาดที่เซิร์ฟเวอร์ กรุณาลองใหม่ภายหลัง",
    "error.notFound": "ไม่พบข้อมูลที่ต้องการ",
    "error.badRequest": "คำขอไม่ถูกต้อง กรุณาตรวจสอบข้อมูล",
    "error.networkError": "เกิดข้อผิดพลาดเครือข่าย กรุณาตรวจสอบการเชื่อมต่อ",
    "error.timeout": "คำขอหมดเวลา กรุณาลองใหม่อีกครั้ง",

    // ข้อความความสำเร็จ
    "success.operationComplete": "ดำเนินการสำเร็จ",
    "success.changesSaved": "บันทึกการเปลี่ยนแปลงสำเร็จ",
    "success.actionComplete": "ดำเนินการเสร็จสมบูรณ์",
  },
} as const;

/**
 * Type-safe message keys grouped by category for easy reference
 */
export const MessageCategories = {
  auth: [
    "auth.required",
    "auth.unauthorized",
    "auth.forbidden",
    "auth.sessionExpired",
    "auth.invalidCredentials",
    "auth.emailRequired",
    "auth.passwordRequired",
    "auth.emailNotFound",
    "auth.incorrectPassword",
    "auth.tooManyAttempts",
  ],
  register: [
    "register.success",
    "register.emailExists",
    "register.tooManyAttempts",
    "register.error",
  ],
  validation: [
    "validation.failed",
    "validation.invalidEmail",
    "validation.invalidData",
    "validation.firstNameRequired",
    "validation.firstNameTooShort",
    "validation.lastNameRequired",
    "validation.lastNameTooShort",
    "validation.emailRequired",
    "validation.emailInvalid",
    "validation.passwordRequired",
    "validation.passwordTooShort",
    "validation.passwordMismatch",
    "validation.confirmPasswordRequired",
  ],
  profile: [
    "profile.loadError",
    "profile.updateSuccess",
    "profile.updateError",
    "profile.noChanges",
    "profile.passwordRequired",
  ],
  product: [
    "product.notFound",
    "product.createSuccess",
    "product.createError",
    "product.updateSuccess",
    "product.updateError",
    "product.deleteSuccess",
    "product.deleteError",
    "product.outOfStock",
  ],
  cart: [
    "cart.addSuccess",
    "cart.addError",
    "cart.updateSuccess",
    "cart.updateError",
    "cart.removeSuccess",
    "cart.removeError",
    "cart.syncSuccess",
    "cart.syncError",
    "cart.empty",
  ],
  purchase: [
    "purchase.notFound",
    "purchase.createSuccess",
    "purchase.createError",
    "purchase.updateSuccess",
    "purchase.updateError",
    "purchase.insufficientCodes",
  ],
  code: [
    "code.notFound",
    "code.createSuccess",
    "code.createError",
    "code.updateSuccess",
    "code.updateError",
    "code.deleteSuccess",
    "code.deleteError",
    "code.alreadyExists",
  ],
  banner: [
    "banner.notFound",
    "banner.createSuccess",
    "banner.createError",
    "banner.updateSuccess",
    "banner.updateError",
    "banner.deleteSuccess",
    "banner.deleteError",
  ],
  upload: [
    "upload.success",
    "upload.error",
    "upload.invalidType",
    "upload.tooLarge",
    "upload.deleteSuccess",
    "upload.deleteError",
    "upload.rateLimitExceeded",
  ],
  settings: [
    "settings.loadError",
    "settings.updateSuccess",
    "settings.updateError",
  ],
  rateLimit: ["rateLimit.exceeded", "rateLimit.tooManyRequests"],
  error: [
    "error.unexpected",
    "error.serverError",
    "error.notFound",
    "error.badRequest",
    "error.networkError",
    "error.timeout",
  ],
  success: [
    "success.operationComplete",
    "success.changesSaved",
    "success.actionComplete",
  ],
} as const;
