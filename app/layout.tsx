import type { Metadata } from "next";
import { TopNav } from "@/components/top-nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mnemosyne — Phrasal Verbs",
  description: "기억을 관리하는 Phrasal Verb 학습 앱",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Mnemosyne",
    statusBarStyle: "default",
  },
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="overflow-x-hidden">
      <body className="overflow-x-hidden w-full">
        <div className="flex min-h-screen flex-col w-full max-w-full overflow-x-hidden">
          {/* Top navigation with PwaNavLink */}
          <TopNav />

          {/* Main content */}
          <main className="flex-1 w-full overflow-x-hidden">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
