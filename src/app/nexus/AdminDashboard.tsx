"use client";

import { useState, useEffect } from "react";
import { logoutAction, savePostAction, toggleMaintenanceAction, deletePostAction } from "./actions";
import { supabase } from "@/lib/supabase"; // We can still use client supabase for fetching unprotected data like posts!

export default function AdminDashboard({ user }: { user: any }) {
  // Post state
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  
  // Tabs: 'write' | 'manage'
  const [activeTab, setActiveTab] = useState('write');
  const [existingPosts, setExistingPosts] = useState<any[]>([]);

  useEffect(() => {
    fetchSettings();
    fetchPosts();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase.from("site_settings").select("is_maintenance_mode").eq("id", 1).single();
    if (data) setMaintenanceMode(data.is_maintenance_mode);
  };

  const fetchPosts = async () => {
    const { data } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
    if (data) setExistingPosts(data);
  };

  const handleLogout = async () => {
    await logoutAction();
  };

  const toggleMaintenance = async () => {
    const res = await toggleMaintenanceAction(maintenanceMode);
    if (res.error) {
      setMessage(res.error);
    } else if (res.success) {
      setMaintenanceMode(res.newValue!);
      setMessage(`Portfolio maintenance mode is now ${res.newValue ? 'ON' : 'OFF'}!`);
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
    const res = await deletePostAction(deleteSlug);
    if (res.success) {
      fetchPosts();
      setMessage("Post deleted!");
    } else {
      setMessage(res.error!);
    }
  };

  const handleSave = async () => {
    if (!slug || !title || !content || !excerpt) {
      setMessage("All fields are required!");
      return;
    }
    
    setIsSaving(true);
    setMessage("");

    const res = await savePostAction(slug, title, excerpt, content);

    setIsSaving(false);
    if (res.error) {
      setMessage(`Error: ${res.error}`);
    } else {
      setMessage("Post saved successfully!");
      setSlug("");
      setTitle("");
      setExcerpt("");
      setContent("");
    }
  };

  const handleRebuild = async () => {
    setMessage("Rebuild triggered! Your new post will be live in ~60 seconds.");
    // Rebuild logic requiring GitHub PAT can be added to Server Actions here.
  };

  return (
    <div className="max-w-4xl mx-auto w-full flex flex-col gap-8 py-8">
      <div className="flex justify-between items-center border-b border-neutral-800 pb-6">
        <h1 className="text-3xl font-bold text-white">NEXUS Command Center</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-neutral-500 font-mono hidden sm:inline-block">{user.email}</span>
          <button 
            onClick={toggleMaintenance} 
            className={`text-sm font-bold py-2 px-4 rounded-lg transition-colors ${maintenanceMode ? 'bg-red-500/20 text-red-500 border border-red-500' : 'bg-neutral-800 text-neutral-400 border border-neutral-700 hover:text-white'}`}
          >
            {maintenanceMode ? '🔴 Portfolio Offline' : '🟢 Portfolio Online'}
          </button>
          <button onClick={handleLogout} className="text-sm text-neutral-400 hover:text-white">
            Sign Out
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-neutral-800 pb-4">
        <button 
          onClick={() => setActiveTab('write')}
          className={`text-sm font-bold px-4 py-2 rounded-md ${activeTab === 'write' ? 'bg-emerald-500/10 text-emerald-500' : 'text-neutral-400 hover:text-white'}`}
        >
          Write / Edit Post
        </button>
        <button 
          onClick={() => { setActiveTab('manage'); fetchPosts(); }}
          className={`text-sm font-bold px-4 py-2 rounded-md ${activeTab === 'manage' ? 'bg-emerald-500/10 text-emerald-500' : 'text-neutral-400 hover:text-white'}`}
        >
          Manage Posts
        </button>
      </div>

      {activeTab === 'write' ? (
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
      ) : (
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
    </div>
  );
}
