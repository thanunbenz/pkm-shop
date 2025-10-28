"use client";
import { useEffect, useState } from "react";
import { showToastSuccess, showToastError } from "@/lib/utils/toast";
import { Bounce, ToastContainer } from "react-toastify";

interface Settings {
  id: number;
  welcomeTitle: string;
  welcomeSubtitle: string | null;
  showWelcome: boolean;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    welcomeTitle: "",
    welcomeSubtitle: "",
    showWelcome: true,
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
      });
    } catch (error) {
      console.error("Error fetching settings:", error);
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
      console.error("Error saving settings:", error);
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

      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="text-lg font-semibold mb-4 text-gray-800">Welcome Section</h4>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className={`px-6 py-2 rounded text-white font-medium ${
                isSaving
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isSaving ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
            </button>
          </div>
        </form>

        {/* Preview Section */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h4 className="text-lg font-semibold mb-4 text-gray-800">ตัวอย่าง</h4>
          {formData.showWelcome ? (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <h1 className="text-3xl font-bold mb-4">{formData.welcomeTitle}</h1>
              {formData.welcomeSubtitle && (
                <p className="text-gray-600">{formData.welcomeSubtitle}</p>
              )}
            </div>
          ) : (
            <div className="bg-gray-100 rounded-lg p-6 text-center text-gray-500">
              Welcome Section ถูกซ่อน
            </div>
          )}
        </div>
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
