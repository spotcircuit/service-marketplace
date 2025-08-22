import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

// SEO-optimized metadata for Colorado state page
export const metadata: Metadata = {
  title: 'Dumpster Rental Colorado | All Cities & Counties | Hometown Dumpster',
  description: 'Find reliable dumpster rental services across Colorado. Compare prices, sizes, and providers in Denver, Colorado Springs, Aurora, Fort Collins, and 200+ cities statewide.',
  keywords: 'colorado dumpster rental, dumpster rental colorado, roll off dumpster colorado, colorado waste management, construction dumpster colorado',
  openGraph: {
    title: 'Colorado Dumpster Rental - Statewide Service Directory',
    description: 'Compare dumpster rental providers across Colorado. Get quotes from verified local companies. All sizes available.',
    url: 'https://hometowndumpster.com/colorado',
    siteName: 'Hometown Dumpster',
    locale: 'en_US',
    type: 'website',
  },
  alternates: {
    canonical: 'https://hometowndumpster.com/colorado'
  }
};

// Structured data for Colorado state page
const coloradoSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": "https://hometowndumpster.com/colorado",
      "name": "Dumpster Rental Services in Colorado",
      "description": "Directory of dumpster rental providers serving all cities and counties in Colorado",
      "url": "https://hometowndumpster.com/colorado",
      "breadcrumb": {
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
          }
        ]
      },
      "mainEntity": {
        "@type": "ItemList",
        "numberOfItems": 15,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "url": "https://hometowndumpster.com/colorado/denver",
            "name": "Denver"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "url": "https://hometowndumpster.com/colorado/colorado-springs",
            "name": "Colorado Springs"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "url": "https://hometowndumpster.com/colorado/aurora",
            "name": "Aurora"
          },
          {
            "@type": "ListItem",
            "position": 4,
            "url": "https://hometowndumpster.com/colorado/fort-collins",
            "name": "Fort Collins"
          },
          {
            "@type": "ListItem",
            "position": 5,
            "url": "https://hometowndumpster.com/colorado/lakewood",
            "name": "Lakewood"
          }
        ]
      }
    },
    {
      "@type": "Service",
      "@id": "https://hometowndumpster.com/colorado#service",
      "serviceType": "Dumpster Rental",
      "provider": {
        "@type": "Organization",
        "name": "Hometown Dumpster",
        "url": "https://hometowndumpster.com"
      },
      "areaServed": {
        "@type": "State",
        "name": "Colorado",
        "@id": "https://www.wikidata.org/wiki/Q1261"
      },
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Colorado Dumpster Rental Services",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Residential Dumpster Rental"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Construction Dumpster Rental"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Commercial Dumpster Rental"
            }
          }
        ]
      }
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How much does dumpster rental cost in Colorado?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Colorado dumpster rental prices vary by location and size. Average costs: 10-yard ($275-$400), 20-yard ($350-$500), 30-yard ($450-$600), 40-yard ($550-$750). Mountain towns typically cost 15-25% more due to transportation. Denver Metro has the most competitive pricing."
          }
        },
        {
          "@type": "Question",
          "name": "Do I need a permit for a dumpster in Colorado?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Permit requirements vary by city in Colorado. Denver, Colorado Springs, and most cities require permits for street placement ($30-$75). Private property placement usually doesn't require permits. Mountain towns like Aspen and Vail have stricter regulations. Always check with your local municipality."
          }
        },
        {
          "@type": "Question",
          "name": "What can't go in a dumpster in Colorado?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Colorado prohibits: hazardous waste, chemicals, paint, batteries, tires, electronics (e-waste), appliances with freon, medical waste, and asbestos. Many items can be recycled at special facilities. Colorado has strict environmental regulations, with fines up to $1,000 for violations."
          }
        }
      ]
    }
  ]
};

