import { generateMetadata as generateSEO } from '@/lib/seo-engine';
import { generateStructuredData } from '@/lib/seo-engine';
import DirectoryPageClient from './DirectoryPageClient';

// Generate SEO metadata for directory page
export async function generateMetadata() {
  return generateSEO({
    pageType: 'guide' as any
  });
}

export default function DirectoryPage() {
  // Generate structured data for directory page
  const structuredData = generateStructuredData({
    pageType: 'guide' as any
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
      
      <DirectoryPageClient />
    </>
  );
}