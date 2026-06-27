import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Project Mnemosyne",
  description: "Memory-first learning OS MVP"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
