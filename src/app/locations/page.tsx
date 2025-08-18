import { Metadata } from 'next';
import { generateMetadata as generateSEO, generateStructuredData } from '@/lib/seo-engine';
import LocationsClient from './LocationsClient';

// Generate metadata for this page
export async function generateMetadata(): Promise<Metadata> {
  return generateSEO({
    pageType: 'location',
    title: 'Dumpster Rental Locations - Service Areas & Coverage Map',
    description: 'Find dumpster rental services in your area. Browse our coverage map and service locations across the United States. Available in hundreds of cities nationwide.',
    keywords: ['dumpster rental locations', 'service areas', 'coverage map', 'local dumpster rental', 'find dumpster rental near me']
  });
}

export default function LocationsPage() {
  // Generate structured data for locations page
  const structuredData = generateStructuredData({
    pageType: 'location'
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
      
      <LocationsClient />
    </>
  );
}