// Colorado cities data (would come from database)
const majorCities = [
  { name: 'Denver', slug: 'denver', population: '715,522', businesses: 45 },
  { name: 'Colorado Springs', slug: 'colorado-springs', population: '498,879', businesses: 32 },
  { name: 'Aurora', slug: 'aurora', population: '386,261', businesses: 28 },
  { name: 'Fort Collins', slug: 'fort-collins', population: '169,810', businesses: 18 },
  { name: 'Lakewood', slug: 'lakewood', population: '155,984', businesses: 15 },
  { name: 'Thornton', slug: 'thornton', population: '141,867', businesses: 12 },
  { name: 'Arvada', slug: 'arvada', population: '124,402', businesses: 11 },
  { name: 'Westminster', slug: 'westminster', population: '116,317', businesses: 10 },
  { name: 'Pueblo', slug: 'pueblo', population: '112,361', businesses: 9 },
  { name: 'Centennial', slug: 'centennial', population: '108,418', businesses: 8 },
  { name: 'Boulder', slug: 'boulder', population: '108,250', businesses: 14 },
  { name: 'Greeley', slug: 'greeley', population: '108,795', businesses: 7 }
];

const mountainTowns = [
  { name: 'Aspen', slug: 'aspen', region: 'Roaring Fork Valley' },
  { name: 'Vail', slug: 'vail', region: 'Eagle County' },
  { name: 'Breckenridge', slug: 'breckenridge', region: 'Summit County' },
  { name: 'Steamboat Springs', slug: 'steamboat-springs', region: 'Routt County' },
  { name: 'Telluride', slug: 'telluride', region: 'San Miguel County' },
  { name: 'Durango', slug: 'durango', region: 'La Plata County' }
];

