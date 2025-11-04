'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import * as Sentry from '@sentry/nextjs'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log to console in development
    console.error('Dashboard error:', error)

    // Report to Sentry in production
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_SENTRY_DSN) {
      Sentry.captureException(error, {
        tags: {
          errorBoundary: 'dashboard',
        },
      })
    }
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <FontAwesomeIcon
          icon={faExclamationTriangle}
          className="text-red-500 text-6xl mb-4"
        />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          เกิดข้อผิดพลาดในแดชบอร์ด
        </h1>
        <p className="text-gray-600 mb-6">
          ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง
        </p>

        {process.env.NODE_ENV === 'development' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
            <p className="text-xs font-semibold text-red-800 mb-2">
              Error Details:
            </p>
            <p className="text-sm font-mono text-red-800 break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-red-600 mt-2">
                Digest: {error.digest}
              </p>
            )}
          </div>
        )}

        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 text-white rounded hover:opacity-90 transition-colors"
            style={{ backgroundColor: '#0B264C' }}
          >
            ลองอีกครั้ง
          </button>
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
          >
            กลับแดชบอร์ด
          </Link>
        </div>
      </div>
    </div>
  )
}
