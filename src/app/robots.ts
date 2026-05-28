import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/'], // Protect APIs and admin endpoints from crawlers
    },
    sitemap: 'https://cagemind.ai/sitemap.xml',
  };
}
