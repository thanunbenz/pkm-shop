// components/Sidebar.tsx
// import { FaBars, FaCalendarAlt, FaSignOutAlt } from 'react-icons/fa';

export default function Sidebar() {
  return (
    <aside className="w-[90px] h-screen bg-[#23876E] flex flex-col justify-between py-6">
      {/* Top Section */}
      <div className="flex flex-col items-center space-y-10">
        {/* เมนูหลัก */}
        <div className="flex flex-col items-center space-y-1">
          {/* <FaBars className="text-yellow-300 text-2xl" /> */}
          <span className="text-yellow-300 text-sm font-bold">เมนูหลัก</span>
        </div>

        {/* ตารางเวลาเรียน */}
        <div className="relative w-full flex justify-center">
          <div className="absolute left-full -ml-3 w-[50px] h-[50px] rounded-full bg-white flex items-center justify-center shadow-md">
            {/* <FaCalendarAlt className="text-yellow-300 text-lg" /> */}
          </div>
          <span className="text-white text-sm font-bold mt-[60px]">ตารางเวลาเรียน</span>
        </div>
      </div>

      {/* ออกจากระบบ */}
      <div className="flex flex-col items-center space-y-1">
        {/* <FaSignOutAlt className="text-yellow-300 text-xl" /> */}
        <span className="text-white text-sm font-bold">ออกจากระบบ</span>
      </div>
    </aside>
  );
}
