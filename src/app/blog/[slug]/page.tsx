import { getPostData, getSortedPostsData } from "@/lib/posts";
import Link from "next/link";
import { notFound } from "next/navigation";
import LinkedInComments from "@/components/LinkedInComments";

// Required for Next.js static export
export async function generateStaticParams() {
  const posts = await getSortedPostsData();
  if (!posts || posts.length === 0) {
    return [{ slug: 'empty-database-fallback' }];
  }
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const postData = await getPostData(resolvedParams.slug);
  if (!postData) return { title: "Post Not Found | Adarsh B A" };

  const url = `https://blog.adhi.is-a.dev/blog/${postData.slug}`;

  return {
    title: `${postData.title} | Adarsh B A`,
    description: postData.excerpt,
    authors: [{ name: "Adarsh B A", url: "https://adhi.is-a.dev" }],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${postData.title} | Adarsh B A`,
      description: postData.excerpt,
      url,
      type: "article",
      publishedTime: postData.date,
      authors: ["Adarsh B A"],
      images: [
        {
          url: "https://adhi.is-a.dev/assets/preview.png",
          width: 1200,
          height: 630,
          alt: postData.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${postData.title} | Adarsh B A`,
      description: postData.excerpt,
      site: "@itzz__adhi",
      creator: "@itzz__adhi",
      images: ["https://adhi.is-a.dev/assets/preview.png"],
    },
  };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  let postData;
  try {
    postData = await getPostData(resolvedParams.slug);
    if (!postData) notFound();
  } catch (e) {
    notFound();
  }

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: postData.title,
    description: postData.excerpt,
    datePublished: postData.date,
    dateModified: postData.date,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://blog.adhi.is-a.dev/blog/${postData.slug}`,
    },
    author: {
      "@type": "Person",
      name: "Adarsh B A",
      url: "https://adhi.is-a.dev",
    },
    publisher: {
      "@type": "Person",
      name: "Adarsh B A",
      url: "https://adhi.is-a.dev",
    },
    image: "https://adhi.is-a.dev/assets/preview.png",
  };

  return (
    <article className="flex flex-col gap-8 max-w-3xl mx-auto w-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
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
      <LinkedInComments slug={postData.slug} />
    </article>
  );
}
