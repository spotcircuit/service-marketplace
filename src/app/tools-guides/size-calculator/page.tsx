import { Metadata } from 'next';
import HeaderToneSetter from '@/components/HeaderToneSetter';
import { generateMetadata as generateSEO, generateStructuredData } from '@/lib/seo-engine';
import SizeCalculatorClient from './SizeCalculatorClient';

const calculatorFaqs = [
  {
    question: "How accurate is the dumpster size calculator?",
    answer: "Our calculator provides recommendations based on typical project requirements. Final size selection may vary based on specific project details and debris type."
  },
  {
    question: "What if I'm between two sizes?",
    answer: "It's generally better to go with the larger size to avoid overfilling. Most projects generate more debris than initially estimated."
  },
  {
    question: "Can I change my dumpster size after ordering?",
    answer: "Yes, we can often accommodate size changes before delivery, subject to availability. Size changes after delivery may incur additional fees."
  },
  {
    question: "How do I know if my debris is considered heavy?",
    answer: "Heavy debris includes concrete, dirt, brick, roofing shingles, and similar materials. These require smaller containers due to weight restrictions."
  }
];

// Generate metadata for this page
export async function generateMetadata(): Promise<Metadata> {
  return generateSEO({
    pageType: 'guide',
    title: 'Dumpster Size Calculator - Find the Perfect Container Size',
    description: 'Interactive dumpster size calculator helps you choose the right container for your project. Get personalized recommendations based on project type and debris.',
    keywords: ['dumpster size calculator', 'container size estimator', 'dumpster recommendation tool', 'project calculator']
  });
}

export default function SizeCalculatorPage() {
  // Generate structured data
  const structuredData = generateStructuredData({
    pageType: 'guide',
    faqs: calculatorFaqs
  });

  // Add WebApplication schema for the calculator tool
  const calculatorSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Dumpster Size Calculator',
    description: 'Interactive tool to find the perfect dumpster size for your project',
    url: 'https://dumpquote.co/resources/size-calculator',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    },
    featureList: [
      'Project type selection',
      'Room count calculation',
      'Debris type consideration',
      'Personalized size recommendations',
      'Price estimates',
      'Size comparison'
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
      
      <SizeCalculatorClient />
    </>
  );
}