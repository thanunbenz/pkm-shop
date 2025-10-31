'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlugCircleXmark } from '@fortawesome/free-solid-svg-icons'

export default function ApiError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('API error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <FontAwesomeIcon
          icon={faPlugCircleXmark}
          className="text-orange-500 text-6xl mb-4"
        />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ไม่สามารถเชื่อมต่อได้
        </h1>
        <p className="text-gray-600 mb-6">
          เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์
        </p>

        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 text-white rounded hover:opacity-90 transition-colors"
            style={{ backgroundColor: '#0B264C' }}
          >
            ลองอีกครั้ง
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
          >
            กลับหน้าแรก
          </Link>
        </div>
      </div>
    </div>
  )
}
