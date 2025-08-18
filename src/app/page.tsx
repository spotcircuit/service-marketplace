import { generateMetadata as generateSEO } from '@/lib/seo-engine';
import { generateStructuredData } from '@/lib/seo-engine';
import HomePageClient from './HomePageClient';

// Generate SEO metadata for homepage
export async function generateMetadata() {
  return generateSEO({
    pageType: 'home'
  });
}

export default function HomePage() {
  // Generate structured data for homepage
  const structuredData = generateStructuredData({
    pageType: 'home',
    faqs: [
      {
        question: "What can't I put in a dumpster?",
        answer: "Hazardous materials, tires, batteries, paint, chemicals, and appliances with freon are prohibited."
      },
      {
        question: "How long is the rental period?",
        answer: "Standard rental is 7 days. Extended rentals available for $15/day after the first week."
      },
      {
        question: "Do I need a permit?",
        answer: "Permits are required for street placement. Driveway placement typically doesn't require permits."
      },
      {
        question: "When will my dumpster arrive?",
        answer: "Same-day and next-day delivery available. Most orders delivered within 24 hours."
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
      <HomePageClient />
    </>
  );
}