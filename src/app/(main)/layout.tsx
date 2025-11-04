"use client";

import Navbar from "@/components/layout/NavBar";
import Footer from "@/components/layout/Footer";
import FloatingScrollToTopButton from "@/components/ui/FloatingScrollToTopButton";
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
      <FloatingScrollToTopButton />
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
