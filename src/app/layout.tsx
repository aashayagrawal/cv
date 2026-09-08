import type { Metadata, Viewport } from "next";
import { Cascadia_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const cascadiaMono = Cascadia_Mono({
  variable: "--font-cascadia-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ["ui-monospace", "SFMono-Regular", "Consolas", "monospace"],
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: "Aashay Agrawal",
  description: "",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
  keywords: "Aashay Agrawal, Designer, Portfolio, Designer, Freelancer",
  authors: [{ name: "Aashay Agrawal" }],
  robots: "index, follow",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${cascadiaMono.variable} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
