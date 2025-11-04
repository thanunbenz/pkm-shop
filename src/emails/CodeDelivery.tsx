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

interface CodeDeliveryProps {
  orderId: number;
  customerName: string;
  productName: string;
  productImage: string;
  codes: string[];
  quantity: number;
  totalAmount: number;
}

export const CodeDelivery = ({
  orderId,
  customerName,
  productName,
  productImage,
  codes,
  quantity,
  totalAmount,
}: CodeDeliveryProps) => {
  return (
    <Html>
      <Head />
      <Preview>โค้ดสินค้าของคุณพร้อมแล้ว - คำสั่งซื้อ #{String(orderId)}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={heading}>PKM Shop</Heading>
            <Text style={tagline}>Pokemon TCG Codes</Text>
          </Section>

          {/* Success Icon */}
          <Section style={iconSection}>
            <div style={successIcon}>🎁</div>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={title}>
              โค้ดสินค้าของคุณพร้อมแล้ว! 🎉
            </Heading>

            <Text style={paragraph}>
              สวัสดีคุณ <strong>{customerName}</strong>
            </Text>

            <Text style={paragraph}>
              ยินดีด้วย! คำสั่งซื้อของคุณได้รับการอนุมัติแล้ว
              นี่คือโค้ดสินค้าที่คุณสั่งซื้อ
            </Text>

            {/* Order Summary */}
            <Section style={orderBox}>
              <Text style={orderBoxTitle}>รายละเอียดคำสั่งซื้อ</Text>

              <table style={orderTable}>
                <tr>
                  <td style={orderLabel}>หมายเลขคำสั่งซื้อ:</td>
                  <td style={orderValue}>#{orderId}</td>
                </tr>
              </table>

              <Hr style={divider} />

              {/* Product Info */}
              <Section style={productSection}>
                {productImage && (
                  <Img
                    src={productImage}
                    alt={productName}
                    style={productImageStyle}
                    width={80}
                    height={80}
                  />
                )}
                <div style={productInfo}>
                  <Text style={productNameStyle}>{productName}</Text>
                  <Text style={productQuantity}>จำนวน: {quantity} ชิ้น</Text>
                </div>
              </Section>

              <Hr style={divider} />

              <table style={orderTable}>
                <tr>
                  <td style={orderLabel}>ยอดรวมทั้งหมด:</td>
                  <td style={orderValue}>฿{totalAmount.toLocaleString()}</td>
                </tr>
              </table>
            </Section>

            {/* Codes Section - HIGHLIGHT */}
            <Section style={codesBox}>
              <Heading style={codesTitle}>
                🎮 โค้ดสินค้าของคุณ ({codes.length} โค้ด)
              </Heading>

              <Text style={codesDescription}>
                กรุณาคัดลอกโค้ดด้านล่างไปใช้งานใน Pokemon TCG Online/Live
              </Text>

              {/* Codes List */}
              <div style={codesList}>
                {codes.map((code, index) => (
                  <div key={index} style={codeItem}>
                    <Text style={codeNumber}>โค้ดที่ {index + 1}</Text>
                    <div style={codeBox}>
                      <code style={codeText}>{code}</code>
                    </div>
                  </div>
                ))}
              </div>

              {/* Important Note */}
              <Section style={warningBox}>
                <Text style={warningText}>
                  ⚠️ <strong>สำคัญ:</strong> โปรดเก็บรักษาโค้ดเหล่านี้ไว้อย่างดี
                  โค้ดที่ถูกใช้งานแล้วจะไม่สามารถใช้งานซ้ำได้
                </Text>
              </Section>
            </Section>

            {/* How to Use */}
            <Section style={howToUseBox}>
              <Heading style={howToUseTitle}>วิธีใช้งานโค้ด 📖</Heading>

              <div style={step}>
                <Text style={stepNumber}>1.</Text>
                <Text style={stepText}>
                  เปิดแอป <strong>Pokemon TCG Online</strong> หรือ <strong>Pokemon TCG Live</strong>
                </Text>
              </div>

              <div style={step}>
                <Text style={stepNumber}>2.</Text>
                <Text style={stepText}>
                  ไปที่เมนู <strong>"Redeem Code"</strong> หรือ <strong>"แลกรหัส"</strong>
                </Text>
              </div>

              <div style={step}>
                <Text style={stepNumber}>3.</Text>
                <Text style={stepText}>
                  คัดลอกและวางโค้ดที่ได้รับ แล้วกด <strong>Submit</strong>
                </Text>
              </div>

              <div style={step}>
                <Text style={stepNumber}>4.</Text>
                <Text style={stepText}>
                  โค้ดจะถูกแลกเป็นการ์ดหรือบูสเตอร์แพ็คในเกมทันที! 🎊
                </Text>
              </div>
            </Section>

            {/* CTA Button */}
            <Section style={buttonSection}>
              <Button style={button} href={`${process.env.NEXT_PUBLIC_APP_URL}/orders`}>
                ดูประวัติการสั่งซื้อ
              </Button>
            </Section>

            {/* Tips Box */}
            <Section style={tipsBox}>
              <Text style={tipsTitle}>💡 เคล็ดลับ</Text>
              <ul style={tipsList}>
                <li style={tipItem}>
                  คุณสามารถดูโค้ดที่สั่งซื้อได้ตลอดเวลาในหน้าประวัติการสั่งซื้อ
                </li>
                <li style={tipItem}>
                  แนะนำให้แลกโค้ดทันทีเพื่อป้องกันการสูญหาย
                </li>
                <li style={tipItem}>
                  หากมีปัญหาในการแลกโค้ด กรุณาติดต่อทีมงาน
                </li>
              </ul>
            </Section>

            {/* Support */}
            <Text style={paragraph}>
              ขอบคุณที่ไว้วางใจเลือกซื้อกับเรา! 🙏
            </Text>

            <Text style={paragraph}>
              หากมีข้อสงสัยหรือต้องการความช่วยเหลือ
              กรุณาติดต่อเราได้ที่{" "}
              <Link href="mailto:support@pkm-shop.com" style={link}>
                support@pkm-shop.com
              </Link>
            </Text>

            <Text style={paragraph}>
              สนุกกับการเล่น Pokemon TCG! 🎮✨
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

const productImageStyle = {
  borderRadius: "8px",
  objectFit: "cover" as const,
};

const productInfo = {
  flex: 1,
};

const productNameStyle = {
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

// ===== CODES SECTION STYLES =====
const codesBox = {
  backgroundColor: "#d4edda",
  border: "2px solid #28a745",
  borderRadius: "8px",
  padding: "24px",
  margin: "32px 0",
};

const codesTitle = {
  color: "#155724",
  fontSize: "20px",
  fontWeight: "bold",
  margin: "0 0 12px 0",
  textAlign: "center" as const,
};

const codesDescription = {
  color: "#155724",
  fontSize: "14px",
  textAlign: "center" as const,
  margin: "0 0 24px 0",
};

const codesList = {
  margin: "0",
};

const codeItem = {
  marginBottom: "16px",
};

const codeNumber = {
  color: "#155724",
  fontSize: "14px",
  fontWeight: "600" as const,
  margin: "0 0 8px 0",
};

const codeBox = {
  backgroundColor: "#ffffff",
  border: "2px dashed #28a745",
  borderRadius: "6px",
  padding: "16px",
  textAlign: "center" as const,
};

const codeText = {
  color: "#155724",
  fontSize: "18px",
  fontWeight: "bold",
  fontFamily: "monospace",
  letterSpacing: "2px",
  userSelect: "all" as const,
};

const warningBox = {
  backgroundColor: "#fff3cd",
  border: "1px solid #ffc107",
  borderRadius: "6px",
  padding: "12px",
  marginTop: "20px",
};

const warningText = {
  color: "#856404",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0",
};

// ===== HOW TO USE SECTION =====
const howToUseBox = {
  backgroundColor: "#e7f3ff",
  border: "1px solid #b3d9ff",
  borderRadius: "8px",
  padding: "24px",
  margin: "24px 0",
};

const howToUseTitle = {
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

// ===== TIPS SECTION =====
const tipsBox = {
  backgroundColor: "#f8f9fa",
  border: "1px solid #e9ecef",
  borderRadius: "8px",
  padding: "20px",
  margin: "24px 0",
};

const tipsTitle = {
  color: "#0B264C",
  fontSize: "16px",
  fontWeight: "bold",
  margin: "0 0 12px 0",
};

const tipsList = {
  color: "#525f7f",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0",
  paddingLeft: "20px",
};

const tipItem = {
  marginBottom: "8px",
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

export default CodeDelivery;
