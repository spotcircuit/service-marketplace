import { Metadata } from 'next';
import HeaderToneSetter from '@/components/HeaderToneSetter';
import { generateMetadata as generateSEO, generateStructuredData } from '@/lib/seo-engine';
import RentalGuideClient from './RentalGuideClient';

const rentalGuideFaqs = [
  {
    question: "How far in advance should I book a dumpster rental?",
    answer: "We recommend booking 24-48 hours in advance for standard delivery. During peak seasons or for specific sizes, booking 3-5 days ahead ensures availability."
  },
  {
    question: "Do I need a permit for a dumpster rental?",
    answer: "Permits are typically required for street placement but not for private driveways. Check with your local city or county permit office for specific requirements."
  },
  {
    question: "How long can I keep the dumpster?",
    answer: "Standard rentals include 7-10 days. Extensions are usually available for $5-15 per day. Contact your provider to arrange longer rental periods."
  },
  {
    question: "What happens if I overfill the dumpster?",
    answer: "Overfilled dumpsters may be refused for pickup or incur additional fees. Keep debris level with or below the top edge to avoid issues."
  }
];

// Generate metadata for this page
export async function generateMetadata(): Promise<Metadata> {
  return generateSEO({
    pageType: 'guide',
    title: 'Complete Dumpster Rental Guide - Step-by-Step Process',
    description: 'Comprehensive guide to renting a dumpster. Learn the complete process, avoid common mistakes, and get tips for successful rental from start to finish.',
    keywords: ['dumpster rental guide', 'how to rent dumpster', 'rental process', 'step by step guide']
  });
}

export default function RentalGuidePage() {
  // Generate structured data
  const structuredData = generateStructuredData({
    pageType: 'guide',
    faqs: rentalGuideFaqs
  });

  // Add HowTo schema for the rental process
  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Rent a Dumpster',
    description: 'Complete step-by-step guide for renting a dumpster for your project',
    totalTime: 'PT48H',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'USD',
      minValue: '250',
      maxValue: '900'
    },
    supply: [
      { '@type': 'HowToSupply', name: 'Project measurements' },
      { '@type': 'HowToSupply', name: 'Debris type list' },
      { '@type': 'HowToSupply', name: 'Delivery location access' }
    ],
    step: [
      {
        '@type': 'HowToStep',
        name: 'Determine Your Needs',
        text: 'Assess your project scope and identify debris type'
      },
      {
        '@type': 'HowToStep',
        name: 'Choose the Right Size',
        text: 'Select appropriate dumpster size based on project volume'
      },
      {
        '@type': 'HowToStep',
        name: 'Check Local Regulations',
        text: 'Verify permit requirements and placement rules'
      },
      {
        '@type': 'HowToStep',
        name: 'Get Multiple Quotes',
        text: 'Compare prices and services from different providers'
      },
      {
        '@type': 'HowToStep',
        name: 'Schedule Delivery',
        text: 'Coordinate delivery timing and placement location'
      },
      {
        '@type': 'HowToStep',
        name: 'Load Properly',
        text: 'Fill the dumpster safely and efficiently'
      },
      {
        '@type': 'HowToStep',
        name: 'Schedule Pickup',
        text: 'Arrange for timely removal when project is complete'
      }
    ]
  };

  const allSchemas = [...structuredData, howToSchema];

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
      
      <RentalGuideClient />
    </>
  );
}