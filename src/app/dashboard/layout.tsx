"use client";
import Sidebar from "@/components/layout/DashboardSidebar";
import Header from "@/components/layout/Header";
import { useState } from "react";
import { SessionProvider } from "next-auth/react";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <SessionProvider>
      <div className="flex h-screen bg-gray-200">
        <Sidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onToggleSidebar={toggleSidebar} />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200">
            <div className="container mx-auto px-6 py-8">{children}</div>
          </main>
        </div>
      </div>
    </SessionProvider>
  );
}
