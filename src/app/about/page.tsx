import { generateMetadata as generateSEO } from '@/lib/seo-engine';
import { generateStructuredData } from '@/lib/seo-engine';
import AboutPageClient from './AboutPageClient';

// Generate SEO metadata for about page
export async function generateMetadata() {
  return generateSEO({
    pageType: 'about'
  });
}

export default function AboutPage() {
  // Generate structured data for about page
  const structuredData = generateStructuredData({
    pageType: 'about'
  });

  return (
    <>
      {/* Structured Data */}
      {structuredData.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      
      <AboutPageClient />
    </>
  );
}