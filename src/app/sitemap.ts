import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'http://localhost:3000';
  const now = new Date().toISOString();

  // Static pages with optimized priorities and change frequencies
  const staticRoutes = [
    { path: '/', priority: 1.0, changeFrequency: 'daily' as const },
    { path: '/directory', priority: 0.9, changeFrequency: 'daily' as const },
    { path: '/commercial', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/homeowners', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/locations', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/dumpster-sizes', priority: 0.7, changeFrequency: 'weekly' as const },
    { path: '/about', priority: 0.6, changeFrequency: 'monthly' as const },
    { path: '/for-business', priority: 0.6, changeFrequency: 'monthly' as const },
    { path: '/pros', priority: 0.6, changeFrequency: 'monthly' as const },
    { path: '/resources', priority: 0.7, changeFrequency: 'weekly' as const },
    { path: '/resources/size-calculator', priority: 0.6, changeFrequency: 'monthly' as const },
    { path: '/resources/cost-estimator', priority: 0.6, changeFrequency: 'monthly' as const },
    { path: '/resources/rental-guide', priority: 0.6, changeFrequency: 'monthly' as const },
    { path: '/resources/faq', priority: 0.6, changeFrequency: 'monthly' as const },
    { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' as const },
    { path: '/terms', priority: 0.3, changeFrequency: 'yearly' as const },
    { path: '/accessibility', priority: 0.3, changeFrequency: 'yearly' as const },
    { path: '/trust-safety', priority: 0.4, changeFrequency: 'monthly' as const },
  ];

  // Location pages - states
  const states = [
    'virginia', 'maryland', 'north-carolina', 'pennsylvania', 
    'delaware', 'west-virginia', 'district-of-columbia'
  ];
  
  const stateRoutes = states.map(state => ({
    path: `/${state}`,
    priority: 0.7,
    changeFrequency: 'weekly' as const
  }));

  // Major cities for Virginia (primary market)
  const virginiaCities = [
    'ashburn', 'sterling', 'reston', 'herndon', 'leesburg', 'fairfax',
    'chantilly', 'arlington', 'alexandria', 'mclean', 'vienna', 'falls-church',
    'manassas', 'richmond', 'virginia-beach', 'norfolk', 'chesapeake',
    'newport-news', 'hampton', 'portsmouth', 'suffolk'
  ];

  const cityRoutes = virginiaCities.map(city => ({
    path: `/virginia/${city}`,
    priority: 0.6,
    changeFrequency: 'weekly' as const
  }));

  // Combine all routes
  const allRoutes = [...staticRoutes, ...stateRoutes, ...cityRoutes];

  return allRoutes.map((route) => ({
    url: `${siteUrl}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
