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
    <div className="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-[#050505] text-white overflow-hidden">
      
      {/* Background Grid & Glow */}
      <div className="absolute inset-0 z-0 opacity-40" style={{
        backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        maskImage: 'radial-gradient(circle at center, black, transparent 80%)',
        WebkitMaskImage: 'radial-gradient(circle at center, black, transparent 80%)'
      }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none animate-pulse z-0" />
      
      {/* Main Card */}
      <div className="relative z-10 flex flex-col items-center text-center p-12 max-w-xl w-[90%] bg-[#0a0a0c]/70 border border-emerald-500/20 rounded-[24px] shadow-[0_30px_60px_rgba(0,0,0,0.6),inset_0_0_0_1px_rgba(255,255,255,0.05)] backdrop-blur-xl">
        
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-mono font-semibold tracking-wide uppercase mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_12px_#10b981]" />
          System Diagnostics
        </div>

        {/* Orbiting Icon */}
        <div className="w-20 h-20 mb-8 rounded-full border-2 border-dashed border-emerald-500/40 flex items-center justify-center animate-[spin_15s_linear_infinite]">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)] animate-[spin_10s_linear_infinite_reverse]">
            <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          </div>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-4">Infrastructure Upgrade</h1>
        <p className="text-neutral-400 text-base md:text-lg font-light mb-10 leading-relaxed">
          The blog platform is currently undergoing a scheduled architectural enhancement. Deploying performance optimizations and new features. Operations will resume shortly.
        </p>

        {/* Footer Contact */}
        <div className="flex items-center justify-between w-full pt-6 border-t border-white/5">
          <div className="flex items-center gap-3 text-left">
            <img src="https://avatars.githubusercontent.com/u/154442004?v=4" alt="Adarsh" className="w-11 h-11 rounded-full border border-white/10" />
            <div>
              <h3 className="text-base font-semibold text-white leading-tight">Adarsh B A</h3>
              <span className="text-sm text-neutral-400 font-medium">Lead Engineer</span>
            </div>
          </div>
          <a href="mailto:contact@adhi.is-a.dev" className="bg-white text-black px-6 py-2.5 rounded-xl font-bold text-sm hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(255,255,255,0.2)] transition-all">
            Contact
          </a>
        </div>
      </div>
    </div>
  );
}
