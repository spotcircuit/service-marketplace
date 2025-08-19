import { generateMetadata as generateSEO } from '@/lib/seo-engine';
import { generateStructuredData } from '@/lib/seo-engine';
import HeaderToneSetter from '@/components/HeaderToneSetter';
import DirectoryPageClient from './DirectoryPageClient';

// Generate SEO metadata for directory page
export async function generateMetadata() {
  return generateSEO({
    pageType: 'directory' as any,
    title: 'Service Provider Directory - Find Dumpster Rentals by State',
    description: 'Browse our comprehensive directory of dumpster rental providers across all 50 states. Find trusted local services in your area.'
  });
}

export default function DirectoryPage() {
  // Generate structured data for directory page
  const structuredData = generateStructuredData({
    pageType: 'guide' as any
  });

  return (
    <>
      <HeaderToneSetter tone="secondary" />
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