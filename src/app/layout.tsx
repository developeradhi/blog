import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Fira_Code } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Adarsh B A | Engineering Journal",
  description: "The official engineering journal of Adarsh B A. Deep dives into System Architecture and Scalability.",
  keywords: ["Adarsh B A", "Software Engineer", "System Architecture", "Tech Blog"],
  authors: [{ name: "Adarsh B A", url: "https://adhi.is-a.dev" }],
  creator: "Adarsh B A",
};

import MaintenanceOverlay from "@/components/MaintenanceOverlay";
import CookieConsent from "@/components/CookieConsent";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${firaCode.variable} dark`}>
      <head>
        <style id="maintenance-anti-flicker" dangerouslySetInnerHTML={{ __html: 'body > *:not(#blog-maintenance-overlay) { opacity: 0 !important; pointer-events: none; }' }} />
      </head>
      <body className="antialiased min-h-screen flex flex-col bg-zinc-950 text-zinc-300 selection:bg-zinc-100 selection:text-zinc-950">
        <MaintenanceOverlay />
        <header className="sticky top-0 z-50 backdrop-blur-2xl bg-zinc-950/80 border-b border-white/5">
          <nav className="max-w-5xl mx-auto w-full px-6 h-16 flex items-center justify-between">
            <Link href="/" className="font-bold tracking-tight text-white flex items-center gap-3 group">
              <span className="w-6 h-6 rounded bg-white flex items-center justify-center text-black group-hover:scale-95 transition-transform">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" /></svg>
              </span>
              <span>ADARSH <span className="text-zinc-500 font-normal">JOURNAL</span></span>
            </Link>
            <div className="flex items-center gap-4 sm:gap-8 text-xs font-semibold tracking-wider uppercase">
              <a href="https://adhi.is-a.dev" target="_blank" className="text-zinc-500 hover:text-white transition-colors">Portfolio</a>
              <a href="/nexus" className="text-zinc-500 hover:text-white transition-colors">Nexus</a>
            </div>
          </nav>
        </header>
        
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-12 pb-12 sm:pb-24">
          {children}
        </main>

        <footer className="py-12 border-t border-white/5 mt-auto">
          <div className="max-w-5xl mx-auto w-full px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-zinc-600">
            <p>© {new Date().getFullYear()} Adarsh B A. Engineered in monochrome.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">X (Twitter)</a>
              <a href="#" className="hover:text-white transition-colors">GitHub</a>
            </div>
          </div>
        </footer>
        <CookieConsent />
      </body>
    </html>
  );
}
