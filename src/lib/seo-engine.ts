import { Metadata } from 'next';
import fs from 'fs';
import path from 'path';

// Types
export interface SEOConfig {
  niche: string;
  brand: {
    name: string;
    tagline: string;
    usp: string;
  };
  semantic_seo: any;
  keyword_intelligence: any;
  structured_data: any;
  content_optimization: any;
  technical_seo: any;
  ai_sge_optimization: any;
  local_seo: any;
  voice_search: any;
  conversion_optimization: any;
  internal_linking: any;
}

export interface PageSEOParams {
  pageType: 'home' | 'location' | 'service' | 'size' | 'guide' | 'blog' | 'about' | 'contact';
  city?: string;
  state?: string;
  service?: string;
  size?: string;
  title?: string;
  description?: string;
  keywords?: string[];
  canonical?: string;
  noindex?: boolean;
}

export interface GeneratedSEO {
  title: string;
  description: string;
  keywords: string;
  openGraph: any;
  twitter: any;
  alternates: any;
  robots: any;
  other: any;
}

class SEOEngine {
  private config: SEOConfig | null = null;
  private readonly configPath: string;

  constructor() {
    this.configPath = path.join(process.cwd(), 'config', 'seo');
  }

  // Load SEO configuration
  private loadConfig(): SEOConfig {
    if (this.config) return this.config;

    try {
      // For now, load dumpster-rental config directly
      // In future, this can be dynamic based on active niche
      const configFile = path.join(this.configPath, 'dumpster-rental.json');
      const configContent = fs.readFileSync(configFile, 'utf-8');
      this.config = JSON.parse(configContent);
      return this.config!;
    } catch (error) {
      console.error('Error loading SEO config:', error);
      // Return minimal default config
      return {
        niche: 'service',
        brand: { name: 'Service Provider', tagline: '', usp: '' },
        semantic_seo: {},
        keyword_intelligence: { seed_keywords: [], primary_keywords: [] },
        structured_data: {},
        content_optimization: { title_formulas: [], meta_description_formulas: [] },
        technical_seo: {},
        ai_sge_optimization: {},
        local_seo: {},
        voice_search: {},
        conversion_optimization: {},
        internal_linking: {}
      };
    }
  }

  // Generate page title
  public generateTitle(params: PageSEOParams): string {
    const config = this.loadConfig();
    const { pageType, city, state, service, size } = params;

    // If custom title provided, use it
    if (params.title) return params.title;

    // Get title formulas
    const formulas = config.content_optimization.title_formulas || [];
    if (formulas.length === 0) {
      return `${config.brand.name} | ${config.brand.tagline}`;
    }

    // Select appropriate formula based on page type
    let formula = formulas[0];
    if (pageType === 'location' && city) {
      formula = formulas.find((f: string) => f.includes('{city}')) || formulas[0];
    } else if (pageType === 'service' && service) {
      formula = formulas.find((f: string) => f.includes('{service}') || f.includes('{project_type}')) || formulas[0];
    } else if (pageType === 'size' && size) {
      formula = formulas.find((f: string) => f.includes('{size}')) || formulas[0];
    }

    // Replace variables
    let title = formula;
    const envPhone = process.env.NEXT_PUBLIC_CONTACT_PHONE_DISPLAY || process.env.NEXT_PUBLIC_CONTACT_PHONE || '';
    const replacements: Record<string, string> = {
      '{brand}': config.brand.name,
      '{primary_keyword}': config.keyword_intelligence.primary_keywords[0] || 'Service',
      '{city}': city || '',
      '{state}': state || '',
      '{service}': service || '',
      '{size}': size || '',
      '{project_type}': service || '',
      '{modifier}': this.getRandomModifier(config),
      '{phone}': envPhone
    };

    for (const [key, value] of Object.entries(replacements)) {
      title = title.replace(new RegExp(key, 'g'), value);
    }

    // Clean up extra spaces and pipes
    title = title.replace(/\s+/g, ' ').replace(/\|\s*\|/g, '|').trim();
    
    // Ensure title length is optimal (50-60 characters)
    if (title.length > 60) {
      const parts = title.split('|');
      if (parts.length > 2) {
        title = `${parts[0]} | ${parts[parts.length - 1]}`.trim();
      }
    }

    return title;
  }

