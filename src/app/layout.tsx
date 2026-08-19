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
  title: "Adarsh B A | Blog",
  description: "Personal developer blog of Adarsh B A. Thoughts on Full-Stack Engineering, Next.js, and System Architecture.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${plusJakarta.variable} ${firaCode.variable}`}>
      <body className="antialiased min-h-screen flex flex-col bg-[#070709] text-neutral-300 selection:bg-emerald-500/30 selection:text-emerald-200">
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#070709]/70 border-b border-neutral-800/50">
          <nav className="max-w-4xl mx-auto w-full px-6 h-20 flex items-center justify-between">
            <Link href="/" className="font-bold text-xl tracking-tight text-white flex items-center gap-2 group">
              <span className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-neutral-950 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
              </span>
              ADARSH <span className="text-neutral-500 font-light">BLOG</span>
            </Link>
            <div className="flex items-center gap-6 text-sm font-medium">
              <a href="https://developeradhi.is-a.dev" target="_blank" className="text-neutral-400 hover:text-emerald-400 transition-colors">Portfolio</a>
              <a href="https://github.com/developeradhi" target="_blank" className="text-neutral-400 hover:text-emerald-400 transition-colors">GitHub</a>
            </div>
          </nav>
        </header>
        
        <main className="flex-1 w-full max-w-4xl mx-auto px-6">
          {children}
        </main>

        <footer className="py-12 border-t border-neutral-900 mt-20">
          <div className="max-w-4xl mx-auto w-full px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-neutral-500">
            <p>© {new Date().getFullYear()} Adarsh B A. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
              <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
