import Link from 'next/link';
import { ArrowRight, Terminal, BookOpen, Clock } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mznzvxwzugimqzhhdnae.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16bnp2eHd6dWdpbXF6aGhkbmFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5ODkzNjksImV4cCI6MjEwMTU2NTM2OX0.AL0sY92IZeP_vSyqYRoKoKkE3oMPvNYukNU3uNbJhWs';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default async function Home() {
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false });

  return (
    <main className="min-h-screen bg-[#070709] text-slate-200 overflow-hidden relative font-sans">
      <div className="ambient-glow"></div>
      <div className="noise-overlay"></div>

      <div className="max-w-5xl mx-auto px-6 py-24 relative z-10">
        <header className="mb-20 fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold tracking-wide uppercase mb-6">
            <Terminal size={14} /> Engineering Journal
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-slate-100 via-slate-300 to-indigo-400">
            Building at the <br className="hidden md:block"/> Edge of Compute.
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl leading-relaxed">
            Deep dives into frontend architecture, database reliability, and the engineering decisions behind scalable applications.
          </p>
        </header>

        <section>
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
            <h2 className="text-2xl font-semibold text-slate-100 flex items-center gap-3">
              <BookOpen size={24} className="text-indigo-400" /> Latest Entries
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {posts && posts.length > 0 ? (
              posts.map(post => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="group block h-full">
                  <article className="glass-panel rounded-3xl p-8 h-full transition-all duration-300 hover:bg-white/[0.02] hover:-translate-y-1">
                    <div className="flex items-center gap-3 text-xs font-medium text-slate-500 mb-4">
                      <time dateTime={post.created_at}>{new Date(post.created_at).toLocaleDateString()}</time>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Clock size={12}/> {post.reading_time || '5'} min read</span>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-100 mb-3 group-hover:text-indigo-400 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed mb-6 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-2 text-indigo-400 text-sm font-semibold mt-auto">
                      Read entry <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </article>
                </Link>
              ))
            ) : (
              <div className="col-span-2 text-center p-12 border border-dashed border-white/10 rounded-3xl bg-black/20">
                <p className="text-slate-400">No transmissions found. Establish uplink to Supabase Database to begin.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
