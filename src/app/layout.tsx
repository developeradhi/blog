import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Fira_Code } from "next/font/google";
import Link from "next/link";
import Script from "next/script";
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
  metadataBase: new URL("https://blog.adhi.is-a.dev"),
  title: {
    default: "Adarsh B A | Engineering Journal",
    template: "%s | Adarsh B A",
  },
  description:
    "The official engineering journal of Adarsh B A. Deep dives into System Architecture, Scalability, Distributed Systems, and Modern Frontend Engineering.",
  keywords: [
    "Adarsh B A",
    "Engineering Journal",
    "Software Engineer",
    "System Architecture",
    "Full Stack Development",
    "Scalability",
    "Next.js",
    "PostgreSQL",
    "Distributed Systems",
    "Tech Blog",
    "adhi.is-a.dev",
  ],
  authors: [{ name: "Adarsh B A", url: "https://adhi.is-a.dev" }],
  creator: "Adarsh B A",
  publisher: "Adarsh B A",
  alternates: {
    canonical: "https://blog.adhi.is-a.dev",
  },
  openGraph: {
    title: "Adarsh B A | Engineering Journal",
    description:
      "Deep dives into System Architecture, Scalability, and modern engineering practices by Adarsh B A.",
    url: "https://blog.adhi.is-a.dev",
    siteName: "Adarsh B A | Engineering Journal",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://adhi.is-a.dev/assets/preview.png",
        width: 1200,
        height: 630,
        alt: "Adarsh B A Engineering Journal Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Adarsh B A | Engineering Journal",
    description:
      "Deep dives into System Architecture, Scalability, and modern engineering practices.",
    site: "@itzz__adhi",
    creator: "@itzz__adhi",
    images: ["https://adhi.is-a.dev/assets/preview.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
  },
};

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || "G-4CX5D140CK";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://blog.adhi.is-a.dev/#website",
      "url": "https://blog.adhi.is-a.dev",
      "name": "Adarsh B A | Engineering Journal",
      "description":
        "Deep dives into System Architecture, Scalability, and modern engineering practices.",
      "publisher": {
        "@id": "https://adhi.is-a.dev/#person",
      },
      "inLanguage": "en-US",
    },
    {
      "@type": "Person",
      "@id": "https://adhi.is-a.dev/#person",
      "name": "Adarsh B A",
      "url": "https://adhi.is-a.dev",
      "jobTitle": "Full-Stack Software Engineer",
      "sameAs": [
        "https://github.com/developeradhi",
        "https://linkedin.com/in/developeradhi",
        "https://twitter.com/itzz__adhi",
      ],
    },
  ],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            />
            <Script
              id="google-analytics-init"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${GA_MEASUREMENT_ID}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        )}
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
              <a href="https://adhi.is-a.dev" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-colors">Portfolio</a>
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
              <a href="https://twitter.com/itzz__adhi" target="_blank" rel="noopener noreferrer" aria-label="Adarsh on X (Twitter)" className="hover:text-white transition-colors">X (Twitter)</a>
              <a href="https://github.com/developeradhi" target="_blank" rel="noopener noreferrer" aria-label="Adarsh on GitHub" className="hover:text-white transition-colors">GitHub</a>
            </div>
          </div>
        </footer>
        <CookieConsent />
      </body>
    </html>
  );
}
