export default function DashboardLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 mb-4" style={{ borderColor: '#0B264C' }}></div>
        <p className="text-gray-600 text-lg">กำลังโหลดแดชบอร์ด...</p>
      </div>
    </div>
  )
}
