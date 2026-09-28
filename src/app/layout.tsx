import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { ClerkProvider } from '@clerk/nextjs'
import StorefrontOnly from "@/components/StorefrontOnly";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "KALANA | Space. Coffee. Further Days.",
  description: "KALANA is a space, a roastery, and a growing collection of things made for everyday journeys.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.variable} font-sans antialiased bg-kalana-offwhite text-kalana-black min-h-screen flex flex-col`}>
          <StorefrontOnly>
            <Header />
          </StorefrontOnly>
          <main className="flex-grow">
            {children}
          </main>
          <StorefrontOnly>
            <Footer />
            <CartDrawer />
          </StorefrontOnly>
        </body>
      </html>
    </ClerkProvider>
  );
}
