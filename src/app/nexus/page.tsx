"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import AdminDashboard from "./AdminDashboard";
import LoginForm from "./LoginForm";

export default function NexusPage() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center text-white">Loading secure environment...</div>;
  }

  if (!session?.user) {
    return <LoginForm />;
  }

  return <AdminDashboard user={session.user} />;
}
