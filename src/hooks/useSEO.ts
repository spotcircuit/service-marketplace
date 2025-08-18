'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export interface SEOData {
  title: string;
  description: string;
  keywords: string;
  canonical: string;
  ogImage?: string;
  structuredData?: any;
  internalLinks?: any[];
}

export interface UseSEOOptions {
  pageType?: 'home' | 'location' | 'service' | 'size' | 'guide' | 'blog' | 'about' | 'contact';
  city?: string;
  state?: string;
  service?: string;
  size?: string;
  customTitle?: string;
  customDescription?: string;
  customKeywords?: string[];
}

export function useSEO(options: UseSEOOptions = {}): SEOData {
  const pathname = usePathname();
  const [seoData, setSEOData] = useState<SEOData>({
    title: 'Dumpster Rental Near Me | Hometown Dumpster Rental',
    description: 'Find affordable dumpster rental services near you. Same-day delivery, no hidden fees. Sizes from 10-40 yards.',
    keywords: 'dumpster rental, roll off dumpster, waste management, junk removal',
    canonical: `https://dumpquote.co${pathname}`
  });

  useEffect(() => {
    // Fetch SEO data from API or generate client-side
    async function fetchSEO() {
      try {
        const response = await fetch('/api/seo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pathname,
            ...options
          })
        });

        if (response.ok) {
          const data = await response.json();
          setSEOData(data);
        }
      } catch (error) {
        console.error('Error fetching SEO data:', error);
        // Fall back to default generation
        generateClientSideSEO();
      }
    }

    function generateClientSideSEO() {
      const { pageType, city, state, service, size, customTitle, customDescription, customKeywords } = options;
      
      // Generate title
      let title = customTitle || 'Dumpster Rental Near Me | Hometown Dumpster Rental';
      if (pageType === 'location' && city && state) {
        title = `${city} Dumpster Rental | Roll Off Dumpsters in ${city}, ${state}`;
      } else if (pageType === 'service' && service) {
        title = `${service} | Affordable Prices | Hometown Dumpster Rental`;
      } else if (pageType === 'size' && size) {
        title = `${size} Yard Dumpster Rental | Prices & Dimensions`;
      }

      // Generate description
      let description = customDescription || 'Find affordable dumpster rental services near you. Same-day delivery, no hidden fees.';
      if (pageType === 'location' && city) {
        description = `Looking for dumpster rental in ${city}? We offer same-day delivery, competitive prices, and excellent service. Call now!`;
      } else if (pageType === 'service' && service) {
        description = `Professional ${service} services with fast delivery and pickup. No hidden fees. Get your free quote today!`;
      }

      // Generate keywords
      const keywords = customKeywords?.join(', ') || generateKeywords(pageType, city, state, service, size);

      setSEOData({
        title,
        description,
        keywords,
        canonical: `https://dumpquote.co${pathname}`,
        ogImage: 'https://dumpquote.co/og-image.jpg'
      });
    }

    // Check if we have enough data to generate SEO
    if (options.pageType || pathname !== '/') {
      generateClientSideSEO();
    } else {
      fetchSEO();
    }
  }, [pathname, options.pageType, options.city, options.state, options.service, options.size]);

  return seoData;
}

// Helper function to generate keywords
function generateKeywords(
  pageType?: string,
  city?: string,
  state?: string,
  service?: string,
  size?: string
): string {
  const keywords = ['dumpster rental', 'roll off dumpster', 'waste management'];

  if (city) {
    keywords.push(`${city} dumpster rental`);
    keywords.push(`dumpster rental ${city}`);
  }

  if (state) {
    keywords.push(`${state} waste management`);
  }

  if (service) {
    keywords.push(service);
    keywords.push(`${service} rental`);
  }

  if (size) {
    keywords.push(`${size} yard dumpster`);
    keywords.push(`${size} container`);
  }

  return keywords.slice(0, 10).join(', ');
}

// Hook to set page meta tags (for client components)
export function usePageMeta(seo: SEOData) {
  useEffect(() => {
    // Update document title
    if (seo.title) {
      document.title = seo.title;
    }

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription && seo.description) {
      metaDescription.setAttribute('content', seo.description);
    }

    // Update meta keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords && seo.keywords) {
      metaKeywords.setAttribute('content', seo.keywords);
    }

    // Update canonical
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink && seo.canonical) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    if (canonicalLink && seo.canonical) {
      canonicalLink.href = seo.canonical;
    }

    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle && seo.title) {
      ogTitle.setAttribute('content', seo.title);
    }

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription && seo.description) {
      ogDescription.setAttribute('content', seo.description);
    }

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl && seo.canonical) {
      ogUrl.setAttribute('content', seo.canonical);
    }

    // Add structured data
    if (seo.structuredData) {
      let scriptTag = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement;
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(seo.structuredData);
    }
  }, [seo]);
}

// Hook to get internal links for a page
export function useInternalLinks(pageType: string): any[] {
  const [links, setLinks] = useState<any[]>([]);

  useEffect(() => {
    // Generate internal links based on page type
    const generatedLinks: any[] = [];

    // Add common links
    generatedLinks.push(
      { url: '/services', text: 'Our Services', rel: 'related' },
      { url: '/locations', text: 'Service Areas', rel: 'related' },
      { url: '/dumpster-sizes', text: 'Dumpster Sizes', rel: 'related' }
    );

    // Add page-specific links
    if (pageType === 'location') {
      generatedLinks.push(
        { url: '/pricing', text: 'Local Pricing', rel: 'related' },
        { url: '/same-day-delivery', text: 'Same Day Delivery', rel: 'related' }
      );
    } else if (pageType === 'service') {
      generatedLinks.push(
        { url: '/how-it-works', text: 'How It Works', rel: 'related' },
        { url: '/faqs', text: 'Common Questions', rel: 'help' }
      );
    }

    setLinks(generatedLinks);
  }, [pageType]);

  return links;
}

// Hook to track SEO performance
export function useSEOTracking(pageType: string) {
  useEffect(() => {
    // Track page view with metadata
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'page_view', {
        page_type: pageType,
        page_location: window.location.href,
        page_title: document.title
      });
    }

    // Track time on page
    const startTime = Date.now();
    return () => {
      const timeOnPage = Math.floor((Date.now() - startTime) / 1000);
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'timing_complete', {
          name: 'time_on_page',
          value: timeOnPage,
          event_category: 'engagement',
          event_label: pageType
        });
      }
    };
  }, [pageType]);
}