  // Generate meta description
  public generateDescription(params: PageSEOParams): string {
    const config = this.loadConfig();
    const { pageType, city, state, service, size } = params;

    // If custom description provided, use it
    if (params.description) return params.description;

    // Get description formulas
    const formulas = config.content_optimization.meta_description_formulas || [];
    if (formulas.length === 0) {
      return config.brand.tagline || 'Find the best service providers near you.';
    }

    // Select appropriate formula
    let formula = formulas[Math.floor(Math.random() * formulas.length)];

    // Replace variables
    let description = formula;
    const envPhone = process.env.NEXT_PUBLIC_CONTACT_PHONE_DISPLAY || process.env.NEXT_PUBLIC_CONTACT_PHONE || '';
    const replacements: Record<string, string> = {
      '{brand}': config.brand.name,
      '{primary_keyword}': config.keyword_intelligence.primary_keywords[0] || 'service',
      '{city}': city || 'your area',
      '{state}': state || '',
      '{service}': service || 'services',
      '{size}': size || 'all sizes',
      '{project_type}': service || 'your project',
      '{modifier}': this.getRandomModifier(config),
      '{benefit}': this.getRandomBenefit(config),
      '{cta}': this.getRandomCTA(config),
      '{price}': '$300',
      '{phone}': envPhone,
      '{urgency}': 'Same-day availability in some areas'
    };

    for (const [key, value] of Object.entries(replacements)) {
      description = description.replace(new RegExp(key, 'g'), value);
    }

    // Clean up and ensure optimal length (150-160 characters)
    description = description.replace(/\s+/g, ' ').trim();
    if (description.length > 160) {
      description = description.substring(0, 157) + '...';
    }

    return description;
  }

  // Generate keywords
  public generateKeywords(params: PageSEOParams): string {
    const config = this.loadConfig();
    const { pageType, city, state, service, size } = params;

    // If custom keywords provided, use them
    if (params.keywords && params.keywords.length > 0) {
      return params.keywords.join(', ');
    }

    const keywords: string[] = [];

    // Add primary keywords
    keywords.push(...(config.keyword_intelligence.primary_keywords || []).slice(0, 3));

    // Add page-specific keywords
    if (pageType === 'location' && city) {
      keywords.push(`${city} dumpster rental`);
      keywords.push(`dumpster rental ${city}`);
      if (state) keywords.push(`${state} waste management`);
    }

    if (pageType === 'service' && service) {
      keywords.push(service);
      keywords.push(`${service} rental`);
    }

    if (pageType === 'size' && size) {
      keywords.push(`${size} dumpster`);
      keywords.push(`${size} container`);
    }

    // Add seed keywords
    keywords.push(...(config.keyword_intelligence.seed_keywords || []).slice(0, 2));

    // Remove duplicates and limit to 10 keywords
    const uniqueKeywords = [...new Set(keywords)].slice(0, 10);
    return uniqueKeywords.join(', ');
  }

