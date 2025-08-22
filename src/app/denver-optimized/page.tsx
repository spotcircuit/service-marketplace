import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

// SEO-optimized metadata
export const metadata: Metadata = {
  title: 'Dumpster Rental Denver, CO | Sizes, Prices & Permits | Hometown Dumpster',
  description: 'Flat-rate roll-off dumpsters in Denver (10–40 yd). See prices, sizes & permit info. Call 1-800-DUMPSTER for same- or next-day delivery.',
  keywords: 'dumpster rental denver, denver dumpster rental, roll off dumpster denver, denver waste management, construction dumpster denver',
  openGraph: {
    title: 'Dumpster Rental Denver - Same Day Delivery Available',
    description: 'Get flat-rate dumpster rentals in Denver. 10-40 yard sizes available. Free quotes, transparent pricing.',
    url: 'https://hometowndumpster.com/colorado/denver',
    siteName: 'Hometown Dumpster',
    locale: 'en_US',
    type: 'website',
  },
  alternates: {
    canonical: 'https://hometowndumpster.com/colorado/denver'
  }
};

// Structured data for Denver page
const denverSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "HomeAndConstructionBusiness",
      "@id": "https://hometowndumpster.com/colorado/denver#business",
      "name": "Hometown Dumpster - Denver",
      "description": "Roll-off dumpster rental service in Denver, Colorado",
      "url": "https://hometowndumpster.com/colorado/denver",
      "telephone": "+1-800-DUMPSTER",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Denver",
        "addressRegion": "CO",
        "addressCountry": "US"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 39.7392,
        "longitude": -104.9903
      },
      "areaServed": [
        {
          "@type": "City",
          "name": "Denver",
          "@id": "https://www.wikidata.org/wiki/Q16554"
        },
        {
          "@type": "PostalAddress",
          "postalCode": ["80202", "80203", "80204", "80205", "80206", "80207", "80209", "80210", "80211", "80212", "80214", "80216", "80218", "80219", "80220", "80221", "80222", "80223", "80224", "80226", "80227", "80228", "80229", "80230", "80231", "80232", "80233", "80234", "80235", "80236", "80237", "80238", "80239", "80246", "80247", "80249"]
        }
      ],
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Dumpster Rental Sizes",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "10 Yard Dumpster",
              "description": "Perfect for small cleanouts, bathroom remodels, and minor roofing projects"
            },
            "price": "295",
            "priceCurrency": "USD"
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "20 Yard Dumpster",
              "description": "Ideal for medium renovations, deck removal, and garage cleanouts"
            },
            "price": "395",
            "priceCurrency": "USD"
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "30 Yard Dumpster",
              "description": "Great for large home renovations, new construction, and commercial projects"
            },
            "price": "495",
            "priceCurrency": "USD"
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "40 Yard Dumpster",
              "description": "Best for major construction, commercial demolition, and large cleanouts"
            },
            "price": "595",
            "priceCurrency": "USD"
          }
        ]
      }
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://hometowndumpster.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Colorado",
          "item": "https://hometowndumpster.com/colorado"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "Denver",
          "item": "https://hometowndumpster.com/colorado/denver"
        }
      ]
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Do I need a permit for a dumpster rental in Denver?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "In Denver, you need a permit if placing the dumpster on public property (street, sidewalk, alley). Driveway placement typically doesn't require a permit. Denver Public Works charges $30 for a 5-day permit. Apply online at denvergov.org or call 311. We can help coordinate permit applications."
          }
        },
        {
          "@type": "Question",
          "name": "What size dumpster do I need for my Denver project?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "10-yard: Small bathroom remodel, 1-car garage cleanout. 20-yard: Kitchen renovation, roof replacement up to 2,500 sq ft. 30-yard: Whole home renovation, commercial cleanout. 40-yard: New construction, large demolition. Most Denver homeowners choose 20-yard dumpsters."
          }
        },
        {
          "@type": "Question",
          "name": "How much does dumpster rental cost in Denver?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Denver dumpster rental prices: 10-yard ($295-$350), 20-yard ($395-$450), 30-yard ($495-$550), 40-yard ($595-$695). Prices include 7-day rental, delivery, pickup, and disposal up to weight limit. Additional fees may apply for overweight loads or prohibited items."
          }
        },
        {
          "@type": "Question",
          "name": "What items are prohibited in Denver dumpsters?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Prohibited items include: hazardous waste, paint, batteries, tires, appliances with freon, electronics, medical waste, and asbestos. Denver offers special disposal programs for these items at the Cherry Creek Recycling Drop-off or Havana Nursery location."
          }
        },
        {
          "@type": "Question",
          "name": "Where does Denver construction waste go?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Most Denver construction debris goes to the Denver Arapahoe Disposal Site (DADS) landfill or Republic Services facilities. Some materials are diverted to recycling facilities like Alpine Waste & Recycling. Denver aims to divert 50% of waste from landfills by 2027."
          }
        }
      ]
    }
  ]
};

