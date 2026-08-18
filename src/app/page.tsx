import Link from "next/link";
import { getSortedPostsData } from "@/lib/posts";

export default function Home() {
  const allPostsData = getSortedPostsData();

  return (
    <div className="flex flex-col gap-12">
      <section className="space-y-6 pt-10 pb-8 border-b border-neutral-900">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
          Engineering &amp; Thoughts
        </h1>
        <p className="text-lg text-neutral-400 max-w-2xl">
          Deep dives into Full-Stack Development, System Architecture, and building scalable applications by Adarsh B A.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white mb-6">Latest Posts</h2>
        <div className="flex flex-col gap-8">
          {allPostsData.map(({ slug, title, date, excerpt }) => (
            <article key={slug} className="group relative flex flex-col gap-2 p-4 -mx-4 rounded-2xl hover:bg-neutral-900/50 transition-colors">
              <Link href={`/blog/${slug}`} className="absolute inset-0 z-10">
                <span className="sr-only">View Article</span>
              </Link>
              <div className="flex items-center gap-3 text-sm text-neutral-500 font-mono">
                <time dateTime={date}>{new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</time>
              </div>
              <h3 className="text-xl font-bold text-neutral-200 group-hover:text-emerald-400 transition-colors">
                {title}
              </h3>
              <p className="text-neutral-400 leading-relaxed">
                {excerpt}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
