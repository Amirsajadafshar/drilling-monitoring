import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "سیستم مانیتورینگ چاه‌های نفتی | WITSML",
  description: "سیستم مانیتورینگ زنده چاه‌های نفتی با پشتیبانی از استاندارد WITSML. نمایش پارامترهای حفاری، نمودارهای پیشرفت و داده‌های فنی.",
  keywords: ["مانیتورینگ", "نفت", "WITSML", "چاه نفت", "حفاری", "پارامترهای زنده", "داده", "نمودار", "پارامترهای فنی"],
  authors: [{ name: "تیم توسعه نرم‌افزار" }],
  openGraph: {
    title: "سیستم مانیتورینگ چاه‌های نفتی",
    description: "سیستم مانیتورینگ زنده چاه‌های نفتی با استاندارد WITSML",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "سیستم مانیتورینگ چاه‌های نفتی",
    description: "سیستم مانیتورینگ زنده چاه‌های نفتی با استاندارد WITSML",
  },
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  themeColor: "#1e40af",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
