import type { Metadata } from "next";
import { Kanit } from "next/font/google";
import "../globals.css";

import Navbar from "@/components/layout/NavBar";
import Footer from "@/components/layout/Footer";
// import FloatingScrollUp from "@/components/layout/FloatingScrollUp";

import { Providers } from "../context/providers";
import { APP_NAME, APP_DESCRIPTION } from "@/config/constants";

import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css';
config.autoAddCss = false

const kanit = Kanit({
  weight: ["300", "400", "500"],
  subsets: ["thai"],
  display: "swap",
  variable: "--font-kanit",
});

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
  keywords: [
    "Pokémon TCG Live",
    "Pokémon code",
    "buy Pokémon codes",
    "TCG codes",
    "Pokémon card game",
    "digital cards",
    "Pokémon game codes",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${kanit.variable} antialiased`}>
        <Providers>
          <Navbar />
          {children}
          {/* <FloatingScrollUp/> */}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
