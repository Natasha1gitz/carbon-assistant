import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AxeCore from "@/components/AxeCore";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Carbon Footprint Assistant",
  description: "Track and reduce your personal carbon footprint with AI insights.",
  openGraph: {
    title: "Carbon Footprint Assistant",
    description: "Track and reduce your personal carbon footprint with AI insights.",
    url: "https://carbon-assistant.vercel.app",
    siteName: "Carbon Assistant",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Carbon Footprint Assistant",
    description: "Track and reduce your personal carbon footprint with AI insights.",
  },
  robots: {
    index: true,
    follow: true,
  },
  keywords: [
    "carbon footprint",
    "sustainability",
    "CO2 calculator",
    "climate action",
    "Gemini AI",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}
      >
        <a
          href="#main-content"
          className="sr-only z-50 rounded bg-emerald-600 p-2 text-white focus:not-sr-only focus:absolute focus:top-4 focus:left-4"
        >
          Skip to main content
        </a>
        <AxeCore />
        <noscript>
          <div style={{ padding: "2rem", textAlign: "center", fontFamily: "system-ui" }}>
            <h2>JavaScript Required</h2>
            <p>
              This application requires JavaScript to calculate your carbon footprint.
              Please enable JavaScript in your browser settings.
            </p>
          </div>
        </noscript>

        {/* Decorative floating particles */}
        <div
          className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
          aria-hidden="true"
        >
          <div className="animate-float absolute top-20 left-10 h-3 w-3 rounded-full bg-emerald-400/20" />
          <div className="animate-float-delayed absolute top-40 right-20 h-2 w-2 rounded-full bg-teal-400/15" />
          <div className="animate-float-slow absolute bottom-40 left-1/4 h-4 w-4 rounded-full bg-emerald-300/10" />
          <div className="animate-float absolute top-1/3 right-1/3 h-2 w-2 rounded-full bg-green-400/20" />
        </div>

        {/* Premium gradient header */}
        <header
          className="relative overflow-hidden"
          style={{ background: "var(--hero-gradient)" }}
        >
          <div
            className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE4YzEuNjU3IDAgMy0xLjM0MyAzLTNzLTEuMzQzLTMtMy0zLTMgMS4zNDMtMyAzIDEuMzQzIDMgMyAzem0xMiAxMmMxLjY1NyAwIDMtMS4zNDMgMy0zcy0xLjM0My0zLTMtMy0zIDEuMzQzLTMgMyAxLjM0MyAzIDMgM3oiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50"
            aria-hidden="true"
          />
          <div className="relative mx-auto flex max-w-5xl items-center justify-between px-4 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-xl shadow-lg backdrop-blur-sm">
                🌍
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white">
                  Carbon Footprint Assistant
                </h1>
                <p className="hidden text-xs font-medium tracking-wide text-emerald-100/90 sm:block">
                  Understand · Track · Reduce
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-emerald-100 backdrop-blur-sm">
                Powered by Gemini AI
              </span>
            </div>
          </div>
        </header>

        <main
          id="main-content"
          tabIndex={-1}
          className="mx-auto max-w-5xl px-4 py-8 outline-none focus:outline-none md:py-12"
        >
          {children}
        </main>

        <footer className="mt-16 border-t border-slate-200/50 dark:border-slate-800/50">
          <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 px-4 py-6 sm:flex-row">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Estimates are for awareness and education — not regulatory accounting.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sources: DEFRA 2023 · EPA · IPCC AR6
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
