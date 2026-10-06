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

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const brandName = settings?.brandName || "KALANA";
  const tagline = settings?.tagline || "Space. Coffee. Further Days.";
  const favicon = settings?.faviconUrl || "https://pub-8f312cdd46f04b2bb59eca53807bddfc.r2.dev/kalana/branding/785cdee7-af52-4902-b6a3-dde9904a2421.png";

  return {
    title: `${brandName} | ${tagline}`,
    description: "KALANA is a space, a roastery, and a growing collection of things made for everyday journeys.",
    icons: {
      icon: [
        { url: favicon, sizes: "any" }
      ],
      shortcut: [
        { url: favicon }
      ],
      apple: [
        { url: favicon }
      ],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();
  const favicon = settings?.faviconUrl || "https://pub-8f312cdd46f04b2bb59eca53807bddfc.r2.dev/kalana/branding/785cdee7-af52-4902-b6a3-dde9904a2421.png";

  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="icon" href={favicon} sizes="any" />
          <link rel="shortcut icon" href={favicon} />
          <link rel="apple-touch-icon" href={favicon} />
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
