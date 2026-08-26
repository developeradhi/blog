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
    <div className="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-black text-white overflow-hidden">
      
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-[20s] ease-linear hover:scale-105"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=2000')" }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      </div>
      
      {/* Main Card */}
      <div className="relative z-10 flex flex-col items-start p-10 md:p-14 max-w-2xl w-[90%] bg-black/40 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-md">
        
        <div className="flex items-center gap-2 mb-8">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-emerald-500 text-sm font-semibold tracking-widest uppercase">System Maintenance</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">Brief Interruption</h1>
        <p className="text-neutral-300 text-lg font-light mb-10 leading-relaxed max-w-lg">
          We are currently updating our publishing infrastructure. New articles and system optimizations are being deployed. Thank you for your patience.
        </p>

        {/* Footer Contact */}
        <div className="flex flex-wrap items-center gap-4">
          <a href="mailto:contact@adhi.is-a.dev" className="bg-white text-black px-8 py-3 rounded-lg font-semibold text-sm hover:bg-neutral-200 transition-colors">
            Contact Support
          </a>
          <a href="https://adhi.is-a.dev" className="bg-transparent text-white border border-white/20 px-8 py-3 rounded-lg font-semibold text-sm hover:bg-white/10 transition-colors">
            View Portfolio
          </a>
        </div>
      </div>
    </div>
  );
}
