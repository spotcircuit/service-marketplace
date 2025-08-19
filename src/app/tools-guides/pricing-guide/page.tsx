import { Metadata } from 'next';
import HeaderToneSetter from '@/components/HeaderToneSetter';
import { generateMetadata as generateSEO, generateStructuredData } from '@/lib/seo-engine';
import PricingGuideClient from './PricingGuideClient';

const pricingFaqs = [
  {
    question: "Are these prices guaranteed?",
    answer: "No, these are estimated market averages. Actual prices are set by individual service providers and vary based on location, availability, and specific requirements."
  },
  {
    question: "What factors affect dumpster rental pricing?",
    answer: "Pricing varies based on location, dumpster size, rental duration, season, local disposal fees, weight limits, and current demand in your area."
  },
  {
    question: "How can I get an accurate quote?",
    answer: "Contact local providers directly or use our quote request form to receive actual pricing from multiple companies in your area."
  },
  {
    question: "Why do prices vary between companies?",
    answer: "Each company has different operating costs, service levels, disposal agreements, and business models, which can lead to noticeable price differences between providers and regions."
  }
];

// Generate metadata for this page
export async function generateMetadata(): Promise<Metadata> {
  return generateSEO({
    pageType: 'guide',
    title: 'Dumpster Rental Pricing Guide 2025 - Cost Estimates & Factors',
    description: 'Comprehensive guide to estimated dumpster rental pricing. Understand cost factors, size options, and regional variations. Get actual quotes from local providers.',
    keywords: ['dumpster rental pricing', 'cost estimates', 'rental rates', 'pricing guide', 'dumpster costs']
  });
}

export default function PricingGuidePage() {
  // Generate structured data
  const structuredData = generateStructuredData({
    pageType: 'guide',
    faqs: pricingFaqs
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
      
      <PricingGuideClient />
    </>
  );
}