import { Metadata } from 'next';
import { generateMetadata as generateSEO, generateStructuredData } from '@/lib/seo-engine';
import ServicesClient from './ServicesClient';

// Generate metadata for this page
export async function generateMetadata(): Promise<Metadata> {
  return generateSEO({
    pageType: 'service',
    title: 'Dumpster Rental Services - Residential & Commercial Container Rentals',
    description: 'Complete dumpster rental services for residential and commercial projects. From small cleanouts to large construction sites. Get quotes from verified local providers.',
    keywords: ['dumpster rental services', 'container rental', 'waste management services', 'residential dumpster', 'commercial dumpster']
  });
}

export default function ServicesPage() {
  // Generate structured data
  const structuredData = generateStructuredData({
    pageType: 'service',
    service: 'Dumpster Rental Services'
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
      
      <ServicesClient />
    </>
  );
}