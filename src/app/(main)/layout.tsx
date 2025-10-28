import Navbar from "@/components/layout/NavBar";
import Footer from "@/components/layout/Footer";
// import FloatingScrollUp from "@/components/layout/FloatingScrollUp";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      {children}
      {/* <FloatingScrollUp/> */}
      <Footer />
    </>
  );
}
