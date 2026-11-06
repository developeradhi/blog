import { MetadataRoute } from 'next';
export const dynamic = "force-static";
import { getSortedPostsData } from '@/lib/posts';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getSortedPostsData();
  
  const postUrls = posts.map((post) => ({
    url: `https://blog.adhi.is-a.dev/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: 'https://blog.adhi.is-a.dev',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://blog.adhi.is-a.dev/llms.txt',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...postUrls,
  ];
}
