"use client";
import { useEffect, useState } from "react";
import { showToastSuccess, showToastError } from "@/lib/utils/toast";
import { Bounce, ToastContainer } from "react-toastify";

interface Settings {
  id: number;
  welcomeTitle: string;
  welcomeSubtitle: string | null;
  showWelcome: boolean;
  supportEmail: string | null;
  enableEmailNotifications: boolean;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    welcomeTitle: "",
    welcomeSubtitle: "",
    showWelcome: true,
    supportEmail: "",
    enableEmailNotifications: true,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/v1/settings");
      if (!response.ok) throw new Error("Failed to fetch settings");
      const result = await response.json();

      setSettings(result.data);
      setFormData({
        welcomeTitle: result.data.welcomeTitle,
        welcomeSubtitle: result.data.welcomeSubtitle || "",
        showWelcome: result.data.showWelcome,
        supportEmail: result.data.supportEmail || "",
        enableEmailNotifications: result.data.enableEmailNotifications,
      });
    } catch (error) {
      showToastError("ไม่สามารถโหลดข้อมูล Settings ได้");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch("/api/v1/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "บันทึกข้อมูลไม่สำเร็จ");
      }

      showToastSuccess("บันทึกการตั้งค่าสำเร็จ");
      fetchSettings();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "บันทึกข้อมูลไม่สำเร็จ";
      showToastError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="-mx-6 px-6 flex flex-row items-center mb-6">
        <div className="flex-grow">
          <h3 className="text-2xl font-bold text-gray-700">Settings</h3>
          <p className="text-sm text-gray-500 mt-1">จัดการการตั้งค่าเว็บไซต์</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h4 className="text-lg font-semibold mb-4 text-gray-800">Welcome Section</h4>
          <div className="space-y-4">
          {/* Welcome Title */}
          <div>
            <label className="block text-sm font-medium mb-2">
              หัวข้อหลัก (Welcome Title)
            </label>
            <input
              type="text"
              value={formData.welcomeTitle}
              onChange={(e) => setFormData({ ...formData, welcomeTitle: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Welcome to PKM Shop"
              required
            />
          </div>

          {/* Welcome Subtitle */}
          <div>
            <label className="block text-sm font-medium mb-2">
              คำอธิบาย (Subtitle)
              <span className="text-xs text-gray-500 ml-2">(ทิ้งว่างเพื่อไม่แสดง)</span>
            </label>
            <textarea
              value={formData.welcomeSubtitle}
              onChange={(e) => setFormData({ ...formData, welcomeSubtitle: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Your one-stop shop for Pokémon TCG Live codes"
            />
          </div>

          {/* Show Welcome Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="showWelcome"
              checked={formData.showWelcome}
              onChange={(e) => setFormData({ ...formData, showWelcome: e.target.checked })}
              className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded"
            />
            <label htmlFor="showWelcome" className="text-sm font-medium">
              แสดง Welcome Section ในหน้าหลัก
            </label>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              💡 <strong>Tips:</strong> ข้อความจะถูกจัดให้อยู่ตรงกลางโดยอัตโนมัติในหน้าหลัก
            </p>
          </div>
          </div>
        </div>

        {/* Email Configuration Section (Issue #57) */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-lg font-semibold text-gray-800">Email Configuration</h4>
              <p className="text-sm text-gray-500 mt-1">ตั้งค่าอีเมลสำหรับติดต่อและแจ้งเตือน</p>
            </div>
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
              Issue #57
            </span>
          </div>

          <div className="space-y-4">
            {/* Support Email */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Support Email
                <span className="text-xs text-gray-500 ml-2">(อีเมลสำหรับติดต่อ Support)</span>
              </label>
              <input
                type="email"
                value={formData.supportEmail}
                onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="support@pkmshop.com"
              />
              <p className="text-xs text-gray-500 mt-1">
                อีเมลนี้จะแสดงใน footer และใน email แจ้งเตือนต่างๆ
              </p>
            </div>

            {/* Email Notifications Toggle */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="enableEmailNotifications"
                checked={formData.enableEmailNotifications}
                onChange={(e) => setFormData({ ...formData, enableEmailNotifications: e.target.checked })}
                className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded"
              />
              <label htmlFor="enableEmailNotifications" className="text-sm font-medium">
                เปิดใช้งาน Email Notifications
              </label>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                ⚠️ <strong>หมายเหตุ:</strong> การปิด Email Notifications จะทำให้ระบบไม่ส่งอีเมลแจ้งเตือนใดๆ
                (Order confirmation, Code delivery, Admin notifications, etc.)
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 mb-2">
                <strong>Current Email Configuration:</strong>
              </p>
              <ul className="text-sm text-blue-700 space-y-1 ml-4 list-disc">
                <li>Email From: <code className="bg-blue-100 px-1 rounded">{process.env.EMAIL_FROM || 'Not set'}</code></li>
                <li>Resend API: <span className={process.env.RESEND_API_KEY ? "text-green-600" : "text-red-600"}>
                  {process.env.RESEND_API_KEY ? '✓ Configured' : '✗ Not configured'}
                </span></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <button
            type="submit"
            disabled={isSaving}
            className={`w-full px-6 py-3 rounded text-white font-medium ${
              isSaving
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isSaving ? "กำลังบันทึก..." : "💾 บันทึกการตั้งค่าทั้งหมด"}
          </button>
        </div>
      </form>

      {/* Preview Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mt-6">
        <h4 className="text-lg font-semibold mb-4 text-gray-800">ตัวอย่าง Welcome Section</h4>
        {formData.showWelcome ? (
          <div className="bg-gray-50 rounded-lg p-6 text-center border-2 border-dashed border-gray-300">
            <h1 className="text-3xl font-bold mb-4">{formData.welcomeTitle}</h1>
            {formData.welcomeSubtitle && (
              <p className="text-gray-600">{formData.welcomeSubtitle}</p>
            )}
          </div>
        ) : (
          <div className="bg-gray-100 rounded-lg p-6 text-center text-gray-500 border-2 border-dashed border-gray-300">
            Welcome Section ถูกซ่อน
          </div>
        )}
      </div>

      <ToastContainer
        position="bottom-left"
        autoClose={5000}
        hideProgressBar={false}
        closeOnClick={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />
    </div>
  );
}
