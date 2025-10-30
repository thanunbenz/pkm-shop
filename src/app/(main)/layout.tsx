"use client";

import Navbar from "@/components/layout/NavBar";
import Footer from "@/components/layout/Footer";
import FloatingScrollUp from "@/components/ui/FloatingScrollUp";
import FloatingCart from "@/components/ui/FloatingCart";
import { ToastContainer, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      {children}
      <FloatingScrollUp />
      <FloatingCart />
      <Footer />
      <ToastContainer
        position="bottom-left"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />
    </>
  );
}
