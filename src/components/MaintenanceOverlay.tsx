"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function MaintenanceOverlay() {
  const pathname = usePathname();
  const [isMaintenance, setIsMaintenance] = useState(false);

  useEffect(() => {
    // Check initial state
    const checkStatus = async () => {
      try {
        const { data } = await supabase.from("site_settings").select("blog_maintenance_mode").eq("id", 1).single();
        if (data?.blog_maintenance_mode) {
          setIsMaintenance(true);
        } else {
          setIsMaintenance(false);
          const flicker = document.getElementById('maintenance-anti-flicker');
          if(flicker) flicker.remove();
        }
      } catch (e) {
        setIsMaintenance(false);
        const flicker = document.getElementById('maintenance-anti-flicker');
        if(flicker) flicker.remove();
      }
    };
    
    checkStatus();

    // Poll every 5 seconds for instant updates (same as portfolio)
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  // Never block the admin portal!
  if (pathname === "/nexus" || pathname?.startsWith("/nexus/")) {
    if (typeof window !== "undefined") {
      const flicker = document.getElementById('maintenance-anti-flicker');
      if(flicker) flicker.remove();
    }
    return null;
  }

  if (!isMaintenance) return null;

  return (
    <div className="fixed inset-0 z-[999999] overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      
      {/* Full-bleed cinematic background — writer's desk with warm lamp */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=85&w=2400')" }}
      />
      {/* Dual-layer overlay: warmth + readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/75 via-black/55 to-black/80" />
      <div className="absolute inset-0 backdrop-blur-[2px]" />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-8 py-6">
        <span style={{ fontFamily: "'Fira Code', monospace", fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.08em' }}>
          blog.adhi.is-a.dev
        </span>
        <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em' }}>
          EST. 2024
        </span>
      </div>

      {/* Centered frosted-glass card */}
      <div className="absolute inset-0 z-10 flex items-center justify-center px-6">
        <div style={{
          background: 'rgba(255, 255, 255, 0.06)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '20px',
          padding: 'clamp(2rem, 5vw, 4rem) clamp(2rem, 6vw, 5rem)',
          maxWidth: '700px',
          width: '100%',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
          textAlign: 'center',
        }}>
          {/* Amber dot + label */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '2rem' }}>
            <span style={{
              width: '9px', height: '9px', borderRadius: '50%',
              background: '#f59e0b',
              boxShadow: '0 0 0 3px rgba(245,158,11,0.25)',
              display: 'inline-block',
              animation: 'mBlink 1.8s ease-in-out infinite',
            }} />
            <span style={{
              fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)',
            }}>
              System Maintenance
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
            fontWeight: 800, color: '#ffffff',
            letterSpacing: '-0.03em', lineHeight: 1.1,
            marginBottom: '1.25rem',
          }}>
            Brief Interruption
          </h1>

          <p style={{
            fontSize: '1.1rem', color: 'rgba(255,255,255,0.65)',
            lineHeight: 1.75, maxWidth: '480px',
            margin: '0 auto 2.8rem',
          }}>
            We're updating the publishing engine with new tools and fresh optimizations. The blog will be back up shortly — thank you for your patience.
          </p>

          {/* Thin divider */}
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', maxWidth: '360px', margin: '0 auto 2.5rem' }} />

          {/* CTA Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <a href="mailto:contact@adhi.is-a.dev" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: '#fff', color: '#0f172a',
              padding: '13px 28px', borderRadius: '10px',
              fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none',
              transition: 'all 0.2s', letterSpacing: '0.01em',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              Contact Support
            </a>
            <a href="https://adhi.is-a.dev" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(255,255,255,0.08)', color: '#fff',
              border: '1px solid rgba(255,255,255,0.18)',
              padding: '13px 28px', borderRadius: '10px',
              fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none',
              transition: 'all 0.2s',
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              Visit Portfolio
            </a>
          </div>
        </div>
      </div>

      {/* Animation keyframes */}
      <style>{`@keyframes mBlink { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
    </div>
  );
}

