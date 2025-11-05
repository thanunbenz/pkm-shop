"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import logger from "@/lib/logger";

interface UserProfile {
  id: number;
  fname: string;
  lname: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface ProfileUpdatePayload {
  fname?: string;
  lname?: string;
  email?: string;
  currentPassword?: string;
}

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    email: "",
    currentPassword: "",
  });

  const [isEmailChanging, setIsEmailChanging] = useState(false);

  // Fetch profile data
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      fetchProfile();
    }
  }, [status, router]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/v1/users/profile");
      const data = await response.json();

      if (data.success) {
        setProfile(data.data);
        setFormData({
          fname: data.data.fname,
          lname: data.data.lname,
          email: data.data.email,
          currentPassword: "",
        });
      } else {
        toast.error(data.error || "ไม่สามารถโหลดข้อมูลได้");
      }
    } catch (error) {
      logger.error("Failed to fetch user profile", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId: session?.user?.id,
      });
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Check if email is being changed
    if (name === "email" && profile) {
      setIsEmailChanging(value !== profile.email);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profile) return;

    // Check if there are any changes
    const hasChanges =
      formData.fname !== profile.fname ||
      formData.lname !== profile.lname ||
      formData.email !== profile.email;

    if (!hasChanges) {
      toast.error("ไม่มีข้อมูลที่ต้องการแก้ไข");
      return;
    }

    // Validate email change requires password
    if (isEmailChanging && !formData.currentPassword) {
      toast.error("กรุณาใส่รหัสผ่านปัจจุบันเพื่อยืนยันการเปลี่ยนอีเมล");
      return;
    }

    try {
      setUpdating(true);

      const updatePayload: ProfileUpdatePayload = {};

      if (formData.fname !== profile.fname) {
        updatePayload.fname = formData.fname;
      }
      if (formData.lname !== profile.lname) {
        updatePayload.lname = formData.lname;
      }
      if (formData.email !== profile.email) {
        updatePayload.email = formData.email;
        updatePayload.currentPassword = formData.currentPassword;
      }

      const response = await fetch("/api/v1/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatePayload),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message || "อัพเดทข้อมูลสำเร็จ");
        setProfile(data.data);
        setFormData({
          fname: data.data.fname,
          lname: data.data.lname,
          email: data.data.email,
          currentPassword: "",
        });
        setIsEmailChanging(false);

        // Update session if email changed
        if (updatePayload.email) {
          await update({
            ...session,
            user: {
              ...session?.user,
              email: data.data.email,
            },
          });
        }
      } else {
        toast.error(data.error || "ไม่สามารถอัพเดทข้อมูลได้");
      }
    } catch (error) {
      logger.error("Failed to update user profile", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId: session?.user?.id,
      });
      toast.error("เกิดข้อผิดพลาดในการอัพเดทข้อมูล");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">ไม่พบข้อมูลผู้ใช้</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ข้อมูลส่วนตัว</h1>
          <p className="mt-2 text-gray-600">
            จัดการข้อมูลส่วนตัวและอีเมลของคุณ
          </p>
        </div>

        {/* Profile Form */}
        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* User Info */}
            <div className="pb-6 border-b border-gray-200">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID
                  </label>
                  <input
                    type="text"
                    value={profile.id}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    สถานะ
                  </label>
                  <input
                    type="text"
                    value={
                      profile.role === "ADMIN"
                        ? "ผู้ดูแลระบบ"
                        : profile.role === "OPERATOR"
                        ? "พนักงาน"
                        : "ผู้ใช้งาน"
                    }
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Editable Fields */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="fname"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    ชื่อ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="fname"
                    name="fname"
                    value={formData.fname}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="lname"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    นามสกุล <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="lname"
                    name="lname"
                    value={formData.lname}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  อีเมล <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {isEmailChanging && (
                  <p className="mt-1 text-sm text-amber-600">
                    ⚠️ การเปลี่ยนอีเมลต้องการรหัสผ่านยืนยัน
                  </p>
                )}
              </div>

              {/* Password Field (shown only when email is changing) */}
              {isEmailChanging && (
                <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                  <label
                    htmlFor="currentPassword"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    รหัสผ่านปัจจุบัน <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    placeholder="กรุณาใส่รหัสผ่านเพื่อยืนยันการเปลี่ยนอีเมล"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-600">
                    เพื่อความปลอดภัย กรุณายืนยันรหัสผ่านเมื่อเปลี่ยนอีเมล
                  </p>
                </div>
              )}
            </div>

            {/* Metadata */}
            <div className="pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm text-gray-600">
                <div>
                  <span className="font-medium">สร้างเมื่อ:</span>{" "}
                  {new Date(profile.createdAt).toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                <div>
                  <span className="font-medium">แก้ไขล่าสุด:</span>{" "}
                  {new Date(profile.updatedAt).toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={updating}
                className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {updating ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
              </button>
            </div>
          </form>
        </div>

        {/* Additional Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">
            ℹ️ ข้อมูลเพิ่มเติม
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• การเปลี่ยนอีเมลต้องการรหัสผ่านยืนยันเพื่อความปลอดภัย</li>
            <li>• ระบบจะบันทึกประวัติการแก้ไขข้อมูลทุกครั้ง</li>
            <li>
              • หากต้องการเปลี่ยนรหัสผ่าน กรุณาติดต่อผู้ดูแลระบบ (เร็วๆ นี้)
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
