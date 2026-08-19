import { getPostData, getSortedPostsData } from "@/lib/posts";
import Link from "next/link";
import { notFound } from "next/navigation";
import LinkedInComments from "@/components/LinkedInComments";

// Required for Next.js static export
export async function generateStaticParams() {
  const posts = getSortedPostsData();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  let postData;
  try {
    postData = await getPostData(resolvedParams.slug);
  } catch (e) {
    notFound();
  }

  return (
    <article className="flex flex-col gap-8 max-w-3xl mx-auto w-full">
      <header className="flex flex-col gap-4 border-b border-neutral-800 pb-8 pt-8">
        <Link href="/" className="text-sm font-mono text-emerald-500 hover:text-emerald-400 mb-4 inline-flex items-center gap-2 transition-colors">
          &larr; Back to all posts
        </Link>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
          {postData.title}
        </h1>
        <div className="flex items-center gap-3 text-sm text-neutral-500 font-mono mt-2">
          <time dateTime={postData.date}>
            {new Date(postData.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </time>
        </div>
      </header>
      
      <div 
        className="prose prose-invert prose-emerald max-w-none prose-headings:font-bold prose-a:text-emerald-500 hover:prose-a:text-emerald-400 prose-pre:bg-neutral-900 prose-pre:border prose-pre:border-neutral-800"
        dangerouslySetInnerHTML={{ __html: postData.contentHtml || "" }} 
      />

      {/* LinkedIn Style Comments Demo */}
      <LinkedInComments />
    </article>
  );
}
