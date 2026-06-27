import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mnemosyne — Phrasal Verbs",
  description: "기억을 관리하는 Phrasal Verb 학습 앱"
};

function NavIcon({ d, label }: { d: string; label: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label={label}>
      <path d={d} />
    </svg>
  );
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <div className="flex min-h-screen flex-col">
          {/* Top navigation */}
          <header className="sticky top-0 z-40 border-b border-border bg-white/80 backdrop-blur-md">
            <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5">
              <Link href="/" className="flex items-center gap-2.5 text-sm font-bold text-ink transition hover:text-primary">
                <span className="flex h-8 w-8 items-center justify-center rounded-btn bg-primary text-white text-xs font-extrabold">M</span>
                <span className="hidden sm:inline">Mnemosyne</span>
              </Link>

              <div className="flex items-center gap-1">
                <Link
                  href="/"
                  className="flex items-center gap-2 rounded-btn px-3 py-2 text-sm font-semibold text-muted transition hover:bg-surface hover:text-ink"
                >
                  <NavIcon d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" label="홈" />
                  <span className="hidden sm:inline">홈</span>
                </Link>
                <Link
                  href="/units"
                  className="flex items-center gap-2 rounded-btn px-3 py-2 text-sm font-semibold text-muted transition hover:bg-surface hover:text-ink"
                >
                  <NavIcon d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" label="Units" />
                  <span className="hidden sm:inline">Units</span>
                </Link>
                <Link
                  href="/progress"
                  className="flex items-center gap-2 rounded-btn px-3 py-2 text-sm font-semibold text-muted transition hover:bg-surface hover:text-ink"
                >
                  <NavIcon d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" label="Progress" />
                  <span className="hidden sm:inline">진행</span>
                </Link>
              </div>
            </nav>
          </header>

          {/* Main content */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
