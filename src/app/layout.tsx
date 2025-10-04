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
  title: "amirsajjad Code Scaffold - AI-Powered Development",
  description: "Modern Next.js scaffold optimized for AI-powered development with amirsajjad. Built with TypeScript, Tailwind CSS, and shadcn/ui.",
  keywords: ["amirsajjad", "Next.js", "TypeScript", "Tailwind CSS", "shadcn/ui", "AI development", "React"],
  authors: [{ name: "amirsajjad Team" }],
  openGraph: {
    title: "amirsajjad Code Scaffold",
    description: "AI-powered development with modern React stack",
    url: "https://chat.amirsajjad",
    siteName: "amirsajjad",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "amirsajjad Code Scaffold",
    description: "AI-powered development with modern React stack",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
