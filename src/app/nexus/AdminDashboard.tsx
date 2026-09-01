"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminDashboard({ user }: { user: any }) {
  // Post state
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [blogMaintenanceMode, setBlogMaintenanceMode] = useState(false);

  // Tabs: 'write' | 'manage' | 'settings' | 'security'
  const [activeTab, setActiveTab] = useState('write');
  const [existingPosts, setExistingPosts] = useState<any[]>([]);

  // 2FA Enrollment state
  const [totpQR, setTotpQR] = useState("");
  const [totpSecret, setTotpSecret] = useState("");
  const [totpFactorId, setTotpFactorId] = useState("");
  const [totpVerifyCode, setTotpVerifyCode] = useState("");
  const [totpEnrolled, setTotpEnrolled] = useState(false);
  const [totpMessage, setTotpMessage] = useState("");
  const [totpLoading, setTotpLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchPosts();
    checkTotpEnrolled();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase.from("site_settings").select("is_maintenance_mode, blog_maintenance_mode").eq("id", 1).single();
    if (data) {
      setMaintenanceMode(data.is_maintenance_mode || false);
      setBlogMaintenanceMode(data.blog_maintenance_mode || false);
    }
  };

  const fetchPosts = async () => {
    const { data } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
    if (data) setExistingPosts(data);
  };

  const checkTotpEnrolled = async () => {
    const { data } = await supabase.auth.mfa.listFactors();
    setTotpEnrolled((data?.totp?.length ?? 0) > 0);
  };

  const startTotpEnrollment = async () => {
    setTotpLoading(true);
    setTotpMessage("");
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: "Nexus Admin 2FA" });
    if (error || !data) {
      setTotpMessage("Failed to start enrollment. Try again.");
      setTotpLoading(false);
      return;
    }
    setTotpQR(data.totp.qr_code);
    setTotpSecret(data.totp.secret);
    setTotpFactorId(data.id);
    setTotpLoading(false);
  };

  const verifyTotpEnrollment = async () => {
    if (!totpVerifyCode || totpVerifyCode.length !== 6) {
      setTotpMessage("Enter a valid 6-digit code.");
      return;
    }
    setTotpLoading(true);
    const challenge = await supabase.auth.mfa.challenge({ factorId: totpFactorId });
    if (challenge.error) { setTotpMessage("Challenge failed."); setTotpLoading(false); return; }
    const verify = await supabase.auth.mfa.verify({ factorId: totpFactorId, challengeId: challenge.data.id, code: totpVerifyCode });
    if (verify.error) {
      setTotpMessage("Invalid code. Try again.");
    } else {
      setTotpEnrolled(true);
      setTotpQR("");
      setTotpSecret("");
      setTotpMessage("2FA successfully enabled! Your account is now protected.");
    }
    setTotpLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const togglePortfolioMaintenance = async () => {
    const newValue = !maintenanceMode;
    const { error } = await supabase.from("site_settings").update({ is_maintenance_mode: newValue }).eq("id", 1);
    
    if (error) {
      setMessage("Error updating portfolio setting.");
    } else {
      setMaintenanceMode(newValue);
      setMessage(`Portfolio is now ${newValue ? 'OFFLINE' : 'ONLINE'}.`);
    }
  };

  const toggleBlogMaintenance = async () => {
    const newValue = !blogMaintenanceMode;
    const { error } = await supabase.from("site_settings").update({ blog_maintenance_mode: newValue }).eq("id", 1);
    
    if (error) {
      // If error, it might be because the column doesn't exist yet!
      setMessage("Error: Make sure you ran the SQL to add the blog_maintenance_mode column!");
    } else {
      setBlogMaintenanceMode(newValue);
      setMessage(`Blog is now ${newValue ? 'OFFLINE' : 'ONLINE'}.`);
    }
  };

  const loadPostToEdit = (post: any) => {
    setSlug(post.slug);
    setTitle(post.title);
    setExcerpt(post.excerpt);
    setContent(post.content);
    setActiveTab('write');
  };

  const handleDelete = async (deleteSlug: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    const { error } = await supabase.from("blog_posts").delete().eq("slug", deleteSlug);
    if (!error) {
      fetchPosts();
      setMessage("Post deleted!");
    } else {
      setMessage("Error deleting post.");
    }
  };

  const handleSave = async () => {
    if (!slug || !title || !content || !excerpt) {
      setMessage("All fields are required!");
      return;
    }
    
    setIsSaving(true);
    setMessage("");

    // Check if post already exists (edit vs new)
    const { data: existing } = await supabase
      .from("blog_posts")
      .select("created_at")
      .eq("slug", slug)
      .single();

    const now = new Date().toISOString();

    const { error } = await supabase.from("blog_posts").upsert({
      slug,
      title,
      excerpt,
      content,
      // Only set created_at if this is a NEW post, never overwrite on edit
      created_at: existing?.created_at ?? now,
      updated_at: now,
    }, { onConflict: 'slug' });

    setIsSaving(false);
    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage(existing ? "Post updated successfully!" : "Post published successfully!");
      setSlug("");
      setTitle("");
      setExcerpt("");
      setContent("");
      fetchPosts();
    }
  };

  const handleRebuild = async () => {
    setMessage("Initiating secure deployment...");
    
    const { data: secretData, error: secretError } = await supabase
      .from("site_secrets")
      .select("value")
      .eq("id", "github_pat")
      .single();

    if (secretError || !secretData) {
      setMessage("Error: Secure PAT not found in database. Please run the SQL setup script!");
      return;
    }

    const pat = secretData.value;

    try {
      const response = await fetch("https://api.github.com/repos/developeradhi/blog/actions/workflows/nextjs.yml/dispatches", {
        method: "POST",
        headers: {
          "Accept": "application/vnd.github.v3+json",
          "Authorization": `token ${pat}`
        },
        body: JSON.stringify({ ref: "main" })
      });

      if (response.ok) {
        setMessage("Deployment triggered successfully! Your site will update in ~60 seconds.");
      } else {
        const errorText = await response.text();
        setMessage(`Deployment failed: ${response.status} ${errorText}`);
      }
    } catch (e: any) {
      setMessage(`Deployment error: ${e.message}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full flex flex-col gap-8 py-8">
      <div className="flex justify-between items-center border-b border-neutral-800 pb-6">
        <h1 className="text-3xl font-bold text-white">NEXUS Command Center</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-neutral-500 font-mono hidden sm:inline-block">{user.email}</span>
          <button onClick={handleLogout} className="text-sm text-neutral-400 hover:text-white">
            Sign Out
          </button>
        </div>
      </div>

      {/* Tabs — flex-wrap so they stack on mobile */}
      <div className="flex flex-wrap gap-2 border-b border-neutral-800 pb-4">
        <button
          onClick={() => setActiveTab('write')}
          className={`text-sm font-bold px-4 py-2 rounded-md transition-colors ${activeTab === 'write' ? 'bg-emerald-500/10 text-emerald-500' : 'text-neutral-400 hover:text-white'}`}
        >
          ✍️ Write
        </button>
        <button
          onClick={() => { setActiveTab('manage'); fetchPosts(); }}
          className={`text-sm font-bold px-4 py-2 rounded-md transition-colors ${activeTab === 'manage' ? 'bg-emerald-500/10 text-emerald-500' : 'text-neutral-400 hover:text-white'}`}
        >
          📋 Posts
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`text-sm font-bold px-4 py-2 rounded-md transition-colors ${activeTab === 'settings' ? 'bg-emerald-500/10 text-emerald-500' : 'text-neutral-400 hover:text-white'}`}
        >
          ⚙️ Settings
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`text-sm font-bold px-4 py-2 rounded-md transition-colors ${activeTab === 'security' ? 'bg-amber-500/10 text-amber-400' : 'text-neutral-400 hover:text-white'}`}
        >
          🔐 Security {totpEnrolled ? '✅' : '⚠️'}
        </button>
      </div>

      {activeTab === 'write' && (
        <div className="flex flex-col gap-6">
          {/* Responsive grid: 1 col on mobile, 2 cols on sm+ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
      )}

      {activeTab === 'manage' && (
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-white mb-4">Your Published Posts</h2>
          {existingPosts.map((post) => (
            <div key={post.slug} className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-white">{post.title}</h3>
                <span className="text-sm font-mono text-neutral-500">/{post.slug}</span>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => loadPostToEdit(post)}
                  className="text-emerald-500 hover:text-emerald-400 text-sm font-bold"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(post.slug)}
                  className="text-red-500 hover:text-red-400 text-sm font-bold"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {existingPosts.length === 0 && <p className="text-neutral-500">No posts found in database.</p>}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="flex flex-col gap-6">
          <h2 className="text-xl font-bold text-white">System Maintenance Controls</h2>
          
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 flex flex-col gap-6">
            
            <div className="flex items-center justify-between border-b border-neutral-800 pb-6">
              <div className="flex flex-col">
                <h3 className="font-bold text-white text-lg">Main Portfolio</h3>
                <p className="text-neutral-400 text-sm">developeradhi.github.io / adhi.is-a.dev</p>
              </div>
              <button 
                onClick={togglePortfolioMaintenance} 
                className={`text-sm font-bold py-3 px-6 rounded-lg transition-colors ${maintenanceMode ? 'bg-red-500/20 text-red-500 border border-red-500' : 'bg-neutral-800 text-neutral-400 border border-neutral-700 hover:text-white hover:bg-neutral-700'}`}
              >
                {maintenanceMode ? '🔴 System Offline' : '🟢 System Online'}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <h3 className="font-bold text-white text-lg">Blog Platform</h3>
                <p className="text-neutral-400 text-sm">blog.adhi.is-a.dev (Requires rebuild after toggling)</p>
              </div>
              <button
                onClick={toggleBlogMaintenance}
                className={`text-sm font-bold py-3 px-6 rounded-lg transition-colors ${blogMaintenanceMode ? 'bg-red-500/20 text-red-500 border border-red-500' : 'bg-neutral-800 text-neutral-400 border border-neutral-700 hover:text-white hover:bg-neutral-700'}`}
              >
                {blogMaintenanceMode ? '🔴 System Offline' : '🟢 System Online'}
              </button>
            </div>

          </div>

          {message && (
            <div className="p-4 rounded-lg bg-neutral-900 border border-neutral-800 text-emerald-400 font-mono text-sm">
              {message}
            </div>
          )}
        </div>
      )}

      {/* ── SECURITY TAB ── */}
      {activeTab === 'security' && (
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Account Security</h2>
            <p className="text-sm text-neutral-500">Manage two-factor authentication for your admin account.</p>
          </div>

          {/* 2FA Status */}
          <div className={`p-5 rounded-xl border ${totpEnrolled ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-amber-500/5 border-amber-500/20'}`}>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-2xl">{totpEnrolled ? '✅' : '⚠️'}</span>
              <h3 className="font-bold text-white text-lg">
                Two-Factor Authentication — {totpEnrolled ? 'Enabled' : 'Not Set Up'}
              </h3>
            </div>
            <p className="text-sm text-neutral-400 ml-11">
              {totpEnrolled
                ? 'Your account is protected with TOTP 2FA. You will need your authenticator app every time you log in.'
                : 'Your account is only protected by a password. Enable 2FA to add a second layer of security.'}
            </p>
          </div>

          {/* Enrollment flow */}
          {!totpEnrolled && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex flex-col gap-5">
              {!totpQR ? (
                <div className="flex flex-col gap-3">
                  <h4 className="font-bold text-white">Set Up Authenticator App</h4>
                  <p className="text-sm text-neutral-400">Use Google Authenticator, Authy, or any TOTP app. Click below to generate your QR code.</p>
                  <button
                    onClick={startTotpEnrollment}
                    disabled={totpLoading}
                    className="bg-amber-500 text-black font-bold py-3 px-6 rounded-lg hover:bg-amber-400 transition-colors disabled:opacity-50 self-start"
                  >
                    {totpLoading ? 'Generating...' : 'Generate QR Code'}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  <div>
                    <h4 className="font-bold text-white mb-2">Step 1 — Scan this QR code</h4>
                    <div className="bg-white p-3 rounded-lg inline-block">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={totpQR} alt="2FA QR Code" className="w-48 h-48" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-1">Or enter manually:</h4>
                    <code className="text-xs font-mono text-emerald-400 bg-neutral-800 px-3 py-2 rounded-lg block break-all">{totpSecret}</code>
                  </div>
                  <div className="flex flex-col gap-2">
                    <h4 className="font-bold text-white">Step 2 — Enter the 6-digit code to verify</h4>
                    <div className="flex gap-3 flex-wrap">
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="000000"
                        value={totpVerifyCode}
                        onChange={(e) => setTotpVerifyCode(e.target.value.replace(/\D/g, ''))}
                        className="bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-white text-center text-xl font-mono tracking-widest focus:border-amber-500 outline-none w-40"
                      />
                      <button
                        onClick={verifyTotpEnrollment}
                        disabled={totpLoading}
                        className="bg-emerald-500 text-black font-bold py-3 px-6 rounded-lg hover:bg-emerald-400 transition-colors disabled:opacity-50"
                      >
                        {totpLoading ? 'Verifying...' : 'Activate 2FA'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {totpMessage && (
                <p className={`text-sm font-mono ${totpMessage.includes('success') ? 'text-emerald-400' : 'text-red-400'}`}>
                  {totpMessage}
                </p>
              )}
            </div>
          )}

          {totpEnrolled && totpMessage && (
            <p className="text-emerald-400 font-mono text-sm">{totpMessage}</p>
          )}

          {/* Security tips */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
            <h4 className="font-bold text-white mb-3">Security Checklist</h4>
            <ul className="flex flex-col gap-2 text-sm">
              <li className="flex items-center gap-2 text-neutral-400"><span className={totpEnrolled ? 'text-emerald-400' : 'text-amber-400'}>{totpEnrolled ? '✅' : '⚠️'}</span> Two-Factor Authentication (TOTP)</li>
              <li className="flex items-center gap-2 text-neutral-400"><span className="text-emerald-400">✅</span> Generic error messages on login</li>
              <li className="flex items-center gap-2 text-neutral-400"><span className="text-emerald-400">✅</span> Rate limiting (5 attempts / 15 min lockout)</li>
              <li className="flex items-center gap-2 text-neutral-400"><span className="text-emerald-400">✅</span> Session token in localStorage (managed by Supabase SDK)</li>
              <li className="flex items-center gap-2 text-neutral-400"><span className="text-amber-400">⚠️</span> Email verification — enable in Supabase Dashboard → Auth → Settings</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

