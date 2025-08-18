import { Metadata } from 'next';
import { generateMetadata as generateSEO, generateStructuredData } from '@/lib/seo-engine';
import DumpsterSizesClient from './DumpsterSizesClient';

// Static data moved to server component
const allSizes = [
  {
    size: '10 Yard',
    category: 'residential' as const,
    dimensions: {
      length: '13 feet',
      width: '8 feet',
      height: '3.5 feet'
    },
    capacity: {
      cubic: '10 cubic yards',
      loads: '3-4 pickup truck loads',
      bags: '50-70 trash bags'
    },
    weight: {
      limit: '2-3 tons',
      pounds: '4,000-6,000 lbs',
      ideal: 'Heavy materials like concrete, dirt, brick'
    },
    bestFor: [
      'Small bathroom remodel',
      'Single room renovation',
      'Garage cleanout',
      'Small deck removal',
      'Concrete or dirt disposal (small loads)'
    ],
    notGoodFor: [
      'Whole house cleanout',
      'Large renovation projects',
      'Roofing projects over 1,500 sq ft'
    ],
    pricing: 'Starting at $295',
    visual: '🚛'
  },
  {
    size: '15 Yard',
    category: 'residential' as const,
    dimensions: {
      length: '16 feet',
      width: '8 feet',
      height: '4 feet'
    },
    capacity: {
      cubic: '15 cubic yards',
      loads: '4-5 pickup truck loads',
      bags: '75-100 trash bags'
    },
    weight: {
      limit: '2-3 tons',
      pounds: '4,000-6,000 lbs',
      ideal: 'Mixed debris, moderate weight'
    },
    bestFor: [
      'Kitchen renovation',
      'Multiple room cleanout',
      'Small home addition',
      'Basement cleanout',
      'Flooring removal (up to 1,500 sq ft)'
    ],
    notGoodFor: [
      'Large construction projects',
      'Commercial demolition',
      'Heavy material disposal'
    ],
    pricing: 'Starting at $345',
    visual: '🚛🚛'
  },
  {
    size: '20 Yard',
    category: 'both' as const,
    dimensions: {
      length: '22 feet',
      width: '8 feet',
      height: '5 feet'
    },
    capacity: {
      cubic: '20 cubic yards',
      loads: '8-10 pickup truck loads',
      bags: '110-130 trash bags'
    },
    weight: {
      limit: '3-4 tons',
      pounds: '6,000-8,000 lbs',
      ideal: 'General construction debris'
    },
    bestFor: [
      'Large home renovation',
      'Roof replacement (up to 3,000 sq ft)',
      'Whole house cleanout',
      'Office renovation',
      'Retail buildout'
    ],
    notGoodFor: [
      'Major demolition',
      'Industrial waste',
      'Very heavy materials in bulk'
    ],
    pricing: 'Starting at $395',
    popular: true,
    visual: '🚛🚛🚛'
  },
  {
    size: '30 Yard',
    category: 'both' as const,
    dimensions: {
      length: '22 feet',
      width: '8 feet',
      height: '6 feet'
    },
    capacity: {
      cubic: '30 cubic yards',
      loads: '12-15 pickup truck loads',
      bags: '170-190 trash bags'
    },
    weight: {
      limit: '4-5 tons',
      pounds: '8,000-10,000 lbs',
      ideal: 'Large construction projects'
    },
    bestFor: [
      'New home construction',
      'Major home addition',
      'Commercial construction',
      'Multi-story renovation',
      'Large office cleanout'
    ],
    notGoodFor: [
      'Small residential projects',
      'Limited access areas',
      'Extremely heavy materials only'
    ],
    pricing: 'Starting at $495',
    visual: '🚛🚛🚛🚛'
  },
  {
    size: '40 Yard',
    category: 'commercial' as const,
    dimensions: {
      length: '22 feet',
      width: '8 feet',
      height: '8 feet'
    },
    capacity: {
      cubic: '40 cubic yards',
      loads: '16-20 pickup truck loads',
      bags: '230-250 trash bags'
    },
    weight: {
      limit: '5-6 tons',
      pounds: '10,000-12,000 lbs',
      ideal: 'Large-scale demolition'
    },
    bestFor: [
      'Commercial demolition',
      'Industrial cleanout',
      'Large construction site',
      'Warehouse renovation',
      'Multi-unit building project'
    ],
    notGoodFor: [
      'Residential driveways (too large)',
      'Small projects (not cost-effective)',
      'Extremely heavy materials only'
    ],
    pricing: 'Starting at $595',
    visual: '🚛🚛🚛🚛🚛'
  }
];

