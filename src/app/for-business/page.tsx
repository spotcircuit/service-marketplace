import { Metadata } from 'next';
import { generateMetadata as generateSEO, generateStructuredData } from '@/lib/seo-engine';
import ForBusinessClient from './ForBusinessClient';

// Generate metadata for this page
export async function generateMetadata(): Promise<Metadata> {
  return generateSEO({
    pageType: 'service',
    title: 'Business Dumpster Rental Solutions - Commercial Waste Management',
    description: 'Professional dumpster rental services for businesses. Commercial containers, construction sites, office cleanouts, and ongoing waste management solutions.',
    keywords: ['business dumpster rental', 'commercial waste management', 'construction dumpster', 'office cleanout', 'business waste solutions']
  });
}

export default function ForBusinessPage() {
  // Generate structured data
  const structuredData = generateStructuredData({
    pageType: 'service',
    service: 'Commercial Dumpster Rental'
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
      
      <ForBusinessClient />
    </>
  );
}
