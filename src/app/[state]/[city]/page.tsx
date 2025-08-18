import { generateMetadata as generateSEO } from '@/lib/seo-engine';
import { generateStructuredData } from '@/lib/seo-engine';
import CityPageClient from './CityPageClient';

// State names mapping
const stateNames: Record<string, string> = {
  'alabama': 'Alabama', 'alaska': 'Alaska', 'arizona': 'Arizona', 'arkansas': 'Arkansas',
  'california': 'California', 'colorado': 'Colorado', 'connecticut': 'Connecticut',
  'delaware': 'Delaware', 'florida': 'Florida', 'georgia': 'Georgia', 'hawaii': 'Hawaii',
  'idaho': 'Idaho', 'illinois': 'Illinois', 'indiana': 'Indiana', 'iowa': 'Iowa',
  'kansas': 'Kansas', 'kentucky': 'Kentucky', 'louisiana': 'Louisiana', 'maine': 'Maine',
  'maryland': 'Maryland', 'massachusetts': 'Massachusetts', 'michigan': 'Michigan',
  'minnesota': 'Minnesota', 'mississippi': 'Mississippi', 'missouri': 'Missouri',
  'montana': 'Montana', 'nebraska': 'Nebraska', 'nevada': 'Nevada',
  'new-hampshire': 'New Hampshire', 'new-jersey': 'New Jersey', 'new-mexico': 'New Mexico',
  'new-york': 'New York', 'north-carolina': 'North Carolina', 'north-dakota': 'North Dakota',
  'ohio': 'Ohio', 'oklahoma': 'Oklahoma', 'oregon': 'Oregon', 'pennsylvania': 'Pennsylvania',
  'rhode-island': 'Rhode Island', 'south-carolina': 'South Carolina', 'south-dakota': 'South Dakota',
  'tennessee': 'Tennessee', 'texas': 'Texas', 'utah': 'Utah', 'vermont': 'Vermont',
  'virginia': 'Virginia', 'washington': 'Washington', 'west-virginia': 'West Virginia',
  'wisconsin': 'Wisconsin', 'wyoming': 'Wyoming'
};

// Generate SEO metadata for city pages
export async function generateMetadata({ params }: { params: Promise<{ state: string; city: string }> }) {
  const { state: stateSlug, city: citySlug } = await params;
  const stateName = stateNames[stateSlug] || stateSlug;
  const cityName = citySlug.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
  
  return generateSEO({
    pageType: 'location',
    city: cityName,
    state: stateName
  });
}

export default async function CityPage({ params }: { params: Promise<{ state: string; city: string }> }) {
  const { state: stateSlug, city: citySlug } = await params;
  const stateName = stateNames[stateSlug] || stateSlug;
  const cityName = citySlug.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');

  // Generate structured data for city page
  const structuredData = generateStructuredData({
    pageType: 'location',
    city: cityName,
    state: stateName,
    faqs: [
      {
        question: `Do I need a permit for a dumpster in ${cityName}?`,
        answer: `Permit requirements in ${cityName} depend on placement. Driveway placement typically doesn't require permits, but street placement does. We'll help you determine permit needs.`
      },
      {
        question: `How quickly can I get a dumpster delivered in ${cityName}?`,
        answer: `Most providers in ${cityName} offer same-day or next-day delivery. During peak seasons, we recommend booking 2-3 days in advance.`
      },
      {
        question: `What's the average cost of dumpster rental in ${cityName}?`,
        answer: `Prices in ${cityName} typically range from $295-$695 depending on size and rental duration. Get quotes from multiple providers to find the best deal.`
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
      <CityPageClient 
        stateSlug={stateSlug} 
        citySlug={citySlug} 
        stateName={stateName} 
        cityName={cityName} 
      />
    </>
  );
}