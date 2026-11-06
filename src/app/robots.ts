import { MetadataRoute } from 'next';
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/nexus', '/nexus/'],
      },
      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'Google-Extended',
          'ClaudeBot',
          'anthropic-ai',
          'PerplexityBot',
          'Applebot-Extended',
          'CCBot',
          'cohere-ai',
        ],
        allow: '/',
        disallow: ['/nexus', '/nexus/'],
      },
    ],
    sitemap: 'https://blog.adhi.is-a.dev/sitemap.xml',
  };
}