export default function ColoradoOptimizedPage() {
  return (
    <>
      {/* Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(coloradoSchema) }}
      />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16">
        <div className="container mx-auto px-4">
          {/* Breadcrumbs */}
          <nav className="mb-4">
            <ol className="flex space-x-2 text-sm">
              <li><Link href="/" className="hover:underline">Home</Link></li>
              <li>/</li>
              <li className="font-semibold">Colorado</li>
            </ol>
          </nav>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Colorado Dumpster Rental Services
          </h1>
          <h2 className="text-xl md:text-2xl mb-6">
            Serving All 64 Counties • From Denver to the Western Slope
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl font-bold mb-2">271+</div>
              <p>Cities Served</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl font-bold mb-2">450+</div>
              <p>Verified Providers</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl font-bold mb-2">$275</div>
              <p>Starting Price</p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <p className="text-lg mb-4">Find trusted dumpster rental companies in your Colorado city:</p>
            <div className="flex flex-wrap gap-2">
              {majorCities.slice(0, 8).map(city => (
                <Link 
                  key={city.slug}
                  href={`/colorado/${city.slug}`}
                  className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded transition-colors"
                >
                  {city.name}
                </Link>
              ))}
              <Link 
                href="#all-cities"
                className="bg-orange-500 hover:bg-orange-600 px-3 py-1 rounded transition-colors"
              >
                View All Cities →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Colorado Overview Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Dumpster Rental Across Colorado</h2>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div>
              <h3 className="text-xl font-semibold mb-4">Front Range & Metro Areas</h3>
              <p className="text-gray-700 mb-4">
                The Front Range corridor from Fort Collins to Pueblo hosts 85% of Colorado's population 
                and offers the most competitive dumpster rental pricing. Same-day delivery is common in 
                Denver Metro, with most providers offering flat-rate pricing including disposal fees.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>Denver Metro:</strong> 50+ providers, prices from $275</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>Colorado Springs:</strong> 30+ providers, military discounts available</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span><strong>Northern Colorado:</strong> Fort Collins, Greeley, Loveland coverage</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4">Mountain & Western Slope</h3>
              <p className="text-gray-700 mb-4">
                Mountain communities and Western Slope cities have fewer providers but maintain reliable 
                service. Expect 15-25% higher prices due to transportation costs and stricter environmental 
                regulations in resort areas.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">✓</span>
                  <span><strong>I-70 Corridor:</strong> Vail, Aspen, Breckenridge specialty services</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">✓</span>
                  <span><strong>Western Slope:</strong> Grand Junction hub serves 5 counties</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">✓</span>
                  <span><strong>Southern Colorado:</strong> Durango, Alamosa regional providers</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Regional Pricing Table */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">Colorado Regional Pricing Guide</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Region</th>
                    <th className="text-center py-2">10 Yard</th>
                    <th className="text-center py-2">20 Yard</th>
                    <th className="text-center py-2">30 Yard</th>
                    <th className="text-center py-2">40 Yard</th>
                    <th className="text-center py-2">Permit Cost</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 font-medium">Denver Metro</td>
                    <td className="text-center">$275-$350</td>
                    <td className="text-center">$375-$450</td>
                    <td className="text-center">$475-$550</td>
                    <td className="text-center">$575-$650</td>
                    <td className="text-center">$30-$50</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 font-medium">Colorado Springs</td>
                    <td className="text-center">$285-$360</td>
                    <td className="text-center">$385-$460</td>
                    <td className="text-center">$485-$560</td>
                    <td className="text-center">$585-$660</td>
                    <td className="text-center">$38</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 font-medium">Northern Colorado</td>
                    <td className="text-center">$290-$370</td>
                    <td className="text-center">$390-$470</td>
                    <td className="text-center">$490-$570</td>
                    <td className="text-center">$590-$670</td>
                    <td className="text-center">$25-$45</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 font-medium">Mountain Towns</td>
                    <td className="text-center">$350-$450</td>
                    <td className="text-center">$450-$550</td>
                    <td className="text-center">$550-$650</td>
                    <td className="text-center">$650-$750</td>
                    <td className="text-center">$50-$100</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-medium">Western Slope</td>
                    <td className="text-center">$300-$380</td>
                    <td className="text-center">$400-$480</td>
                    <td className="text-center">$500-$580</td>
                    <td className="text-center">$600-$680</td>
                    <td className="text-center">$30-$40</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs mt-4 text-gray-600">*Prices include 7-day rental, delivery, pickup, and disposal up to weight limit</p>
          </div>
        </div>
      </section>

      {/* Major Cities Grid */}
      <section className="py-12" id="all-cities">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Colorado Cities We Serve</h2>
          
          {/* Major Cities */}
          <h3 className="text-2xl font-semibold mb-6">Major Cities</h3>
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
            {majorCities.map(city => (
              <Link 
                key={city.slug}
                href={`/colorado/${city.slug}`}
                className="bg-white border rounded-lg p-4 hover:shadow-lg transition-shadow group"
              >
                <h4 className="font-semibold text-lg group-hover:text-orange-600">{city.name}</h4>
                <p className="text-sm text-gray-600">Population: {city.population}</p>
                <p className="text-sm text-gray-600">{city.businesses} providers</p>
                <span className="text-orange-600 text-sm group-hover:underline">View services →</span>
              </Link>
            ))}
          </div>

          {/* Mountain Towns */}
          <h3 className="text-2xl font-semibold mb-6">Mountain & Resort Towns</h3>
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
            {mountainTowns.map(town => (
              <Link 
                key={town.slug}
                href={`/colorado/${town.slug}`}
                className="bg-white border rounded-lg p-4 hover:shadow-lg transition-shadow group"
              >
                <h4 className="font-semibold text-lg group-hover:text-orange-600">{town.name}</h4>
                <p className="text-sm text-gray-600">{town.region}</p>
                <span className="text-orange-600 text-sm group-hover:underline">View services →</span>
              </Link>
            ))}
          </div>

          {/* Counties */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Service by County</h3>
            <div className="grid md:grid-cols-4 gap-2 text-sm">
              <div>
                <h4 className="font-medium mb-2">Front Range</h4>
                <ul className="space-y-1">
                  <li><Link href="/colorado/adams-county" className="text-gray-600 hover:text-orange-600">Adams County</Link></li>
                  <li><Link href="/colorado/arapahoe-county" className="text-gray-600 hover:text-orange-600">Arapahoe County</Link></li>
                  <li><Link href="/colorado/boulder-county" className="text-gray-600 hover:text-orange-600">Boulder County</Link></li>
                  <li><Link href="/colorado/denver-county" className="text-gray-600 hover:text-orange-600">Denver County</Link></li>
                  <li><Link href="/colorado/douglas-county" className="text-gray-600 hover:text-orange-600">Douglas County</Link></li>
                  <li><Link href="/colorado/jefferson-county" className="text-gray-600 hover:text-orange-600">Jefferson County</Link></li>
                  <li><Link href="/colorado/larimer-county" className="text-gray-600 hover:text-orange-600">Larimer County</Link></li>
                  <li><Link href="/colorado/weld-county" className="text-gray-600 hover:text-orange-600">Weld County</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Southern</h4>
                <ul className="space-y-1">
                  <li><Link href="/colorado/el-paso-county" className="text-gray-600 hover:text-orange-600">El Paso County</Link></li>
                  <li><Link href="/colorado/pueblo-county" className="text-gray-600 hover:text-orange-600">Pueblo County</Link></li>
                  <li><Link href="/colorado/fremont-county" className="text-gray-600 hover:text-orange-600">Fremont County</Link></li>
                  <li><Link href="/colorado/las-animas-county" className="text-gray-600 hover:text-orange-600">Las Animas County</Link></li>
                  <li><Link href="/colorado/huerfano-county" className="text-gray-600 hover:text-orange-600">Huerfano County</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Mountain</h4>
                <ul className="space-y-1">
                  <li><Link href="/colorado/eagle-county" className="text-gray-600 hover:text-orange-600">Eagle County</Link></li>
                  <li><Link href="/colorado/summit-county" className="text-gray-600 hover:text-orange-600">Summit County</Link></li>
                  <li><Link href="/colorado/pitkin-county" className="text-gray-600 hover:text-orange-600">Pitkin County</Link></li>
                  <li><Link href="/colorado/routt-county" className="text-gray-600 hover:text-orange-600">Routt County</Link></li>
                  <li><Link href="/colorado/clear-creek-county" className="text-gray-600 hover:text-orange-600">Clear Creek County</Link></li>
                  <li><Link href="/colorado/park-county" className="text-gray-600 hover:text-orange-600">Park County</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Western Slope</h4>
                <ul className="space-y-1">
                  <li><Link href="/colorado/mesa-county" className="text-gray-600 hover:text-orange-600">Mesa County</Link></li>
                  <li><Link href="/colorado/garfield-county" className="text-gray-600 hover:text-orange-600">Garfield County</Link></li>
                  <li><Link href="/colorado/la-plata-county" className="text-gray-600 hover:text-orange-600">La Plata County</Link></li>
                  <li><Link href="/colorado/montrose-county" className="text-gray-600 hover:text-orange-600">Montrose County</Link></li>
                  <li><Link href="/colorado/delta-county" className="text-gray-600 hover:text-orange-600">Delta County</Link></li>
                  <li><Link href="/colorado/gunnison-county" className="text-gray-600 hover:text-orange-600">Gunnison County</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Colorado Regulations Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Colorado Waste Management Regulations</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">State Regulations</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">⚠</span>
                  <div>
                    <strong>Hazardous Waste:</strong> Strictly prohibited. Must use certified disposal facilities.
                    <a href="https://cdphe.colorado.gov/hazardous-waste" className="text-blue-600 text-sm block hover:underline" target="_blank" rel="noopener noreferrer">
                      CDPHE Hazardous Waste Info →
                    </a>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">⚠</span>
                  <div>
                    <strong>E-Waste Recycling:</strong> TVs, computers, monitors must be recycled (SB12-133).
                    <a href="https://cdphe.colorado.gov/electronics-recycling" className="text-blue-600 text-sm block hover:underline" target="_blank" rel="noopener noreferrer">
                      Find E-Waste Drop-offs →
                    </a>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <div>
                    <strong>Construction Waste:</strong> Recycling encouraged but not mandated statewide.
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">ℹ</span>
                  <div>
                    <strong>Asbestos:</strong> Requires licensed abatement contractor and special disposal.
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">Major Landfills & Transfer Stations</h3>
              <ul className="space-y-2 text-sm">
                <li><strong>Denver Metro:</strong></li>
                <li className="ml-4">• DADS Landfill - Aurora</li>
                <li className="ml-4">• Tower Landfill - Bennett</li>
                <li className="ml-4">• Foothills Landfill - Golden</li>
                
                <li className="mt-3"><strong>Northern Colorado:</strong></li>
                <li className="ml-4">• Larimer County Landfill - Fort Collins</li>
                <li className="ml-4">• Weld County Landfill - Ault</li>
                
                <li className="mt-3"><strong>Southern Colorado:</strong></li>
                <li className="ml-4">• Midway Landfill - Fountain</li>
                <li className="ml-4">• Southside Landfill - Pueblo</li>
                
                <li className="mt-3"><strong>Western Slope:</strong></li>
                <li className="ml-4">• Mesa County Landfill - Grand Junction</li>
                <li className="ml-4">• Pitkin County Landfill - Aspen</li>
              </ul>
            </div>
          </div>

          {/* Recycling Programs */}
          <div className="mt-8 bg-blue-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Colorado Recycling & Diversion Programs</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium mb-2">Front Range Recycling</h4>
                <p className="text-sm text-gray-700">
                  Single-stream recycling available in most metro areas. Construction material recycling 
                  facilities in Denver, Boulder, Fort Collins.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Composting Programs</h4>
                <p className="text-sm text-gray-700">
                  Organic waste composting mandatory in some cities. A1 Organics and 
                  EcoProducts serve commercial composting needs.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Special Waste Days</h4>
                <p className="text-sm text-gray-700">
                  Most counties host household hazardous waste collection events 2-4 times 
                  annually. Free for residents.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold mb-8 text-center">Colorado Dumpster Rental FAQs</h2>
          
          <div className="space-y-6">
            <div className="border-b pb-6">
              <h3 className="text-xl font-semibold mb-3">How much does dumpster rental cost in Colorado?</h3>
              <p className="text-gray-700">
                Colorado dumpster rental prices vary by location and size. Average costs: 10-yard ($275-$400), 
                20-yard ($350-$500), 30-yard ($450-$600), 40-yard ($550-$750). Mountain towns typically cost 
                15-25% more due to transportation. Denver Metro has the most competitive pricing.
              </p>
            </div>

            <div className="border-b pb-6">
              <h3 className="text-xl font-semibold mb-3">Do I need a permit for a dumpster in Colorado?</h3>
              <p className="text-gray-700">
                Permit requirements vary by city in Colorado. Denver, Colorado Springs, and most cities require 
                permits for street placement ($30-$75). Private property placement usually doesn't require permits. 
                Mountain towns like Aspen and Vail have stricter regulations. Always check with your local municipality.
              </p>
            </div>

            <div className="border-b pb-6">
              <h3 className="text-xl font-semibold mb-3">What can't go in a dumpster in Colorado?</h3>
              <p className="text-gray-700">
                Colorado prohibits: hazardous waste, chemicals, paint, batteries, tires, electronics (e-waste), 
                appliances with freon, medical waste, and asbestos. Many items can be recycled at special facilities. 
                Colorado has strict environmental regulations, with fines up to $1,000 for violations.
              </p>
            </div>

            <div className="border-b pb-6">
              <h3 className="text-xl font-semibold mb-3">How far in advance should I book a dumpster in Colorado?</h3>
              <p className="text-gray-700">
                In Denver Metro and major cities, 1-2 days advance booking is usually sufficient, with same-day 
                delivery often available. Mountain towns and rural areas need 3-5 days notice. During peak 
                construction season (May-October) and around holidays, book 1 week ahead.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">Are there weight limits for dumpsters in Colorado?</h3>
              <p className="text-gray-700">
                Yes, typical weight limits: 10-yard (2-3 tons), 20-yard (3-4 tons), 30-yard (4-5 tons), 
                40-yard (5-6 tons). Exceeding weight limits incurs overage fees of $50-$100 per ton. 
                Heavy materials like concrete, dirt, and roofing have lower weight allowances.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Service Types Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Dumpster Rental Services Available in Colorado</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-3">Residential Services</h3>
              <ul className="space-y-2 text-sm">
                <li>• Home Cleanouts</li>
                <li>• Garage & Basement Clearing</li>
                <li>• Estate Cleanouts</li>
                <li>• Moving & Downsizing</li>
                <li>• Yard Waste Removal</li>
                <li>• Home Renovation Debris</li>
              </ul>
              <Link href="/services/residential" className="text-orange-600 hover:underline mt-4 inline-block">
                Learn More →
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-3">Construction Services</h3>
              <ul className="space-y-2 text-sm">
                <li>• New Construction Waste</li>
                <li>• Demolition Debris</li>
                <li>• Roofing Materials</li>
                <li>• Concrete & Asphalt</li>
                <li>• Remodeling Waste</li>
                <li>• Land Clearing Debris</li>
              </ul>
              <Link href="/services/construction" className="text-orange-600 hover:underline mt-4 inline-block">
                Learn More →
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-3">Commercial Services</h3>
              <ul className="space-y-2 text-sm">
                <li>• Office Cleanouts</li>
                <li>• Retail Renovations</li>
                <li>• Restaurant Remodels</li>
                <li>• Warehouse Clearing</li>
                <li>• Property Management</li>
                <li>• Event Waste Management</li>
              </ul>
              <Link href="/services/commercial" className="text-orange-600 hover:underline mt-4 inline-block">
                Learn More →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Find Dumpster Rental in Your Colorado City</h2>
          <p className="text-xl mb-8">Compare quotes from verified local providers across Colorado</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:1-800-DUMPSTER" className="bg-white text-blue-700 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100">
              Call 1-800-DUMPSTER
            </a>
            <Link href="/quotes/new" className="bg-blue-800 text-white px-8 py-4 rounded-lg font-semibold text-lg border-2 border-white hover:bg-blue-900">
              Get Online Quote
            </Link>
          </div>
          <p className="mt-6 text-sm">
            Serving all 64 Colorado counties from the Eastern Plains to the Western Slope
          </p>
        </div>
      </section>

      {/* Related State Links */}
      <section className="py-8 bg-gray-100">
        <div className="container mx-auto px-4">
          <h3 className="text-xl font-semibold mb-4">Dumpster Rental in Nearby States</h3>
          <div className="flex flex-wrap gap-4">
            <Link href="/wyoming" className="text-gray-600 hover:text-orange-600">Wyoming</Link>
            <span className="text-gray-400">|</span>
            <Link href="/nebraska" className="text-gray-600 hover:text-orange-600">Nebraska</Link>
            <span className="text-gray-400">|</span>
            <Link href="/kansas" className="text-gray-600 hover:text-orange-600">Kansas</Link>
            <span className="text-gray-400">|</span>
            <Link href="/oklahoma" className="text-gray-600 hover:text-orange-600">Oklahoma</Link>
            <span className="text-gray-400">|</span>
            <Link href="/new-mexico" className="text-gray-600 hover:text-orange-600">New Mexico</Link>
            <span className="text-gray-400">|</span>
            <Link href="/arizona" className="text-gray-600 hover:text-orange-600">Arizona</Link>
            <span className="text-gray-400">|</span>
            <Link href="/utah" className="text-gray-600 hover:text-orange-600">Utah</Link>
          </div>
        </div>
      </section>
    </>
  );
}