import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'http://localhost:3000';
  const now = new Date().toISOString();

  const staticRoutes = [
    '/',
    '/dumpster-sizes',
    '/homeowners',
    '/commercial',
    '/locations',
    '/resources',
    '/privacy',
    '/terms',
    '/accessibility',
  ];

  return staticRoutes.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: path === '/' ? 1 : 0.7,
  }));
}
