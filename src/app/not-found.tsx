"use client";

import Link from "next/link";

export default function GlobalNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="inline-block relative">
            <div className="text-9xl font-bold text-blue-600 opacity-20 select-none">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                className="w-32 h-32 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          ไม่พบหน้าที่ค้นหา
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
          ขอโทษค่ะ เราไม่พบหน้าที่คุณกำลังมองหา
          อาจจะถูกย้ายหรือลบไปแล้ว
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            กลับหน้าแรก
          </Link>

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center px-6 py-3 bg-white text-gray-700 font-medium rounded-lg border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-colors duration-200"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            กลับหน้าก่อนหน้า
          </button>
        </div>

        {/* Popular Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">
            หน้าที่คุณอาจจะสนใจ:
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline"
            >
              หน้าแรก
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              href="/orders"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline"
            >
              คำสั่งซื้อของฉัน
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              href="/profile"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline"
            >
              โปรไฟล์
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              href="/cart"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline"
            >
              ตะกร้าสินค้า
            </Link>
          </div>
        </div>

        {/* Footer Note */}
        <p className="mt-8 text-xs text-gray-400">
          Error Code: 404 - Page Not Found
        </p>
      </div>
    </div>
  );
}
