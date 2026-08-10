import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
});

export const metadata: Metadata = {
  title: "Mithaas Express - Delivery Partner Platform",
  description: "Join Mithaas Express as a delivery partner. Earn with flexible hours, weekly payouts, and performance rewards.",
  keywords: "delivery partner, food delivery, Mithaas, courier, earn money",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={plusJakartaSans.variable} suppressHydrationWarning>
      <body className="bg-[#F8FAFC] text-[#0F172A] antialiased selection:bg-[#0F766E] selection:text-white min-h-screen overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
