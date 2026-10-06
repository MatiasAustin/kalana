import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { ClerkProvider } from '@clerk/nextjs'
import StorefrontOnly from "@/components/StorefrontOnly";
import { getSiteSettings } from "@/lib/cms-api";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const brandName = settings?.brandName || "KALANA";
  const tagline = settings?.tagline || "Space. Coffee. Further Days.";
  const favicon = settings?.faviconUrl || "/favicon.ico";

  return {
    title: `${brandName} | ${tagline}`,
    description: "KALANA is a space, a roastery, and a growing collection of things made for everyday journeys.",
    icons: {
      icon: favicon,
      shortcut: favicon,
      apple: favicon,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();

  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          {settings?.faviconUrl && (
            <link rel="icon" href={settings.faviconUrl} />
          )}
        </head>
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
