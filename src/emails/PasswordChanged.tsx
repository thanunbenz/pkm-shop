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

interface PasswordChangedProps {
  customerName: string;
  changeDate: Date;
  ipAddress?: string;
}

export const PasswordChanged = ({
  customerName,
  changeDate,
  ipAddress,
}: PasswordChangedProps) => {
  const formattedDate = new Date(changeDate).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Html>
      <Head />
      <Preview>รหัสผ่านของคุณถูกเปลี่ยนแล้ว - PKM Shop</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={heading}>PKM Shop</Heading>
            <Text style={tagline}>Pokemon TCG Codes</Text>
          </Section>

          {/* Security Icon */}
          <Section style={iconSection}>
            <div style={securityIcon}>🔒</div>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={title}>
              รหัสผ่านของคุณถูกเปลี่ยนแล้ว
            </Heading>

            <Text style={paragraph}>
              สวัสดีคุณ <strong>{customerName}</strong>
            </Text>

            <Text style={paragraph}>
              รหัสผ่านของบัญชี PKM Shop ของคุณได้ถูกเปลี่ยนเรียบร้อยแล้ว
            </Text>

            {/* Change Details Box */}
            <Section style={detailsBox}>
              <Text style={detailsBoxTitle}>รายละเอียดการเปลี่ยนแปลง</Text>

              <table style={detailsTable}>
                <tr>
                  <td style={detailLabel}>วันที่และเวลา:</td>
                  <td style={detailValue}>{formattedDate}</td>
                </tr>
                {ipAddress && (
                  <tr>
                    <td style={detailLabel}>IP Address:</td>
                    <td style={detailValue}>{ipAddress}</td>
                  </tr>
                )}
                <tr>
                  <td style={detailLabel}>การดำเนินการ:</td>
                  <td style={detailValue}>เปลี่ยนรหัสผ่าน</td>
                </tr>
              </table>
            </Section>

            {/* Security Notice */}
            <Section style={securityBox}>
              <Heading style={securityTitle}>🛡️ เกี่ยวกับความปลอดภัย</Heading>

              <Text style={securityText}>
                <strong>หากคุณเป็นผู้ทำการเปลี่ยนรหัสผ่าน:</strong>
              </Text>
              <Text style={securityText}>
                • ไม่ต้องดำเนินการใดๆ เพิ่มเติม
              </Text>
              <Text style={securityText}>
                • รหัสผ่านของคุณได้รับการเข้ารหัสอย่างปลอดภัย
              </Text>
              <Text style={securityText}>
                • คุณสามารถใช้รหัสผ่านใหม่เข้าสู่ระบบได้ทันที
              </Text>

              <Hr style={divider} />

              <Text style={warningText}>
                <strong>⚠️ หากคุณไม่ได้ทำการเปลี่ยนรหัสผ่าน:</strong>
              </Text>
              <Text style={warningText}>
                • บัญชีของคุณอาจถูกเข้าถึงโดยไม่ได้รับอนุญาต
              </Text>
              <Text style={warningText}>
                • กรุณาติดต่อทีมงานของเราทันที
              </Text>
              <Text style={warningText}>
                • ทีมงานจะช่วยตรวจสอบและรักษาความปลอดภัยให้คุณ
              </Text>
            </Section>

            {/* CTA Buttons */}
            <Section style={buttonSection}>
              <Button style={primaryButton} href={`${process.env.NEXTAUTH_URL}/login`}>
                เข้าสู่ระบบด้วยรหัสผ่านใหม่
              </Button>
            </Section>

            <Section style={buttonSection}>
              <Button
                style={secondaryButton}
                href={`mailto:support@pkm-shop.com?subject=รหัสผ่านถูกเปลี่ยนโดยไม่ได้รับอนุญาต`}
              >
                รายงานปัญหา
              </Button>
            </Section>

            {/* Security Tips */}
            <Section style={tipsBox}>
              <Heading style={tipsTitle}>💡 คำแนะนำด้านความปลอดภัย</Heading>

              <Text style={tipsText}>
                • ไม่แชร์รหัสผ่านกับผู้อื่น
              </Text>
              <Text style={tipsText}>
                • ใช้รหัสผ่านที่ไม่ซ้ำกับเว็บไซต์อื่น
              </Text>
              <Text style={tipsText}>
                • เปลี่ยนรหัสผ่านเป็นประจำทุก 3-6 เดือน
              </Text>
              <Text style={tipsText}>
                • ระวังอีเมลหรือข้อความที่ขอรหัสผ่าน (Phishing)
              </Text>
              <Text style={tipsText}>
                • ออกจากระบบเมื่อใช้งานจากอุปกรณ์สาธารณะ
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

const securityIcon = {
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

const detailsBox = {
  backgroundColor: "#f8f9fa",
  border: "1px solid #e9ecef",
  borderRadius: "8px",
  padding: "24px",
  margin: "24px 0",
};

const detailsBoxTitle = {
  color: "#0B264C",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "0 0 16px 0",
};

const detailsTable = {
  width: "100%",
  marginBottom: "8px",
};

const detailLabel = {
  color: "#6c757d",
  fontSize: "14px",
  padding: "8px 0",
  width: "40%",
};

const detailValue = {
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
  margin: "0 0 20px 0",
};

const securityText = {
  color: "#212529",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0 0 8px 0",
};

const warningText = {
  color: "#721c24",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0 0 8px 0",
};

const tipsBox = {
  backgroundColor: "#fff3cd",
  border: "1px solid #ffeaa7",
  borderRadius: "8px",
  padding: "24px",
  margin: "24px 0",
};

const tipsTitle = {
  color: "#856404",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "0 0 16px 0",
};

const tipsText = {
  color: "#856404",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0 0 8px 0",
};

const buttonSection = {
  textAlign: "center" as const,
  margin: "16px 0",
};

const primaryButton = {
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

const secondaryButton = {
  backgroundColor: "#dc3545",
  borderRadius: "6px",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "10px 24px",
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

export default PasswordChanged;
