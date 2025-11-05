import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface PasswordResetProps {
  customerName: string;
  resetUrl: string;
  expiresIn: string;
}

export const PasswordReset = ({
  customerName,
  resetUrl,
  expiresIn,
}: PasswordResetProps) => {
  return (
    <Html>
      <Head />
      <Preview>รีเซ็ตรหัสผ่านของคุณ - PKM Shop</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={heading}>PKM Shop</Heading>
            <Text style={tagline}>Pokemon TCG Codes</Text>
          </Section>

          {/* Icon */}
          <Section style={iconSection}>
            <div style={lockIcon}>🔐</div>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={title}>รีเซ็ตรหัสผ่าน</Heading>

            <Text style={paragraph}>
              สวัสดีคุณ <strong>{customerName}</strong>
            </Text>

            <Text style={paragraph}>
              เราได้รับคำขอให้รีเซ็ตรหัสผ่านสำหรับบัญชี PKM Shop ของคุณ
            </Text>

            <Text style={paragraph}>
              คลิกปุ่มด้านล่างเพื่อสร้างรหัสผ่านใหม่:
            </Text>

            {/* CTA Button */}
            <Section style={buttonSection}>
              <Button style={button} href={resetUrl}>
                รีเซ็ตรหัสผ่าน
              </Button>
            </Section>

            {/* Expiry Warning */}
            <Section style={warningBox}>
              <Text style={warningText}>
                ⏰ <strong>ลิงก์นี้จะหมดอายุใน {expiresIn}</strong>
              </Text>
              <Text style={warningText}>
                หากคุณไม่ได้ทำการร้องขอนี้
                กรุณาเพิกเฉยต่ออีเมลนี้และรหัสผ่านของคุณจะยังคงเหมือนเดิม
              </Text>
            </Section>

            {/* Manual Link */}
            <Section style={linkBox}>
              <Text style={linkText}>
                หากปุ่มด้านบนไม่ทำงาน คุณสามารถคัดลอกลิงก์นี้ไปใส่ใน browser:
              </Text>
              <Text style={linkUrl}>{resetUrl}</Text>
            </Section>

            {/* Security Notice */}
            <Section style={securityBox}>
              <Heading style={securityTitle}>🛡️ เกี่ยวกับความปลอดภัย</Heading>

              <Text style={securityText}>
                <strong>หากคุณไม่ได้ขอรีเซ็ตรหัสผ่าน:</strong>
              </Text>
              <Text style={securityText}>
                • อาจมีคนพยายามเข้าถึงบัญชีของคุณ
              </Text>
              <Text style={securityText}>
                • เพิกเฉยต่ออีเมลนี้ (รหัสผ่านจะไม่เปลี่ยน)
              </Text>
              <Text style={securityText}>
                • ตรวจสอบความปลอดภัยของบัญชี
              </Text>
              <Text style={securityText}>
                • ติดต่อทีมงานหากมีข้อสงสัย
              </Text>
            </Section>

            {/* Tips */}
            <Section style={tipsBox}>
              <Heading style={tipsTitle}>💡 เคล็ดลับสำหรับรหัสผ่านที่ปลอดภัย</Heading>

              <Text style={tipsText}>
                • ใช้อย่างน้อย 8 ตัวอักษร
              </Text>
              <Text style={tipsText}>
                • ผสมตัวพิมพ์เล็ก ตัวพิมพ์ใหญ่ และตัวเลข
              </Text>
              <Text style={tipsText}>
                • ไม่ใช้รหัสผ่านเดียวกันกับเว็บไซต์อื่น
              </Text>
              <Text style={tipsText}>
                • เปลี่ยนรหัสผ่านเป็นประจำ
              </Text>
            </Section>

            {/* Support */}
            <Text style={paragraph}>
              หากมีข้อสงสัยหรือต้องการความช่วยเหลือ กรุณาติดต่อเราได้ที่{" "}
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
            <Text style={footerText}>PKM Shop - Pokemon TCG Codes</Text>
            <Text style={footerText}>
              อีเมลนี้ส่งอัตโนมัติ กรุณาอย่าตอบกลับ
            </Text>
            <Text style={footerText}>
              หากต้องการความช่วยเหลือ ติดต่อ support@pkm-shop.com
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

const lockIcon = {
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

const buttonSection = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#0B264C",
  borderRadius: "6px",
  color: "#ffffff",
  fontSize: "18px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 40px",
};

const warningBox = {
  backgroundColor: "#fff3cd",
  border: "1px solid #ffeaa7",
  borderRadius: "8px",
  padding: "20px",
  margin: "24px 0",
};

const warningText = {
  color: "#856404",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0 0 8px 0",
};

const linkBox = {
  backgroundColor: "#f8f9fa",
  border: "1px solid #e9ecef",
  borderRadius: "8px",
  padding: "20px",
  margin: "24px 0",
};

const linkText = {
  color: "#6c757d",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0 0 12px 0",
};

const linkUrl = {
  color: "#0B264C",
  fontSize: "12px",
  lineHeight: "18px",
  wordBreak: "break-all" as const,
  margin: "0",
};

const securityBox = {
  backgroundColor: "#e7f3ff",
  border: "1px solid #b3d9ff",
  borderRadius: "8px",
  padding: "24px",
  margin: "24px 0",
};

const securityTitle = {
  color: "#0B264C",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "0 0 16px 0",
};

const securityText = {
  color: "#212529",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0 0 8px 0",
};

const tipsBox = {
  backgroundColor: "#d4edda",
  border: "1px solid "#c3e6cb",
  borderRadius: "8px",
  padding: "24px",
  margin: "24px 0",
};

const tipsTitle = {
  color: "#155724",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "0 0 16px 0",
};

const tipsText = {
  color: "#155724",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0 0 8px 0",
};

const divider = {
  borderColor: "#e9ecef",
  margin: "20px 0",
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

export default PasswordReset;
