import sgMail from "@sendgrid/mail";
import { render } from "@react-email/components";
import logger from "./logger";
import { validateEmailConfig } from "./startup-validation";

// Validate email configuration at startup
validateEmailConfig();

// Initialize SendGrid client
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Email configuration
const FROM_EMAIL = process.env.EMAIL_FROM || "noreply@pkm-shop.com";
const REPLY_TO_EMAIL = process.env.EMAIL_REPLY_TO || "support@pkm-shop.com";

/**
 * Send email using SendGrid
 * @param to - Recipient email address
 * @param subject - Email subject
 * @param react - React email component
 * @returns Promise with email sending result
 */
export async function sendEmail({
  to,
  subject,
  react,
}: {
  to: string;
  subject: string;
  react: React.ReactElement;
}) {
  try {
    // Validate email address format
    if (!to || !isValidEmail(to)) {
      throw new Error(`Invalid email address: ${to}`);
    }

    // Check if API key is configured
    if (!process.env.SENDGRID_API_KEY) {
      logger.error("SENDGRID_API_KEY is not configured");
      throw new Error("Email service is not configured");
    }

    logger.info("Sending email", {
      to,
      subject,
      from: FROM_EMAIL,
    });

    // Render React component to HTML
    const html = render(react);

    // Send email using SendGrid
    const msg = {
      to,
      from: FROM_EMAIL,
      subject,
      html,
      replyTo: REPLY_TO_EMAIL,
    };

    const response = await sgMail.send(msg);

    logger.info("Email sent successfully", {
      messageId: response[0]?.headers?.["x-message-id"],
      to,
      subject,
      statusCode: response[0]?.statusCode,
    });

    return {
      success: true,
      messageId: response[0]?.headers?.["x-message-id"],
    };
  } catch (error: any) {
    logger.error("Email sending error", {
      error: error instanceof Error ? error.message : "Unknown error",
      to,
      subject,
      sendgridError: error?.response?.body,
    });

    // Don't throw error to prevent blocking the main operation
    // Email sending failure should not prevent order creation/update
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Validate email address format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Send order confirmation email
 * @param to - Customer email
 * @param orderData - Order details
 */
export async function sendOrderConfirmation({
  to,
  orderId,
  customerName,
  productName,
  productImage,
  quantity,
  totalAmount,
  orderDate,
}: {
  to: string;
  orderId: number;
  customerName: string;
  productName: string;
  productImage: string;
  quantity: number;
  totalAmount: number;
  orderDate: Date;
}) {
  const { OrderConfirmation } = await import("@/emails/OrderConfirmation");

  return sendEmail({
    to,
    subject: `ยืนยันคำสั่งซื้อ #${orderId} - PKM Shop`,
    react: OrderConfirmation({
      orderId,
      customerName,
      productName,
      productImage,
      quantity,
      totalAmount,
      orderDate,
    }),
  });
}

/**
 * Send code delivery email when order is completed
 * @param to - Customer email
 * @param orderData - Order and codes details
 */
export async function sendCodeDelivery({
  to,
  orderId,
  customerName,
  productName,
  productImage,
  codes,
  quantity,
  totalAmount,
}: {
  to: string;
  orderId: number;
  customerName: string;
  productName: string;
  productImage: string;
  codes: string[];
  quantity: number;
  totalAmount: number;
}) {
  const { CodeDelivery } = await import("@/emails/CodeDelivery");

  return sendEmail({
    to,
    subject: `โค้ดสินค้าของคุณพร้อมแล้ว - คำสั่งซื้อ #${orderId}`,
    react: CodeDelivery({
      orderId,
      customerName,
      productName,
      productImage,
      codes,
      quantity,
      totalAmount,
    }),
  });
}

/**
 * Send password changed notification email
 * @param to - User email
 * @param customerName - User's first name
 * @param changeDate - Date and time of password change
 * @param ipAddress - IP address of the request (optional)
 */
export async function sendPasswordChangedEmail({
  to,
  customerName,
  changeDate,
  ipAddress,
}: {
  to: string;
  customerName: string;
  changeDate: Date;
  ipAddress?: string;
}) {
  const { PasswordChanged } = await import("@/emails/PasswordChanged");

  return sendEmail({
    to,
    subject: `🔒 รหัสผ่านของคุณถูกเปลี่ยนแล้ว - PKM Shop`,
    react: PasswordChanged({
      customerName,
      changeDate,
      ipAddress,
    }),
  });
}

/**
 * Send password reset email with reset link
 * @param to - User email
 * @param customerName - User's first name
 * @param resetUrl - Password reset URL with token
 * @param expiresIn - Token expiration time (e.g., "1 ชั่วโมง")
 */
export async function sendPasswordResetEmail({
  to,
  customerName,
  resetUrl,
  expiresIn,
}: {
  to: string;
  customerName: string;
  resetUrl: string;
  expiresIn: string;
}) {
  const { PasswordReset } = await import("@/emails/PasswordReset");

  return sendEmail({
    to,
    subject: `🔐 รีเซ็ตรหัสผ่านของคุณ - PKM Shop`,
    react: PasswordReset({
      customerName,
      resetUrl,
      expiresIn,
    }),
  });
}
