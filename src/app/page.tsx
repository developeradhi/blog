import Link from "next/link";
import { getSortedPostsData } from "@/lib/posts";

export default async function Home() {
  const allPostsData = await getSortedPostsData();

  return (
    <div className="flex flex-col gap-16 pb-20">
      {/* Premium Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/20 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center text-center gap-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium tracking-wide mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Adarsh B A • Developer Blog
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-tight">
            Engineering & <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              System Architecture
            </span>
          </h1>
          <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed mt-4">
            Deep technical dives into Full-Stack Development, scalable architectures, and modern web technologies.
          </p>
        </div>
      </section>

      {/* Post Grid */}
      <section className="max-w-4xl mx-auto w-full px-4">
        <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
          <span className="w-8 h-[2px] bg-emerald-500" />
          Latest Transmissions
        </h2>
        <div className="grid grid-cols-1 gap-6">
          {allPostsData.map(({ slug, title, date, excerpt }) => (
            <article key={slug} className="group relative flex flex-col gap-4 p-8 rounded-3xl bg-neutral-900/40 border border-neutral-800 hover:border-emerald-500/50 hover:bg-neutral-900/80 transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <Link href={`/${slug}`} className="absolute inset-0 z-10">
                <span className="sr-only">View Article</span>
              </Link>
              
              <div className="flex items-center gap-3 text-sm text-neutral-500 font-mono">
                <time dateTime={date}>{new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</time>
                <span>•</span>
                <span>Post #{slug}</span>
              </div>
              
              <h3 className="text-2xl font-bold text-neutral-200 group-hover:text-emerald-400 transition-colors">
                {title}
              </h3>
              
              <p className="text-neutral-400 leading-relaxed">
                {excerpt}
              </p>
              
              <div className="mt-4 flex items-center text-sm font-bold text-emerald-500 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                Read full article <span className="ml-2">→</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