export default function DenverOptimizedPage() {
  return (
    <>
      {/* Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(denverSchema) }}
      />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-16">
        <div className="container mx-auto px-4">
          {/* Breadcrumbs */}
          <nav className="mb-4">
            <ol className="flex space-x-2 text-sm">
              <li><Link href="/" className="hover:underline">Home</Link></li>
              <li>/</li>
              <li><Link href="/colorado" className="hover:underline">Colorado</Link></li>
              <li>/</li>
              <li className="font-semibold">Denver</li>
            </ol>
          </nav>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Dumpster Rental in Denver, CO
          </h1>
          <h2 className="text-xl md:text-2xl mb-6">
            Same-Day Delivery • Flat-Rate Pricing • No Hidden Fees
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-3">Quick Quote</h3>
              <p className="mb-4">Get instant pricing for Denver dumpster rentals</p>
              <a href="tel:1-800-DUMPSTER" className="bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold inline-block hover:bg-gray-100">
                Call 1-800-DUMPSTER
              </a>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-3">Service Areas</h3>
              <p>Serving all Denver neighborhoods: Downtown, Capitol Hill, Cherry Creek, Highlands, Park Hill, Stapleton, and surrounding metros</p>
            </div>
          </div>
        </div>
      </section>

      {/* Local Signals Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Denver Dumpster Rental Information</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-3 text-orange-600">Permit Office</h3>
              <p className="mb-2"><strong>Denver Public Works</strong></p>
              <p className="text-sm mb-2">201 W Colfax Ave, Dept 506</p>
              <p className="text-sm mb-2">Denver, CO 80202</p>
              <p className="text-sm mb-2">Phone: 311 or (720) 913-1311</p>
              <a href="https://www.denvergov.org/Government/Agencies-Departments-Offices/Agencies-Departments-Offices-Directory/Transportation-Infrastructure/Programs-Services/Permits" 
                 className="text-blue-600 hover:underline text-sm"
                 target="_blank"
                 rel="noopener noreferrer">
                Apply for Permit Online →
              </a>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-3 text-orange-600">Disposal Facilities</h3>
              <ul className="space-y-2 text-sm">
                <li><strong>DADS Landfill:</strong> 3500 S Gun Club Rd, Aurora</li>
                <li><strong>Tower Landfill:</strong> 88800 E State Hwy 36, Bennett</li>
                <li><strong>Alpine Recycling:</strong> 7373 W 55th Ave, Arvada</li>
                <li><strong>Cherry Creek Drop-off:</strong> 7301 E Warren Ave</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-3 text-orange-600">Local Pricing</h3>
              <ul className="space-y-2">
                <li className="flex justify-between">
                  <span>10 Yard:</span>
                  <strong>$295 - $350</strong>
                </li>
                <li className="flex justify-between">
                  <span>20 Yard:</span>
                  <strong>$395 - $450</strong>
                </li>
                <li className="flex justify-between">
                  <span>30 Yard:</span>
                  <strong>$495 - $550</strong>
                </li>
                <li className="flex justify-between">
                  <span>40 Yard:</span>
                  <strong>$595 - $695</strong>
                </li>
              </ul>
              <p className="text-xs mt-3 text-gray-600">*7-day rental, includes delivery & pickup</p>
            </div>
          </div>
        </div>
      </section>

      {/* Dumpster Sizes Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Dumpster Sizes for Denver Projects</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-2">10 Yard Dumpster</h3>
              <p className="text-gray-600 mb-3">12' L × 8' W × 3.5' H</p>
              <p className="text-sm mb-3">Holds ~4 pickup truck loads</p>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• Small bathroom remodel</li>
                <li>• Basement cleanout</li>
                <li>• 1,500 sq ft roof tearoff</li>
                <li>• Concrete: up to 2 tons</li>
              </ul>
              <p className="mt-4 text-lg font-semibold text-orange-600">From $295</p>
            </div>

            <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow border-orange-500">
              <div className="bg-orange-500 text-white text-xs px-2 py-1 rounded inline-block mb-2">MOST POPULAR</div>
              <h3 className="text-xl font-semibold mb-2">20 Yard Dumpster</h3>
              <p className="text-gray-600 mb-3">22' L × 8' W × 4.5' H</p>
              <p className="text-sm mb-3">Holds ~8 pickup truck loads</p>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• Kitchen renovation</li>
                <li>• Large garage cleanout</li>
                <li>• 3,000 sq ft roof tearoff</li>
                <li>• Flooring: 2,000 sq ft</li>
              </ul>
              <p className="mt-4 text-lg font-semibold text-orange-600">From $395</p>
            </div>

            <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-2">30 Yard Dumpster</h3>
              <p className="text-gray-600 mb-3">22' L × 8' W × 6' H</p>
              <p className="text-sm mb-3">Holds ~12 pickup truck loads</p>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• Whole home renovation</li>
                <li>• Commercial cleanout</li>
                <li>• 4,000 sq ft roof tearoff</li>
                <li>• New construction waste</li>
              </ul>
              <p className="mt-4 text-lg font-semibold text-orange-600">From $495</p>
            </div>

            <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-2">40 Yard Dumpster</h3>
              <p className="text-gray-600 mb-3">22' L × 8' W × 8' H</p>
              <p className="text-sm mb-3">Holds ~16 pickup truck loads</p>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• Commercial demolition</li>
                <li>• Major construction</li>
                <li>• 5,000+ sq ft roof</li>
                <li>• Warehouse cleanout</li>
              </ul>
              <p className="mt-4 text-lg font-semibold text-orange-600">From $595</p>
            </div>
          </div>
        </div>
      </section>

      {/* Service Providers Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Top-Rated Denver Dumpster Rental Companies</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* These would be dynamically pulled from your database */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-2">Mile High Disposal</h3>
              <div className="flex items-center mb-2">
                <span className="text-yellow-500">★★★★★</span>
                <span className="ml-2 text-sm text-gray-600">(127 reviews)</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">Serving Denver Metro since 2005</p>
              <p className="text-sm mb-3">Same-day delivery available • Licensed & insured</p>
              <a href="tel:303-555-0100" className="text-orange-600 hover:underline">Call for Quote</a>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-2">Rocky Mountain Waste</h3>
              <div className="flex items-center mb-2">
                <span className="text-yellow-500">★★★★★</span>
                <span className="ml-2 text-sm text-gray-600">(98 reviews)</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">Family-owned Denver business</p>
              <p className="text-sm mb-3">Residential & commercial • Green disposal practices</p>
              <a href="tel:303-555-0200" className="text-orange-600 hover:underline">Call for Quote</a>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-2">Front Range Roll-Offs</h3>
              <div className="flex items-center mb-2">
                <span className="text-yellow-500">★★★★☆</span>
                <span className="ml-2 text-sm text-gray-600">(156 reviews)</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">Denver to Boulder coverage</p>
              <p className="text-sm mb-3">24/7 service • Contractor discounts available</p>
              <a href="tel:303-555-0300" className="text-orange-600 hover:underline">Call for Quote</a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold mb-8 text-center">Denver Dumpster Rental FAQs</h2>
          
          <div className="space-y-6">
            <div className="border-b pb-6">
              <h3 className="text-xl font-semibold mb-3">Do I need a permit for a dumpster rental in Denver?</h3>
              <p className="text-gray-700">
                In Denver, you need a permit if placing the dumpster on public property (street, sidewalk, alley). 
                Driveway placement typically doesn't require a permit. Denver Public Works charges $30 for a 5-day permit. 
                Apply online at denvergov.org or call 311. We can help coordinate permit applications.
              </p>
            </div>

            <div className="border-b pb-6">
              <h3 className="text-xl font-semibold mb-3">What size dumpster do I need for my Denver project?</h3>
              <p className="text-gray-700">
                <strong>10-yard:</strong> Small bathroom remodel, 1-car garage cleanout<br/>
                <strong>20-yard:</strong> Kitchen renovation, roof replacement up to 2,500 sq ft<br/>
                <strong>30-yard:</strong> Whole home renovation, commercial cleanout<br/>
                <strong>40-yard:</strong> New construction, large demolition<br/>
                Most Denver homeowners choose 20-yard dumpsters.
              </p>
            </div>

            <div className="border-b pb-6">
              <h3 className="text-xl font-semibold mb-3">How much does dumpster rental cost in Denver?</h3>
              <p className="text-gray-700">
                Denver dumpster rental prices: 10-yard ($295-$350), 20-yard ($395-$450), 30-yard ($495-$550), 
                40-yard ($595-$695). Prices include 7-day rental, delivery, pickup, and disposal up to weight limit. 
                Additional fees may apply for overweight loads or prohibited items.
              </p>
            </div>

            <div className="border-b pb-6">
              <h3 className="text-xl font-semibold mb-3">What items are prohibited in Denver dumpsters?</h3>
              <p className="text-gray-700">
                Prohibited items include: hazardous waste, paint, batteries, tires, appliances with freon, 
                electronics, medical waste, and asbestos. Denver offers special disposal programs for these 
                items at the Cherry Creek Recycling Drop-off or Havana Nursery location.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">Where does Denver construction waste go?</h3>
              <p className="text-gray-700">
                Most Denver construction debris goes to the Denver Arapahoe Disposal Site (DADS) landfill 
                or Republic Services facilities. Some materials are diverted to recycling facilities like 
                Alpine Waste & Recycling. Denver aims to divert 50% of waste from landfills by 2027.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-orange-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Rent a Dumpster in Denver?</h2>
          <p className="text-xl mb-8">Get instant quotes from verified local providers</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:1-800-DUMPSTER" className="bg-white text-orange-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100">
              Call 1-800-DUMPSTER
            </a>
            <Link href="/quotes/new" className="bg-orange-600 text-white px-8 py-4 rounded-lg font-semibold text-lg border-2 border-white hover:bg-orange-700">
              Get Online Quote
            </Link>
          </div>
        </div>
      </section>

      {/* Footer Links */}
      <section className="py-8 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Denver Neighborhoods</h3>
              <ul className="space-y-1 text-sm">
                <li><Link href="/colorado/denver/downtown" className="text-gray-600 hover:text-orange-600">Downtown</Link></li>
                <li><Link href="/colorado/denver/capitol-hill" className="text-gray-600 hover:text-orange-600">Capitol Hill</Link></li>
                <li><Link href="/colorado/denver/cherry-creek" className="text-gray-600 hover:text-orange-600">Cherry Creek</Link></li>
                <li><Link href="/colorado/denver/highlands" className="text-gray-600 hover:text-orange-600">Highlands</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Nearby Cities</h3>
              <ul className="space-y-1 text-sm">
                <li><Link href="/colorado/aurora" className="text-gray-600 hover:text-orange-600">Aurora</Link></li>
                <li><Link href="/colorado/lakewood" className="text-gray-600 hover:text-orange-600">Lakewood</Link></li>
                <li><Link href="/colorado/littleton" className="text-gray-600 hover:text-orange-600">Littleton</Link></li>
                <li><Link href="/colorado/westminster" className="text-gray-600 hover:text-orange-600">Westminster</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Services</h3>
              <ul className="space-y-1 text-sm">
                <li><Link href="/services/residential-dumpster" className="text-gray-600 hover:text-orange-600">Residential Dumpster</Link></li>
                <li><Link href="/services/construction-dumpster" className="text-gray-600 hover:text-orange-600">Construction Dumpster</Link></li>
                <li><Link href="/services/commercial-dumpster" className="text-gray-600 hover:text-orange-600">Commercial Dumpster</Link></li>
                <li><Link href="/services/concrete-disposal" className="text-gray-600 hover:text-orange-600">Concrete Disposal</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Resources</h3>
              <ul className="space-y-1 text-sm">
                <li><Link href="/guides/dumpster-sizes" className="text-gray-600 hover:text-orange-600">Size Guide</Link></li>
                <li><Link href="/guides/pricing" className="text-gray-600 hover:text-orange-600">Pricing Guide</Link></li>
                <li><Link href="/guides/permits" className="text-gray-600 hover:text-orange-600">Permit Guide</Link></li>
                <li><Link href="/blog" className="text-gray-600 hover:text-orange-600">Blog</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}