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
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-emerald-600 text-white p-2 rounded z-50"
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
          className="fixed inset-0 pointer-events-none overflow-hidden -z-10"
          aria-hidden="true"
        >
          <div className="absolute top-20 left-10 w-3 h-3 rounded-full bg-emerald-400/20 animate-float" />
          <div className="absolute top-40 right-20 w-2 h-2 rounded-full bg-teal-400/15 animate-float-delayed" />
          <div className="absolute bottom-40 left-1/4 w-4 h-4 rounded-full bg-emerald-300/10 animate-float-slow" />
          <div className="absolute top-1/3 right-1/3 w-2 h-2 rounded-full bg-green-400/20 animate-float" />
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
          <div className="relative max-w-5xl mx-auto px-4 py-5 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center text-xl shadow-lg">
                🌍
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">
                  Carbon Footprint Assistant
                </h1>
                <p className="text-emerald-100/90 text-xs font-medium tracking-wide hidden sm:block">
                  Understand · Track · Reduce
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-emerald-100 text-xs font-medium border border-white/10">
                Powered by Gemini AI
              </span>
            </div>
          </div>
        </header>

        <main
          id="main-content"
          tabIndex={-1}
          className="max-w-5xl mx-auto px-4 py-8 md:py-12 outline-none focus:outline-none"
        >
          {children}
        </main>

        <footer className="border-t border-slate-200/50 dark:border-slate-800/50 mt-16">
          <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col sm:flex-row justify-between items-center gap-2">
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
