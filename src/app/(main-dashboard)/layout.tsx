"use client";
import { Kanit } from "next/font/google";
import "../globals.css";
import { Providers } from "../context/providers";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { useState } from "react";


import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css';
config.autoAddCss = false


const kanit = Kanit({
  weight: ["300", "400", "500"],
  subsets: ["thai"],
  display: "swap",
  variable: "--font-kanit",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <html lang="en">
      <body className={`${kanit.variable} antialiased`}>
        <Providers>
          <div className="flex h-screen bg-gray-200 font-roboto">
            <Sidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />
            <div className="flex-1 flex flex-col overflow-hidden">
              <Header onToggleSidebar={toggleSidebar} />
              <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200">
                <div className="container mx-auto px-6 py-8">{children}</div>
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
