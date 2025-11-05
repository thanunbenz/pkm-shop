"use client";

import Link from "next/link";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import logger from "@/lib/logger";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email) {
      toast.error("กรุณากรอกอีเมล");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/v1/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
        toast.success(
          data.message || "ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว"
        );
      } else {
        toast.error(data.error || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
      }
    } catch (error) {
      logger.error("Forgot password request failed", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            {/* Success Icon */}
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              ส่งอีเมลสำเร็จ!
            </h2>

            <p className="text-gray-600 mb-6">
              เราได้ส่งลิงก์สำหรับรีเซ็ตรหัสผ่านไปยัง
            </p>

            <p className="text-lg font-semibold text-blue-600 mb-6">{email}</p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800 text-left">
                📧 <strong>กรุณาตรวจสอบอีเมลของคุณ</strong>
                <br />
                <br />
                • ลิงก์จะใช้งานได้เพียง 1 ชั่วโมง
                <br />
                • ตรวจสอบในกล่อง Spam/Junk ด้วย
                <br />• ถ้าไม่ได้รับอีเมล สามารถขอส่งใหม่ได้
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setSubmitted(false);
                  setEmail("");
                }}
                className="w-full px-4 py-2 text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                ส่งอีเมลอีกครั้ง
              </button>

              <Link
                href="/login"
                className="block w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
              >
                กลับไปหน้าเข้าสู่ระบบ
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
            ลืมรหัสผ่าน?
          </h2>
          <p className="text-sm text-center text-gray-600">
            กรอกอีเมลของคุณ เราจะส่งลิงก์สำหรับรีเซ็ตรหัสผ่านให้
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              อีเมล <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="กรอกอีเมลของคุณ"
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "กำลังส่ง..." : "ส่งลิงก์รีเซ็ตรหัสผ่าน"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
          >
            ← กลับไปหน้าเข้าสู่ระบบ
          </Link>
        </div>

        <div className="mt-6">
          <p className="text-xs text-center text-gray-500">
            ไม่มีบัญชี?{" "}
            <Link href="/register" className="text-blue-600 hover:underline">
              สมัครสมาชิก
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
