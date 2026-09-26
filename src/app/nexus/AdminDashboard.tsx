"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminDashboard({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState('write');
  const [existingPosts, setExistingPosts] = useState<any[]>([]);
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [blogMaintenanceMode, setBlogMaintenanceMode] = useState(false);

  // 2FA State
  const [totpQR, setTotpQR] = useState("");
  const [totpSecret, setTotpSecret] = useState("");
  const [totpFactorId, setTotpFactorId] = useState("");
  const [totpVerifyCode, setTotpVerifyCode] = useState("");
  const [totpEnrolled, setTotpEnrolled] = useState(false);
  const [totpMessage, setTotpMessage] = useState("");

  useEffect(() => {
    fetchPosts();
    fetchSettings();
    checkTotpEnrolled();
  }, []);

  const fetchPosts = async () => {
    const { data } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
    if (data) setExistingPosts(data);
  };

  const fetchSettings = async () => {
    const { data } = await supabase.from("site_settings").select("*").eq("id", 1).single();
    if (data) {
      setMaintenanceMode(data.is_maintenance_mode || false);
      setBlogMaintenanceMode(data.blog_maintenance_mode || false);
    }
  };

  const checkTotpEnrolled = async () => {
    const { data } = await supabase.auth.mfa.listFactors();
    setTotpEnrolled((data?.totp?.length ?? 0) > 0);
  };

  const startTotpEnrollment = async () => {
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: "Nexus Admin 2FA" });
    if (data) {
      setTotpQR(data.totp.qr_code);
      setTotpSecret(data.totp.secret);
      setTotpFactorId(data.id);
    }
  };

  const verifyTotpEnrollment = async () => {
    const challenge = await supabase.auth.mfa.challenge({ factorId: totpFactorId });
    if (challenge.data) {
      const verify = await supabase.auth.mfa.verify({ factorId: totpFactorId, challengeId: challenge.data.id, code: totpVerifyCode });
      if (!verify.error) {
        setTotpEnrolled(true);
        setTotpMessage("2FA successfully enabled!");
      } else {
        setTotpMessage("Invalid code.");
      }
    }
  };

  const handleSave = async () => {
    if (!slug || !title || !content) return setMessage("Missing required fields.");
    setIsSaving(true);
    
    const { data: existing } = await supabase.from("blog_posts").select("created_at").eq("slug", slug).single();
    const payload = existing 
      ? { title, excerpt, content, updated_at: new Date().toISOString() }
      : { slug, title, excerpt, content, created_at: new Date().toISOString() };
      
    const { error } = await supabase.from("blog_posts").upsert({ slug, ...payload });
    
    setIsSaving(false);
    if (!error) {
      setMessage("Post saved successfully!");
      fetchPosts();
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleDelete = async (deleteSlug: string) => {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    await supabase.from("blog_posts").delete().eq("slug", deleteSlug);
    fetchPosts();
  };

  const toggleSwitch = async (type: 'portfolio' | 'blog') => {
    const isPort = type === 'portfolio';
    const current = isPort ? maintenanceMode : blogMaintenanceMode;
    const updatePayload = isPort ? { is_maintenance_mode: !current } : { blog_maintenance_mode: !current };
    
    await supabase.from("site_settings").update(updatePayload).eq("id", 1);
    if (isPort) setMaintenanceMode(!current);
    else setBlogMaintenanceMode(!current);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[80vh] bg-zinc-950 text-zinc-300 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
      
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-zinc-900/50 border-r border-white/5 flex flex-col p-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 bg-white text-black flex items-center justify-center font-bold rounded shadow-lg shadow-white/10">N</div>
          <div>
            <h2 className="font-bold text-white tracking-tight leading-tight">Nexus OS</h2>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Admin Portal</p>
          </div>
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          {[
            { id: 'write', label: 'Write Post', icon: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z' },
            { id: 'manage', label: 'Manage Posts', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
            { id: 'system', label: 'System Control', icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4' },
            { id: 'security', label: 'Security & 2FA', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' }
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === item.id ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} /></svg>
              {item.label}
            </button>
          ))}
        </nav>

        <button onClick={() => supabase.auth.signOut()} className="mt-auto flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-400/10 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          Secure Logout
        </button>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-6 md:p-10 flex flex-col bg-zinc-950 overflow-y-auto">
        
        {/* TAB: WRITE */}
        {activeTab === 'write' && (
          <div className="flex-1 flex flex-col max-w-4xl animate-fade-in">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-bold text-white tracking-tight">Write Entry</h1>
              <button onClick={handleSave} disabled={isSaving} className="px-6 py-2 bg-white text-black font-semibold rounded hover:bg-zinc-200 transition-colors disabled:opacity-50 flex items-center gap-2">
                {isSaving ? 'Deploying...' : 'Publish'}
              </button>
            </div>
            
            {message && <div className="mb-6 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-sm font-medium">{message}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">URL Slug</label>
                <input value={slug} onChange={e => setSlug(e.target.value)} placeholder="the-great-migration" className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all font-mono text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Post Title</label>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="The Great Migration" className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-all font-medium" />
              </div>
            </div>

            <div className="space-y-2 mb-6">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Excerpt (SEO)</label>
              <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} rows={2} placeholder="A brief summary of the technical deep dive..." className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-all resize-none" />
            </div>

            <div className="space-y-2 flex-1 flex flex-col">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Markdown Content</label>
              <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="## Introduction\n\nLet's talk about scalability..." className="w-full flex-1 bg-zinc-900 border border-white/10 rounded-lg px-4 py-4 text-zinc-300 font-mono text-sm focus:outline-none focus:border-white/30 transition-all min-h-[300px]" />
            </div>
          </div>
        )}

        {/* TAB: MANAGE */}
        {activeTab === 'manage' && (
          <div className="flex-1 animate-fade-in max-w-5xl">
            <h1 className="text-2xl font-bold text-white tracking-tight mb-8">Published Entries</h1>
            <div className="bg-zinc-900/50 border border-white/5 rounded-xl overflow-hidden overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[500px]">
                <thead className="bg-zinc-900 border-b border-white/10 text-xs uppercase tracking-wider text-zinc-500 font-semibold">
                  <tr>
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4 hidden md:table-cell">Date</th>
                    <th className="px-6 py-4 hidden sm:table-cell">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {existingPosts.map(post => (
                    <tr key={post.slug} className="hover:bg-zinc-800/30 transition-colors group">
                      <td className="px-6 py-4 text-white font-medium">{post.title}</td>
                      <td className="px-6 py-4 text-zinc-500 hidden md:table-cell">{new Date(post.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 hidden sm:table-cell"><span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Live</span></td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setSlug(post.slug); setTitle(post.title); setExcerpt(post.excerpt); setContent(post.content); setActiveTab('write'); }} className="text-zinc-400 hover:text-white transition-colors text-xs font-semibold uppercase tracking-wider">Edit</button>
                          <button onClick={() => handleDelete(post.slug)} className="text-red-500 hover:text-red-400 transition-colors text-xs font-semibold uppercase tracking-wider">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {existingPosts.length === 0 && (
                    <tr><td colSpan={4} className="px-6 py-12 text-center text-zinc-500">No entries found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: SYSTEM */}
        {activeTab === 'system' && (
          <div className="flex-1 animate-fade-in max-w-3xl">
            <h1 className="text-2xl font-bold text-white tracking-tight mb-8">System Control Center</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Portfolio Switch */}
              <div className="bg-zinc-900/80 border border-white/5 p-6 rounded-xl flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-white font-semibold mb-1">Portfolio Lock</h3>
                    <p className="text-xs text-zinc-500">Applies zero-latency overlay.</p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${maintenanceMode ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                </div>
                <button onClick={() => toggleSwitch('portfolio')} className={`mt-auto py-3 rounded-lg font-semibold text-sm transition-all ${maintenanceMode ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500 hover:text-black' : 'bg-white/10 text-white border border-white/10 hover:bg-white/20'}`}>
                  {maintenanceMode ? 'LOCKED (Unlock)' : 'LOCK PORTFOLIO'}
                </button>
              </div>

              {/* Blog Switch */}
              <div className="bg-zinc-900/80 border border-white/5 p-6 rounded-xl flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-white font-semibold mb-1">Journal Lock</h3>
                    <p className="text-xs text-zinc-500">Applies zero-latency overlay.</p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${blogMaintenanceMode ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                </div>
                <button onClick={() => toggleSwitch('blog')} className={`mt-auto py-3 rounded-lg font-semibold text-sm transition-all ${blogMaintenanceMode ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500 hover:text-black' : 'bg-white/10 text-white border border-white/10 hover:bg-white/20'}`}>
                  {blogMaintenanceMode ? 'LOCKED (Unlock)' : 'LOCK JOURNAL'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB: SECURITY */}
        {activeTab === 'security' && (
          <div className="flex-1 animate-fade-in max-w-3xl">
            <h1 className="text-2xl font-bold text-white tracking-tight mb-8">Security Configuration</h1>
            <div className="bg-zinc-900/80 border border-white/5 p-8 rounded-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-cyan-500" />
              
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${totpEnrolled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Multi-Factor Authentication</h2>
                  <p className="text-sm text-zinc-500">Status: {totpEnrolled ? <span className="text-emerald-400 font-semibold">Active & Enforced</span> : <span className="text-red-400 font-semibold">Vulnerable (Action Required)</span>}</p>
                </div>
              </div>

              {!totpEnrolled ? (
                <div className="space-y-6 border-t border-white/5 pt-6">
                  {!totpQR ? (
                    <div>
                      <p className="text-sm text-zinc-400 mb-4 leading-relaxed">Secure your admin portal against credential stuffing and brute-force attacks by requiring a time-based one-time password (TOTP) from an authenticator app (e.g. Authy, Google Auth).</p>
                      <button onClick={startTotpEnrollment} className="px-6 py-2 bg-white text-black font-semibold rounded hover:bg-zinc-200 transition-colors">Begin 2FA Enrollment</button>
                    </div>
                  ) : (
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                      <div className="bg-white p-2 rounded-lg">
                        <img src={totpQR} alt="QR Code" className="w-40 h-40" />
                      </div>
                      <div className="flex-1 space-y-4">
                        <p className="text-sm text-zinc-400">Scan this QR code with your authenticator app, then verify it by entering the 6-digit code below.</p>
                        <div className="flex gap-3">
                          <input type="text" maxLength={6} value={totpVerifyCode} onChange={e => setTotpVerifyCode(e.target.value)} placeholder="000000" className="w-32 bg-zinc-950 border border-white/10 rounded px-4 py-2 text-white text-center tracking-widest font-mono focus:border-emerald-500 outline-none" />
                          <button onClick={verifyTotpEnrollment} className="px-4 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded font-semibold hover:bg-emerald-500 hover:text-black transition-all">Verify Code</button>
                        </div>
                        {totpMessage && <p className="text-sm font-medium text-red-400">{totpMessage}</p>}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="border-t border-white/5 pt-6">
                  <p className="text-sm text-zinc-400 mb-6">Your account is heavily secured. Time-based codes are required upon every login.</p>
                  <p className="text-xs text-zinc-600 bg-zinc-950 p-4 rounded border border-white/5 font-mono">Enforced Factor: TOTP (RFC 6238)<br/>Encryption Level: SHA-1 / Base32</p>
                </div>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
