import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface OrderConfirmationProps {
  orderId: number;
  customerName: string;
  productName: string;
  productImage: string;
  quantity: number;
  totalAmount: number;
  orderDate: Date;
}

export const OrderConfirmation = ({
  orderId,
  customerName,
  productName,
  productImage,
  quantity,
  totalAmount,
  orderDate,
}: OrderConfirmationProps) => {
  const formattedDate = new Date(orderDate).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Html>
      <Head />
      <Preview>ยืนยันคำสั่งซื้อ #{orderId} - PKM Shop</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={heading}>PKM Shop</Heading>
            <Text style={tagline}>Pokemon TCG Codes</Text>
          </Section>

          {/* Success Icon */}
          <Section style={iconSection}>
            <div style={successIcon}>✅</div>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={title}>
              ขอบคุณสำหรับคำสั่งซื้อ! 🎉
            </Heading>

            <Text style={paragraph}>
              สวัสดีคุณ <strong>{customerName}</strong>
            </Text>

            <Text style={paragraph}>
              เราได้รับคำสั่งซื้อของคุณเรียบร้อยแล้ว
              ทีมงานกำลังตรวจสอบการชำระเงินของคุณ
            </Text>

            {/* Order Details Box */}
            <Section style={orderBox}>
              <Text style={orderBoxTitle}>รายละเอียดคำสั่งซื้อ</Text>

              <table style={orderTable}>
                <tr>
                  <td style={orderLabel}>หมายเลขคำสั่งซื้อ:</td>
                  <td style={orderValue}>#{orderId}</td>
                </tr>
                <tr>
                  <td style={orderLabel}>วันที่สั่งซื้อ:</td>
                  <td style={orderValue}>{formattedDate}</td>
                </tr>
              </table>

              <Hr style={divider} />

              {/* Product Info */}
              <Section style={productSection}>
                {productImage && (
                  <Img
                    src={productImage}
                    alt={productName}
                    style={productImage}
                    width={80}
                    height={80}
                  />
                )}
                <div style={productInfo}>
                  <Text style={productName}>{productName}</Text>
                  <Text style={productQuantity}>จำนวน: {quantity} ชิ้น</Text>
                </div>
              </Section>

              <Hr style={divider} />

              {/* Total */}
              <table style={orderTable}>
                <tr>
                  <td style={totalLabel}>ยอดรวมทั้งหมด:</td>
                  <td style={totalValue}>฿{totalAmount.toLocaleString()}</td>
                </tr>
              </table>
            </Section>

            {/* What's Next */}
            <Section style={nextStepsBox}>
              <Heading style={nextStepsTitle}>ขั้นตอนต่อไป 📋</Heading>

              <div style={step}>
                <Text style={stepNumber}>1.</Text>
                <Text style={stepText}>
                  <strong>รอการตรวจสอบ:</strong> ทีมงานกำลังตรวจสอบหลักฐานการชำระเงินของคุณ
                </Text>
              </div>

              <div style={step}>
                <Text style={stepNumber}>2.</Text>
                <Text style={stepText}>
                  <strong>รับโค้ดสินค้า:</strong> เมื่อการชำระเงินได้รับการยืนยันแล้ว
                  เราจะส่งโค้ดสินค้าให้คุณทางอีเมล
                </Text>
              </div>

              <div style={step}>
                <Text style={stepNumber}>3.</Text>
                <Text style={stepText}>
                  <strong>ตรวจสอบสถานะ:</strong> คุณสามารถตรวจสอบสถานะคำสั่งซื้อได้ที่หน้าประวัติการสั่งซื้อ
                </Text>
              </div>
            </Section>

            {/* CTA Button */}
            <Section style={buttonSection}>
              <Button style={button} href={`${process.env.NEXT_PUBLIC_APP_URL}/orders`}>
                ดูประวัติการสั่งซื้อ
              </Button>
            </Section>

            {/* Info Alert */}
            <Section style={infoBox}>
              <Text style={infoText}>
                ⏰ <strong>เวลาในการตรวจสอบ:</strong> โดยปกติใช้เวลา 1-24 ชั่วโมง
                (ขึ้นอยู่กับช่วงเวลาที่ทำรายการ)
              </Text>
            </Section>

            {/* Support */}
            <Text style={paragraph}>
              หากมีข้อสงสัยหรือต้องการความช่วยเหลือ
              กรุณาติดต่อเราได้ที่{" "}
              <Link href="mailto:support@pkm-shop.com" style={link}>
                support@pkm-shop.com
              </Link>
            </Text>

            <Text style={paragraph}>
              ขอบคุณที่ไว้วางใจ PKM Shop! 🙏
            </Text>
          </Section>

          {/* Footer */}
          <Hr style={divider} />
          <Section style={footer}>
            <Text style={footerText}>
              PKM Shop - Pokemon TCG Codes
            </Text>
            <Text style={footerText}>
              อีเมลนี้ส่งอัตโนมัติ กรุณาอย่าตอบกลับ
            </Text>
            <Text style={footerText}>
              © {new Date().getFullYear()} PKM Shop. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0",
  marginBottom: "64px",
  maxWidth: "600px",
};

