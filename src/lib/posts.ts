import { supabase } from "./supabase";

export type PostData = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  contentHtml?: string;
};

// Next.js requires synchronous-looking static paths or simple async fetching during build
export async function getSortedPostsData(): Promise<PostData[]> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("slug, title, excerpt, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching posts from Supabase:", error);
    return [];
  }

  return (data || []).map((post) => ({
    slug: post.slug,
    title: post.title,
    date: post.created_at,
    excerpt: post.excerpt,
  }));
}

export async function getPostData(slug: string): Promise<PostData | null> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("slug, title, excerpt, content, created_at")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    console.error(`Error fetching post ${slug} from Supabase:`, error);
    return null;
  }

  // We are storing raw markdown in Supabase, but we want to render it as HTML.
  // We can use the remark engine here to parse the markdown just like before!
  const { remark } = await import("remark");
  const html = await import("remark-html");

  const processedContent = await remark()
    .use(html.default)
    .process(data.content);
  const contentHtml = processedContent.toString();

  return {
    slug: data.slug,
    title: data.title,
    date: data.created_at,
    excerpt: data.excerpt,
    contentHtml,
  };
}