const comparisonFactors = [
  {
    factor: 'Driveway Space',
    description: 'Ensure you have adequate space for delivery',
    requirement: 'Need 60 ft length × 10.5 ft width for truck access'
  },
  {
    factor: 'Weight Limits',
    description: 'Heavy materials require smaller containers',
    requirement: 'Concrete, dirt, and brick have lower weight limits'
  },
  {
    factor: 'Loading Height',
    description: 'Consider how high you need to lift debris',
    requirement: 'Walk-in loading available for 30 & 40 yard containers'
  },
  {
    factor: 'Permit Requirements',
    description: 'Street placement may require permits',
    requirement: 'Check local regulations for public right-of-way placement'
  }
];

const dumpsterSizeFaqs = [
  {
    question: "What size dumpster do I need for my project?",
    answer: "The size depends on your project type. For small renovations like bathroom remodels, a 10-15 yard dumpster works well. For whole home cleanouts or large renovations, consider a 20-30 yard container. Our size guide above provides detailed recommendations for each project type."
  },
  {
    question: "How much weight can each dumpster size hold?",
    answer: "Weight limits vary by size: 10-yard (2-3 tons), 15-yard (2-3 tons), 20-yard (3-4 tons), 30-yard (4-5 tons), and 40-yard (5-6 tons). Heavy materials like concrete and dirt require smaller containers due to weight restrictions."
  },
  {
    question: "What's the difference between residential and commercial dumpster sizes?",
    answer: "Residential sizes (10-30 yard) are designed for home projects and fit in most driveways. Commercial sizes (20-40 yard) are for larger construction projects and may require special placement permits for street delivery."
  },
  {
    question: "Can I upgrade or downgrade my dumpster size after ordering?",
    answer: "Yes, we can often accommodate size changes before delivery, subject to availability. If you need a different size after delivery, we can arrange an exchange for an additional fee."
  },
  {
    question: "Do you offer same-day delivery for dumpster rentals?",
    answer: "Yes, same-day delivery is available for most dumpster sizes when you order before 2 PM, subject to availability and location. Contact us at (434) 207-6559 to check same-day availability in your area."
  }
];

// Generate metadata for this page
export async function generateMetadata(): Promise<Metadata> {
  return generateSEO({
    pageType: 'size',
    title: 'Dumpster Size Guide - 10, 15, 20, 30 & 40 Yard Container Sizes',
    description: 'Complete dumpster size guide with dimensions, pricing, and project recommendations. Find the perfect container size for your project - from 10 yard to 40 yard dumpsters.',
    keywords: ['dumpster sizes', 'container sizes', 'dumpster dimensions', 'yard sizes', 'rental guide']
  });
}

export default function DumpsterSizesPage() {
  // Generate structured data for this page
  const structuredData = generateStructuredData({
    pageType: 'size',
    faqs: dumpsterSizeFaqs
  });

  // Add product schema for each dumpster size
  const productSchemas = allSizes.map(size => ({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${size.size} Dumpster Rental`,
    description: `${size.size} dumpster container perfect for ${size.bestFor.slice(0, 2).join(' and ')}. ${size.capacity.cubic} capacity with ${size.weight.limit} weight limit.`,
    category: 'Dumpster Rental',
    brand: {
      '@type': 'Brand',
      name: 'DumpQuote'
    },
    offers: {
      '@type': 'Offer',
      price: size.pricing.replace('Starting at $', ''),
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    },
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Dimensions',
        value: `${size.dimensions.length} x ${size.dimensions.width} x ${size.dimensions.height}`
      },
      {
        '@type': 'PropertyValue', 
        name: 'Capacity',
        value: size.capacity.cubic
      },
      {
        '@type': 'PropertyValue',
        name: 'Weight Limit', 
        value: size.weight.limit
      }
    ]
  }));

  const allSchemas = [...structuredData, ...productSchemas];

  return (
    <>
      {/* Structured Data */}
      {allSchemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      
      <DumpsterSizesClient allSizes={allSizes} comparisonFactors={comparisonFactors} />
    </>
  );
}