import { generateMetadata as generateSEO } from '@/lib/seo-engine';
import { generateStructuredData } from '@/lib/seo-engine';
import HomeownersPageClient from './HomeownersPageClient';

// Generate SEO metadata for homeowners page
export async function generateMetadata() {
  return generateSEO({
    pageType: 'service',
    service: 'Residential Dumpster Rental'
  });
}

export default function HomeownersPage() {
  // Generate structured data for homeowners service page
  const structuredData = generateStructuredData({
    pageType: 'service',
    service: 'Residential Dumpster Rental',
    faqs: [
      {
        question: "What size dumpster do I need for my home project?",
        answer: "For most home projects, a 20-yard dumpster works well. Small cleanouts need 10 yards, while major renovations may require 30 yards."
      },
      {
        question: "How much does residential dumpster rental cost?",
        answer: "Residential dumpster rental starts at $295 for a 10-yard container and ranges up to $595 for a 30-yard container, depending on your location and rental duration."
      },
      {
        question: "Do I need a permit for a dumpster in my driveway?",
        answer: "Permits are usually not required for dumpsters placed on your own property. However, street placement typically requires a permit from your local municipality."
      }
    ]
  });

  return (
    <>
      {/* Add structured data */}
      {structuredData.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <HomeownersPageClient />
    </>
  );
}