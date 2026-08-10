import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
@@ -35,9 +36,11 @@ export default function RootLayout({
  return (
    <html lang="en" className={plusJakartaSans.variable} suppressHydrationWarning>
      {/* Fixed: Added overflow-x-hidden to prevent mobile horizontal scroll layout breaks */}
      <body className="bg-[#F8FAFC] text-[#0F172A] antialiased selection:bg-[#E11D48] selection:text-white min-h-screen overflow-x-hidden">
        {children}
      </body>
<body className="bg-[#F8FAFC] text-[#0F172A] antialiased selection:bg-[#E11D48] selection:text-white min-h-screen overflow-x-hidden">
  <AuthProvider>
    {children}
  </AuthProvider>
</body>
    </html>
  );
  }
