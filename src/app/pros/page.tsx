import { Metadata } from 'next';
import { generateMetadata as buildMetadata, generateStructuredData } from '@/lib/seo-engine';
import ProsClient from './ProsClient';

// Generate metadata for this page
export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    pageType: 'service',
    title: 'Join Our Network - Dumpster Rental Providers & Partners',
    description: 'Grow your dumpster rental business with our lead generation platform. Connect with customers, increase bookings, and expand your service area.',
    keywords: ['dumpster rental providers', 'contractor network', 'waste management business', 'lead generation', 'business growth']
  });
}

export default function ProsPage() {
  // Generate structured data
  const structuredData = generateStructuredData({
    pageType: 'service',
    service: 'Provider Network'
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
      
      <ProsClient />
    </>
  );
}
// Pros page server component
