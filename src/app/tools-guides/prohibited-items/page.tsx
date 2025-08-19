import { Metadata } from 'next';
import HeaderToneSetter from '@/components/HeaderToneSetter';
import { generateMetadata as generateSEO, generateStructuredData } from '@/lib/seo-engine';
import ProhibitedItemsClient from './ProhibitedItemsClient';

const prohibitedItemsFaqs = [
  {
    question: "What happens if I put prohibited items in the dumpster?",
    answer: "You may face additional fees ranging from $100-$500+ per item, plus disposal costs. The rental company may refuse pickup until items are removed."
  },
  {
    question: "Can I dispose of paint in a dumpster?",
    answer: "Wet paint is prohibited. However, completely dried paint cans may be accepted by some companies. Always verify with your provider first."
  },
  {
    question: "How do I dispose of hazardous materials?",
    answer: "Contact your local waste management authority or EPA hotline (1-800-424-9346) for hazardous waste collection centers and special disposal programs in your area."
  },
  {
    question: "Are appliances allowed in dumpsters?",
    answer: "Some appliances like washers and dryers may be accepted with special arrangements. Refrigerators and air conditioners require special handling due to refrigerants."
  }
];

// Generate metadata for this page
export async function generateMetadata(): Promise<Metadata> {
  return generateSEO({
    pageType: 'guide',
    title: 'Prohibited Items Guide - What Cannot Go in a Dumpster',
    description: 'Complete guide to prohibited items in dumpster rentals. Learn what materials are not allowed, why they\'re prohibited, and proper disposal alternatives.',
    keywords: ['prohibited items', 'dumpster restrictions', 'hazardous waste', 'disposal guidelines', 'what not to throw']
  });
}

export default function ProhibitedItemsPage() {
  // Generate structured data
  const structuredData = generateStructuredData({
    pageType: 'guide',
    faqs: prohibitedItemsFaqs
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
      
      <ProhibitedItemsClient />
    </>
  );
}