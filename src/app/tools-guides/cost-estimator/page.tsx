import { Metadata } from 'next';
import { generateMetadata as generateSEO, generateStructuredData } from '@/lib/seo-engine';
import HeaderToneSetter from '@/components/HeaderToneSetter';
import CostEstimatorClient from './CostEstimatorClient';

// Generate metadata for this page
export async function generateMetadata(): Promise<Metadata> {
  return generateSEO({
    pageType: 'guide',
    title: 'Dumpster Rental Cost Calculator - Get Accurate Pricing Estimates',
    description: 'Calculate dumpster rental costs with our interactive cost estimator. Get accurate pricing based on size, location, debris type, and rental duration.',
    keywords: ['dumpster rental cost', 'cost calculator', 'pricing estimator', 'rental pricing']
  });
}

interface DumpsterCost {
  size: string;
  basePrice: number;
  factors: string[];
}

const dumpsterCosts: DumpsterCost[] = [
  {
    size: '10 Yard',
    basePrice: 295,
    factors: ['Rental duration', 'Location', 'Debris type', 'Weight limits']
  },
  {
    size: '15 Yard',
    basePrice: 345,
    factors: ['Rental duration', 'Location', 'Debris type', 'Weight limits']
  },
  {
    size: '20 Yard',
    basePrice: 395,
    factors: ['Rental duration', 'Location', 'Debris type', 'Weight limits']
  },
  {
    size: '30 Yard',
    basePrice: 495,
    factors: ['Rental duration', 'Location', 'Debris type', 'Weight limits']
  },
  {
    size: '40 Yard',
    basePrice: 595,
    factors: ['Rental duration', 'Location', 'Debris type', 'Weight limits']
  }
];

const costEstimatorFaqs = [
  {
    question: "How accurate are these cost estimates?",
    answer: "Our estimates are based on national averages and regional data. Actual costs may vary based on your specific location, local market conditions, and individual service provider pricing."
  },
  {
    question: "What factors affect dumpster rental pricing the most?",
    answer: "The biggest factors are dumpster size, rental duration, your location, type of debris, and local disposal fees. Heavy materials like concrete typically cost more due to disposal fees."
  },
  {
    question: "Are there any hidden fees I should know about?",
    answer: "Reputable companies should provide transparent pricing. Potential additional costs include overage fees, extended rental periods, permit fees, and special disposal charges for certain materials."
  },
  {
    question: "Can I save money by keeping the dumpster longer?",
    answer: "Longer rentals typically cost more due to daily fees. However, getting the right size initially is often more cost-effective than renting multiple smaller containers."
  }
];

export default function CostEstimatorPage() {
  // Generate structured data
  const structuredData = generateStructuredData({
    pageType: 'guide',
    faqs: costEstimatorFaqs
  });

  // Add WebApplication schema for the cost calculator
  const calculatorSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Dumpster Rental Cost Calculator',
    description: 'Calculate accurate dumpster rental costs based on size, location, duration, and debris type',
    url: 'https://dumpquote.co/resources/cost-estimator',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    },
    featureList: [
      'Dumpster size pricing',
      'Regional cost adjustments',
      'Rental duration pricing',
      'Debris type considerations',
      'Accurate cost estimates',
      'Money-saving tips'
    ]
  };

  const allSchemas = [...structuredData, calculatorSchema];

  return (
    <>
      <HeaderToneSetter tone="secondary" />
      {/* Structured Data */}
      {allSchemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      
      <CostEstimatorClient dumpsterCosts={dumpsterCosts} />
    </>
  );
}