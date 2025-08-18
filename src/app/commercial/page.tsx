import { generateMetadata as generateSEO } from '@/lib/seo-engine';
import { generateStructuredData } from '@/lib/seo-engine';
import CommercialPageClient from './CommercialPageClient';

// Generate SEO metadata for commercial page
export async function generateMetadata() {
  return generateSEO({
    pageType: 'service',
    service: 'Commercial Dumpster Rental'
  });
}

export default function CommercialPage() {
  // Generate structured data for commercial service page
  const structuredData = generateStructuredData({
    pageType: 'service',
    service: 'Commercial Dumpster Rental',
    faqs: [
      {
        question: "What sizes are available for commercial dumpster rental?",
        answer: "We offer 20-yard, 30-yard, and 40-yard containers for commercial use, with capacity ranging from 10-20 pickup truck loads."
      },
      {
        question: "Do you offer volume discounts for multiple containers?",
        answer: "Yes, we offer 10% discount for 5+ containers, 20% for 10+ containers, and 30% for 20+ containers."
      },
      {
        question: "How quickly can commercial dumpsters be delivered?",
        answer: "We offer same-day delivery in some areas and next-day delivery for most commercial projects."
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
      <CommercialPageClient />
    </>
  );
}