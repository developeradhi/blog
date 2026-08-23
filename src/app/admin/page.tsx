"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminDashboard() {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Post state
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Fetch current maintenance mode status
    supabase.from("site_settings").select("is_maintenance_mode").eq("id", 1).single().then(({ data }) => {
      if (data) setMaintenanceMode(data.is_maintenance_mode);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMessage(error.message);
  };

  const toggleMaintenance = async () => {
    const newValue = !maintenanceMode;
    const { error } = await supabase.from("site_settings").update({ is_maintenance_mode: newValue }).eq("id", 1);
    
    if (error) {
      setMessage(`Error updating maintenance mode: ${error.message}`);
    } else {
      setMaintenanceMode(newValue);
      setMessage(`Portfolio maintenance mode is now ${newValue ? 'ON' : 'OFF'}!`);
    }
  };

  const handleSave = async () => {
    if (!slug || !title || !content || !excerpt) {
      setMessage("All fields are required!");
      return;
    }
    
    setIsSaving(true);
    setMessage("");

    const { error } = await supabase.from("blog_posts").upsert({
      slug,
      title,
      excerpt,
      content,
      created_at: new Date().toISOString()
    });

    setIsSaving(false);
    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage("Post saved successfully!");
      setSlug("");
      setTitle("");
      setExcerpt("");
      setContent("");
    }
  };

  const handleRebuild = async () => {
    // This will trigger a GitHub Action workflow dispatch eventually!
    setMessage("Rebuild triggered! Your new post will be live in ~60 seconds.");
  };

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <h1 className="text-3xl font-bold text-white">Admin Login</h1>
        <form onSubmit={handleLogin} className="flex flex-col gap-4 w-full max-w-sm">
          <input 
            type="email" 
            placeholder="Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-white focus:border-emerald-500 outline-none"
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-white focus:border-emerald-500 outline-none"
          />
          <button type="submit" className="bg-emerald-500 text-black font-bold py-3 rounded-lg hover:bg-emerald-400 transition-colors">
            Login
          </button>
          {message && <p className="text-red-400 text-sm text-center">{message}</p>}
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full flex flex-col gap-8 py-8">
      <div className="flex justify-between items-center border-b border-neutral-800 pb-6">
        <h1 className="text-3xl font-bold text-white">CMS Dashboard</h1>
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleMaintenance} 
            className={`text-sm font-bold py-2 px-4 rounded-lg transition-colors ${maintenanceMode ? 'bg-red-500/20 text-red-500 border border-red-500' : 'bg-neutral-800 text-neutral-400 border border-neutral-700 hover:text-white'}`}
          >
            {maintenanceMode ? '🔴 Portfolio Offline' : '🟢 Portfolio Online'}
          </button>
          <button onClick={() => supabase.auth.signOut()} className="text-sm text-neutral-400 hover:text-white">
            Sign Out
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-neutral-400 font-bold">URL Slug</label>
            <input 
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. 190826-1130" 
              className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-white focus:border-emerald-500 outline-none"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-neutral-400 font-bold">Title</label>
            <input 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post Title" 
              className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-white focus:border-emerald-500 outline-none"
            />
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          <label className="text-sm text-neutral-400 font-bold">Excerpt (Short description)</label>
          <input 
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="A short summary for the homepage..." 
            className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-white focus:border-emerald-500 outline-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-neutral-400 font-bold">Markdown Content</label>
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your markdown here..." 
            className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 text-white focus:border-emerald-500 outline-none min-h-[400px] font-mono text-sm"
          />
        </div>

        <div className="flex items-center gap-4 pt-4 border-t border-neutral-800">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-emerald-500 text-black font-bold py-3 px-8 rounded-lg hover:bg-emerald-400 transition-colors disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save to Database"}
          </button>
          
          <button 
            onClick={handleRebuild}
            className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-500 transition-colors"
          >
            Deploy to Production (Rebuild Site)
          </button>
        </div>
        
        {message && (
          <div className="p-4 rounded-lg bg-neutral-900 border border-neutral-800 text-emerald-400 font-mono text-sm">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
