import { Resend } from "resend";
import logger from "./logger";

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Email configuration
const FROM_EMAIL = process.env.EMAIL_FROM || "noreply@pkm-shop.com";
const REPLY_TO_EMAIL = process.env.EMAIL_REPLY_TO || "support@pkm-shop.com";

/**
 * Send email using Resend
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
    if (!process.env.RESEND_API_KEY) {
      logger.error("RESEND_API_KEY is not configured");
      throw new Error("Email service is not configured");
    }

    logger.info("Sending email", {
      to,
      subject,
      from: FROM_EMAIL,
    });

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject,
      react,
      replyTo: REPLY_TO_EMAIL,
    });

    if (error) {
      logger.error("Failed to send email", {
        error: error.message,
        to,
        subject,
      });
      throw new Error(`Failed to send email: ${error.message}`);
    }

    logger.info("Email sent successfully", {
      emailId: data?.id,
      to,
      subject,
    });

    return {
      success: true,
      emailId: data?.id,
    };
  } catch (error) {
    logger.error("Email sending error", {
      error: error instanceof Error ? error.message : "Unknown error",
      to,
      subject,
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
