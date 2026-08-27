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

      {/* Full-bleed cinematic background — writer's desk */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1455390582262-044cdead277a?q=90&w=2400')" }}
      />
      {/* Dark overlay for readability */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(20,20,25,0.72) 0%, rgba(20,20,25,0.60) 60%, rgba(20,20,25,0.80) 100%)' }} />

      {/* Top Navbar — dark bar exactly like mockup */}
      <div className="absolute top-0 left-0 right-0 z-10" style={{
        background: 'rgba(22, 22, 28, 0.90)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '18px 32px',
        display: 'flex', alignItems: 'center',
      }}>
        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.01em' }}>
          blog.adhi.is-a.dev
        </span>
      </div>

      {/* Centered frosted-glass card — matches mockup proportions */}
      <div className="absolute inset-0 z-10 flex items-center justify-center px-6">
        <div style={{
          background: 'rgba(30, 30, 38, 0.55)',
          border: '1px solid rgba(255, 255, 255, 0.10)',
          borderRadius: '16px',
          padding: 'clamp(2.5rem, 5vw, 4rem) clamp(2.5rem, 6vw, 5rem)',
          maxWidth: '680px',
          width: '100%',
          backdropFilter: 'blur(32px) saturate(160%)',
          WebkitBackdropFilter: 'blur(32px) saturate(160%)',
          textAlign: 'center',
        }}>
          <h1 style={{
            fontSize: 'clamp(2.6rem, 5.5vw, 4.2rem)',
            fontWeight: 800, color: '#ffffff',
            letterSpacing: '-0.03em', lineHeight: 1.05,
            marginBottom: '1.2rem', marginTop: 0,
          }}>
            Brief Interruption
          </h1>

          <p style={{
            fontSize: '1.05rem', color: 'rgba(255,255,255,0.70)',
            lineHeight: 1.75, maxWidth: '500px',
            margin: '0 auto 2.5rem',
          }}>
            We&apos;re currently performing scheduled maintenance to enhance your reading experience. The blog will be back online shortly. Thanks for your patience.
          </p>

          {/* CTA Buttons — outlined + blue filled, exactly like mockup */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <a href="mailto:contact@adhi.is-a.dev" style={{
              display: 'inline-flex', alignItems: 'center',
              background: 'rgba(255,255,255,0.08)', color: '#fff',
              border: '1px solid rgba(255,255,255,0.25)',
              padding: '12px 28px', borderRadius: '8px',
              fontWeight: 600, fontSize: '0.95rem', textDecoration: 'none',
            }}>
              Contact Support
            </a>
            <a href="https://adhi.is-a.dev" style={{
              display: 'inline-flex', alignItems: 'center',
              background: '#1d4ed8', color: '#fff',
              border: '1px solid #2563eb',
              padding: '12px 28px', borderRadius: '8px',
              fontWeight: 600, fontSize: '0.95rem', textDecoration: 'none',
            }}>
              Visit Portfolio
            </a>
          </div>
        </div>
      </div>

      {/* Bottom-left System Maintenance pill — exactly like mockup */}
      <div className="absolute bottom-6 left-6 z-10" style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        background: 'rgba(22,22,28,0.80)', border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '100px', padding: '8px 16px',
        backdropFilter: 'blur(12px)',
      }}>
        <span style={{
          width: '8px', height: '8px', borderRadius: '50%',
          background: '#22c55e', display: 'inline-block',
          boxShadow: '0 0 0 3px rgba(34,197,94,0.2)',
          animation: 'mBlink 1.8s ease-in-out infinite',
        }} />
        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255,255,255,0.75)', letterSpacing: '0.02em' }}>
          System Maintenance
        </span>
      </div>

      <style>{`@keyframes mBlink { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
    </div>
  );
}
