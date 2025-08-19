import { Metadata } from 'next';
import HeaderToneSetter from '@/components/HeaderToneSetter';
import { generateMetadata as generateSEO, generateStructuredData } from '@/lib/seo-engine';
import FAQClient from './FAQClient';

// Generate metadata for this page
export async function generateMetadata(): Promise<Metadata> {
  return generateSEO({
    pageType: 'guide',
    title: 'Dumpster Rental FAQs - Common Questions & Answers',
    description: 'Find answers to frequently asked questions about dumpster rentals. Learn about sizes, pricing, permits, prohibited items, and rental periods.',
    keywords: ['dumpster rental faq', 'dumpster rental questions', 'container rental help', 'waste management faq']
  });
}

export default function FAQPage() {
  // Generate structured data for FAQ page
  const structuredData = generateStructuredData({
    pageType: 'guide'
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
      
      <FAQClient />
    </>
  );
}