const header = {
  backgroundColor: "#0B264C",
  padding: "30px 20px",
  textAlign: "center" as const,
};

const heading = {
  color: "#ffffff",
  fontSize: "32px",
  fontWeight: "bold",
  margin: "0",
  padding: "0",
};

const tagline = {
  color: "#ffffff",
  fontSize: "14px",
  margin: "8px 0 0 0",
  opacity: 0.9,
};

const iconSection = {
  textAlign: "center" as const,
  padding: "40px 20px 20px",
};

const successIcon = {
  fontSize: "64px",
  margin: "0",
};

const content = {
  padding: "0 40px 40px",
};

const title = {
  color: "#0B264C",
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "0 0 30px 0",
};

const paragraph = {
  color: "#525f7f",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 16px 0",
};

const orderBox = {
  backgroundColor: "#f8f9fa",
  border: "1px solid #e9ecef",
  borderRadius: "8px",
  padding: "24px",
  margin: "24px 0",
};

const orderBoxTitle = {
  color: "#0B264C",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "0 0 16px 0",
};

const orderTable = {
  width: "100%",
  marginBottom: "8px",
};

const orderLabel = {
  color: "#6c757d",
  fontSize: "14px",
  padding: "8px 0",
  width: "50%",
};

const orderValue = {
  color: "#212529",
  fontSize: "14px",
  fontWeight: "600" as const,
  padding: "8px 0",
  textAlign: "right" as const,
};

const divider = {
  borderColor: "#e9ecef",
  margin: "20px 0",
};

const productSection = {
  display: "flex",
  alignItems: "center",
  gap: "16px",
  padding: "12px 0",
};

const productInfo = {
  flex: 1,
};

const productName = {
  color: "#212529",
  fontSize: "16px",
  fontWeight: "600" as const,
  margin: "0 0 8px 0",
};

const productQuantity = {
  color: "#6c757d",
  fontSize: "14px",
  margin: "0",
};

const totalLabel = {
  color: "#0B264C",
  fontSize: "16px",
  fontWeight: "bold",
  padding: "8px 0",
};

const totalValue = {
  color: "#0B264C",
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "right" as const,
  padding: "8px 0",
};

const nextStepsBox = {
  backgroundColor: "#e7f3ff",
  border: "1px solid #b3d9ff",
  borderRadius: "8px",
  padding: "24px",
  margin: "24px 0",
};

const nextStepsTitle = {
  color: "#0B264C",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "0 0 20px 0",
};

const step = {
  display: "flex",
  marginBottom: "16px",
};

const stepNumber = {
  color: "#0B264C",
  fontSize: "18px",
  fontWeight: "bold",
  marginRight: "12px",
  minWidth: "24px",
};

const stepText = {
  color: "#212529",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0",
};

const infoBox = {
  backgroundColor: "#fff3cd",
  border: "1px solid #ffeaa7",
  borderRadius: "8px",
  padding: "16px",
  margin: "24px 0",
};

const infoText = {
  color: "#856404",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0",
};

const buttonSection = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#0B264C",
  borderRadius: "6px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 32px",
};

const link = {
  color: "#0B264C",
  textDecoration: "underline",
};

const footer = {
  padding: "0 40px",
  textAlign: "center" as const,
};

const footerText = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  margin: "8px 0",
};

export default OrderConfirmation;
