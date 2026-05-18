import type { Metadata } from "next";
import "./globals.css";

export const runtime = 'edge'

export const metadata: Metadata = {
  title: "Innerframe Care Solutions",
  description:
    "Structured compliance, operational systems, and ongoing support for South African old age homes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
