import { NextRequest, NextResponse } from 'next/server';
import { generateMetadata, generateStructuredData, generateInternalLinks } from '@/lib/seo-engine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pathname, pageType, city, state, service, size, customTitle, customDescription, customKeywords } = body;

    // Generate SEO metadata
    const metadata = generateMetadata({
      pageType: pageType || 'home',
      city,
      state,
      service,
      size,
      title: customTitle,
      description: customDescription,
      keywords: customKeywords
    });

    // Generate structured data
    const structuredData = generateStructuredData({
      pageType: pageType || 'home',
      city,
      state,
      service,
      size
    });

    // Generate internal links
    const internalLinks = generateInternalLinks({
      pageType: pageType || 'home',
      city,
      state,
      service,
      size
    });

    return NextResponse.json({
      title: metadata.title as string,
      description: metadata.description as string,
      keywords: metadata.keywords as string,
      canonical: `https://dumpquote.co${pathname}`,
      ogImage: (metadata.openGraph?.images as any)?.[0]?.url || undefined,
      structuredData,
      internalLinks,
      openGraph: metadata.openGraph,
      twitter: metadata.twitter,
      robots: metadata.robots
    });
  } catch (error) {
    console.error('Error generating SEO:', error);
    return NextResponse.json(
      { error: 'Failed to generate SEO metadata' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Get default SEO configuration
  try {
    const metadata = generateMetadata({ pageType: 'home' });
    
    return NextResponse.json({
      title: metadata.title,
      description: metadata.description,
      keywords: metadata.keywords,
      brand: 'Hometown Dumpster Rental'
    });
  } catch (error) {
    console.error('Error fetching SEO config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch SEO configuration' },
      { status: 500 }
    );
  }
}