  // Generate structured data (JSON-LD)
  public generateStructuredData(params: PageSEOParams & { 
    business?: any;
    reviews?: any[];
    faqs?: any[];
  }): any[] {
    const config = this.loadConfig();
    const schemas: any[] = [];
    const envPhone = process.env.NEXT_PUBLIC_CONTACT_PHONE_DISPLAY || process.env.NEXT_PUBLIC_CONTACT_PHONE || '';

    // Organization/LocalBusiness schema
    if (params.pageType === 'home' || params.pageType === 'location') {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        '@id': `https://dumpquote.co/#organization`,
        name: config.brand.name,
        description: config.brand.tagline,
        url: 'https://dumpquote.co',
        telephone: envPhone || undefined,
        priceRange: '$$',
        address: {
          '@type': 'PostalAddress',
          addressLocality: params.city || 'Richmond',
          addressRegion: params.state || 'VA',
          addressCountry: 'US'
        },
        geo: params.business?.latitude ? {
          '@type': 'GeoCoordinates',
          latitude: params.business.latitude,
          longitude: params.business.longitude
        } : undefined,
        aggregateRating: params.reviews && params.reviews.length > 0 ? {
          '@type': 'AggregateRating',
          ratingValue: '4.8',
          reviewCount: params.reviews.length
        } : undefined,
        areaServed: {
          '@type': 'GeoCircle',
          geoMidpoint: {
            '@type': 'GeoCoordinates',
            latitude: params.business?.latitude || 37.5407,
            longitude: params.business?.longitude || -77.4360
          },
          geoRadius: '50000'
        }
      });
    }

    // Service schema
    if (params.pageType === 'service' && params.service) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: params.service,
        provider: {
          '@type': 'LocalBusiness',
          name: config.brand.name
        },
        areaServed: {
          '@type': 'State',
          name: params.state || 'Virginia'
        },
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: `${params.service} Options`,
          itemListElement: config.structured_data.products?.map((product: any) => ({
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: product.name
            }
          }))
        }
      });
    }

    // FAQ schema
    if (params.faqs && params.faqs.length > 0) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: params.faqs.map(faq => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer
          }
        }))
      });
    }

    // BreadcrumbList schema
    if (params.pageType !== 'home') {
      const breadcrumbs = this.generateBreadcrumbs(params);
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((crumb, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: crumb.name,
          item: crumb.url
        }))
      });
    }

    return schemas;
  }

  // Generate Open Graph tags
  public generateOpenGraph(params: PageSEOParams): any {
    const title = this.generateTitle(params);
    const description = this.generateDescription(params);

    return {
      title,
      description,
      type: params.pageType === 'home' ? 'website' : 'article',
      siteName: this.loadConfig().brand.name,
      locale: 'en_US',
      url: params.canonical || `https://dumpquote.co${this.generateURL(params)}`,
      images: [
        {
          url: 'https://dumpquote.co/og-image.jpg',
          width: 1200,
          height: 630,
          alt: title
        }
      ]
    };
  }

  // Generate Twitter Card tags
  public generateTwitterCard(params: PageSEOParams): any {
    return {
      card: 'summary_large_image',
      title: this.generateTitle(params),
      description: this.generateDescription(params),
      images: ['https://dumpquote.co/twitter-card.jpg']
    };
  }

  // Generate canonical URL
  public generateCanonical(params: PageSEOParams): string {
    if (params.canonical) return params.canonical;
    return `https://dumpquote.co${this.generateURL(params)}`;
  }

  // Generate alternate URLs (for hreflang)
  public generateAlternates(params: PageSEOParams): any {
    return {
      canonical: this.generateCanonical(params)
    };
  }

  // Generate robots meta
  public generateRobots(params: PageSEOParams): any {
    if (params.noindex) {
      return {
        index: false,
        follow: false
      };
    }

    return {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1
      }
    };
  }

  // Generate internal links for a page
  public generateInternalLinks(params: PageSEOParams): any[] {
    const config = this.loadConfig();
    const links: any[] = [];

    if (!config.internal_linking) return links;

    const { semantic_linking, pillar_pages, related_content } = config.internal_linking;

    // Add pillar page links
    if (pillar_pages?.main_pillars) {
      pillar_pages.main_pillars.forEach((pillar: any) => {
        if (params.pageType !== 'home') {
          links.push({
            url: pillar.url,
            anchor: pillar.anchor_variations[0],
            rel: 'related'
          });
        }
      });
    }

    // Add semantic links based on page type
    if (semantic_linking?.contextual_rules && params.pageType === 'service') {
      semantic_linking.contextual_rules.forEach((rule: any) => {
        links.push({
          url: rule.link_to,
          anchor: rule.anchor_text[0],
          context: rule.when_mentioning
        });
      });
    }

    // Add location-based links
    if (params.pageType === 'location' && params.city) {
      // Link to state page
      if (params.state) {
        links.push({
          url: `/${params.state.toLowerCase().replace(/\s+/g, '-')}`,
          anchor: `${params.state} Dumpster Rental`,
          rel: 'up'
        });
      }

      // Link to services in this location
      links.push({
        url: `/services`,
        anchor: `Services in ${params.city}`,
        rel: 'related'
      });
    }

    return links;
  }

  // Generate breadcrumbs
  private generateBreadcrumbs(params: PageSEOParams): any[] {
    const breadcrumbs = [
      { name: 'Home', url: 'https://dumpquote.co' }
    ];

    if (params.pageType === 'location') {
      if (params.state) {
        breadcrumbs.push({
          name: 'Locations',
          url: 'https://dumpquote.co/locations'
        });
        breadcrumbs.push({
          name: params.state,
          url: `https://dumpquote.co/${params.state.toLowerCase().replace(/\s+/g, '-')}`
        });
      }
      if (params.city) {
        breadcrumbs.push({
          name: params.city,
          url: `https://dumpquote.co/${params.state?.toLowerCase().replace(/\s+/g, '-')}/${params.city.toLowerCase().replace(/\s+/g, '-')}`
        });
      }
    } else if (params.pageType === 'service') {
      breadcrumbs.push({
        name: 'Services',
        url: 'https://dumpquote.co/services'
      });
      if (params.service) {
        breadcrumbs.push({
          name: params.service,
          url: `https://dumpquote.co/services/${params.service.toLowerCase().replace(/\s+/g, '-')}`
        });
      }
    }

    return breadcrumbs;
  }

  // Helper: Generate URL for a page
  private generateURL(params: PageSEOParams): string {
    const { pageType, city, state, service, size } = params;

    if (pageType === 'home') return '/';
    if (pageType === 'location' && state && city) {
      return `/${state.toLowerCase().replace(/\s+/g, '-')}/${city.toLowerCase().replace(/\s+/g, '-')}`;
    }
    if (pageType === 'service' && service) {
      return `/services/${service.toLowerCase().replace(/\s+/g, '-')}`;
    }
    if (pageType === 'size' && size) {
      return `/dumpster-sizes/${size.toLowerCase().replace(/\s+/g, '-')}`;
    }

    return '/';
  }

  // Helper: Get random modifier
  private getRandomModifier(config: SEOConfig): string {
    const modifiers = [
      'Affordable',
      'Reliable',
      'Fast',
      'Professional',
      'Trusted',
      'Local'
    ];
    return modifiers[Math.floor(Math.random() * modifiers.length)];
  }

  // Helper: Get random benefit
  private getRandomBenefit(config: SEOConfig): string {
    const benefits = [
      'Same-day availability in some areas',
      'Transparent pricing from providers',
      'Many providers are licensed and insured',
      'Competitive local rates'
    ];
    return benefits[Math.floor(Math.random() * benefits.length)];
  }

  // Helper: Get random CTA
  private getRandomCTA(config: SEOConfig): string {
    const ctas = config.conversion_optimization?.cta_variations || [
      'Get instant quote',
      'Call now',
      'Book online',
      'Get started'
    ];
    return ctas[Math.floor(Math.random() * ctas.length)];
  }

  // Main method to generate all SEO metadata
  public generateMetadata(params: PageSEOParams): Metadata {
    const title = this.generateTitle(params);
    const description = this.generateDescription(params);
    const keywords = this.generateKeywords(params);

    return {
      title,
      description,
      keywords,
      openGraph: this.generateOpenGraph(params),
      twitter: this.generateTwitterCard(params),
      alternates: this.generateAlternates(params),
      robots: this.generateRobots(params),
      other: {
        'application-name': this.loadConfig().brand.name,
        'apple-mobile-web-app-title': this.loadConfig().brand.name,
        'theme-color': '#FF8C00',
        'msapplication-TileColor': '#FF8C00'
      }
    };
  }

  // Generate FAQ content
  public generateFAQs(pageType: string): any[] {
    const config = this.loadConfig();
    const faqs = config.structured_data?.faqs?.questions || [];
    
    // Filter FAQs based on page type
    if (pageType === 'size') {
      return faqs.filter((q: string) => q.toLowerCase().includes('size') || q.toLowerCase().includes('yard'));
    }
    if (pageType === 'location') {
      return faqs.filter((q: string) => q.toLowerCase().includes('deliver') || q.toLowerCase().includes('area'));
    }
    
    return faqs.slice(0, 5); // Return top 5 FAQs for general pages
  }

  // Generate content suggestions based on AI optimization config
  public generateContentSuggestions(pageType: string): any {
    const config = this.loadConfig();
    const suggestions: any = {
      headings: [],
      content_blocks: [],
      ctas: []
    };

    if (config.ai_sge_optimization?.conversational_snippets) {
      const snippets = config.ai_sge_optimization.conversational_snippets;
      suggestions.content_blocks = Object.entries(snippets).map(([key, value]) => ({
        type: key,
        content: value
      }));
    }

    if (config.conversion_optimization?.cta_variations) {
      suggestions.ctas = config.conversion_optimization.cta_variations;
    }

    return suggestions;
  }
}

// Export singleton instance
export const seoEngine = new SEOEngine();

// Export convenience functions
export function generateMetadata(params: PageSEOParams): Metadata {
  return seoEngine.generateMetadata(params);
}

export function generateStructuredData(params: PageSEOParams & { business?: any; reviews?: any[]; faqs?: any[] }): any[] {
  return seoEngine.generateStructuredData(params);
}

export function generateInternalLinks(params: PageSEOParams): any[] {
  return seoEngine.generateInternalLinks(params);
}