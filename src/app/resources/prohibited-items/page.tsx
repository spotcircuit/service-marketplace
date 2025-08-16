'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, XCircle, CheckCircle, AlertTriangle, Info, Search, Phone, Recycle, Shield, Zap } from 'lucide-react';

interface ItemCategory {
  category: string;
  icon: any;
  color: string;
  items: {
    name: string;
    reason: string;
    disposal: string;
    allowed?: boolean;
  }[];
}

const categories: ItemCategory[] = [
  {
    category: 'Hazardous Materials',
    icon: AlertTriangle,
    color: 'red',
    items: [
      {
        name: 'Paint & Paint Thinners',
        reason: 'Contains toxic chemicals that contaminate landfills',
        disposal: 'Take to hazardous waste collection center'
      },
      {
        name: 'Motor Oil & Fluids',
        reason: 'Environmental contamination risk',
        disposal: 'Auto parts stores or recycling centers'
      },
      {
        name: 'Pesticides & Herbicides',
        reason: 'Toxic chemicals harmful to environment',
        disposal: 'Hazardous waste facility'
      },
      {
        name: 'Batteries (Car & Household)',
        reason: 'Contains lead and acid',
        disposal: 'Battery recycling centers or auto stores'
      },
      {
        name: 'Asbestos',
        reason: 'Serious health hazard requiring special handling',
        disposal: 'Licensed asbestos removal contractor'
      },
      {
        name: 'Medical Waste',
        reason: 'Biohazard requiring special disposal',
        disposal: 'Medical waste disposal service'
      }
    ]
  },
  {
    category: 'Electronics',
    icon: Zap,
    color: 'blue',
    items: [
      {
        name: 'TVs & Monitors',
        reason: 'Contains lead and other toxic materials',
        disposal: 'E-waste recycling center'
      },
      {
        name: 'Computers & Laptops',
        reason: 'Contains heavy metals and rare earth elements',
        disposal: 'Electronics recycling program'
      },
      {
        name: 'Printers & Copiers',
        reason: 'Contains ink and electronic components',
        disposal: 'E-waste facility or manufacturer take-back'
      },
      {
        name: 'Cell Phones',
        reason: 'Contains valuable recyclable materials',
        disposal: 'Cell phone recycling programs'
      }
    ]
  },
  {
    category: 'Appliances',
    icon: Shield,
    color: 'purple',
    items: [
      {
        name: 'Refrigerators & Freezers',
        reason: 'Contains freon and requires special handling',
        disposal: 'Appliance recycling program or special pickup'
      },
      {
        name: 'Air Conditioners',
        reason: 'Contains refrigerants that damage ozone layer',
        disposal: 'HVAC contractor or special disposal'
      },
      {
        name: 'Washers & Dryers',
        reason: 'May be accepted with special arrangements',
        disposal: 'Scrap metal recycling or special pickup',
        allowed: true
      }
    ]
  },
  {
    category: 'Automotive',
    icon: Recycle,
    color: 'green',
    items: [
      {
        name: 'Tires',
        reason: 'Requires special recycling process',
        disposal: 'Tire retailers or recycling centers'
      },
      {
        name: 'Car Batteries',
        reason: 'Contains lead and sulfuric acid',
        disposal: 'Auto parts stores (often with credit)'
      },
      {
        name: 'Gas Tanks',
        reason: 'Explosion hazard from residual fuel',
        disposal: 'Scrap yard or auto recycler'
      }
    ]
  },
  {
    category: 'Other Prohibited Items',
    icon: XCircle,
    color: 'gray',
    items: [
      {
        name: 'Propane Tanks',
        reason: 'Explosion hazard',
        disposal: 'Propane supplier exchange programs'
      },
      {
        name: 'Railroad Ties',
        reason: 'Treated with creosote (toxic)',
        disposal: 'Special waste facility'
      },
      {
        name: 'Fluorescent Bulbs',
        reason: 'Contains mercury',
        disposal: 'Hardware stores or recycling centers'
      },
      {
        name: 'Wet Paint',
        reason: 'Liquid waste not allowed',
        disposal: 'Dry out completely or hazardous waste center'
      }
    ]
  }
];

const acceptableItems = [
  { category: 'Construction', items: ['Drywall', 'Lumber', 'Flooring', 'Shingles', 'Siding', 'Windows'] },
  { category: 'Furniture', items: ['Sofas', 'Chairs', 'Tables', 'Mattresses', 'Desks', 'Cabinets'] },
  { category: 'Yard Waste', items: ['Branches', 'Leaves', 'Grass', 'Dirt', 'Rocks', 'Mulch'] },
  { category: 'Household', items: ['Clothing', 'Toys', 'Books', 'Boxes', 'Plastic', 'General trash'] },
  { category: 'Renovation', items: ['Carpet', 'Tile', 'Countertops', 'Fixtures', 'Doors', 'Insulation'] }
];

export default function ProhibitedItemsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredCategories = categories.filter(category => {
    if (selectedCategory !== 'all' && category.category !== selectedCategory) {
      return false;
    }
    if (!searchTerm) return true;
    
    return category.items.some(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.reason.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link href="/resources" className="inline-flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Resources
          </Link>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-r from-red-600 to-red-700 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6">
            <XCircle className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Prohibited Items Guide
          </h1>
          <p className="text-xl text-red-100">
            What you can and cannot put in a dumpster
          </p>
        </div>
      </section>

      {/* Search Bar */}
      <section className="py-8 px-4 bg-white border-b">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for an item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>
      </section>

      {/* Important Notice */}
      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
            <div className="flex items-start">
              <AlertTriangle className="h-6 w-6 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-yellow-900 mb-2">
                  Important: Violations Can Result in Significant Fees
                </h3>
                <p className="text-yellow-800">
                  Placing prohibited items in a dumpster can result in fines ranging from $100 to $500+ per item, 
                  plus disposal costs. The rental company may refuse pickup until items are removed. 
                  Always verify with your rental provider as rules can vary by location and company.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Prohibited Items */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Prohibited Items by Category
          </h2>
          
          {filteredCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-8">
              <div className={`flex items-center mb-4 text-${category.color}-600`}>
                <category.icon className="h-6 w-6 mr-2" />
                <h3 className="text-xl font-semibold">{category.category}</h3>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                {category.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">{item.name}</h4>
                      {item.allowed ? (
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">
                      <strong>Why prohibited:</strong> {item.reason}
                    </p>
                    
                    <div className="pt-3 border-t">
                      <p className="text-sm text-green-700">
                        <strong>Proper disposal:</strong> {item.disposal}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Acceptable Items */}
      <section className="py-12 px-4 bg-green-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            ✓ Acceptable Items
          </h2>
          
          <div className="bg-white rounded-lg shadow-lg p-8">
            <p className="text-gray-700 mb-6 text-center">
              These items are generally accepted in most dumpster rentals, but always confirm with your provider:
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {acceptableItems.map((category, index) => (
                <div key={index}>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    {category.category}
                  </h3>
                  <ul className="space-y-2">
                    {category.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="text-sm text-gray-700 flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Special Disposal Services */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Special Disposal Resources
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <Phone className="h-6 w-6 text-blue-600 mr-3" />
                <h3 className="font-semibold text-gray-900">EPA Hotline</h3>
              </div>
              <p className="text-gray-700 mb-2">1-800-424-9346</p>
              <p className="text-sm text-gray-600">
                Information on hazardous waste disposal in your area
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <Recycle className="h-6 w-6 text-green-600 mr-3" />
                <h3 className="font-semibold text-gray-900">Earth911.com</h3>
              </div>
              <p className="text-gray-700 mb-2">Recycling Locator</p>
              <p className="text-sm text-gray-600">
                Find recycling centers for any material by ZIP code
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <Shield className="h-6 w-6 text-purple-600 mr-3" />
                <h3 className="font-semibold text-gray-900">Local Services</h3>
              </div>
              <p className="text-gray-700 mb-2">Municipal Programs</p>
              <p className="text-sm text-gray-600">
                Check city/county websites for household hazardous waste days
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
                <h3 className="font-semibold text-gray-900">Emergency</h3>
              </div>
              <p className="text-gray-700 mb-2">911 or Local Fire Dept</p>
              <p className="text-sm text-gray-600">
                For immediate hazardous material concerns
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tips Section */}
      <section className="py-12 px-4 bg-blue-50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-start">
              <Info className="h-6 w-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Pro Tips for Avoiding Issues
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">1.</span>
                    <span className="text-gray-700">
                      <strong>Ask First:</strong> When in doubt, call your rental company before loading questionable items
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">2.</span>
                    <span className="text-gray-700">
                      <strong>Separate Early:</strong> Sort prohibited items before your dumpster arrives
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">3.</span>
                    <span className="text-gray-700">
                      <strong>Document Everything:</strong> Take photos of loaded dumpster to avoid disputes
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">4.</span>
                    <span className="text-gray-700">
                      <strong>Schedule Special Pickup:</strong> Many items can be handled with separate arrangements
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">5.</span>
                    <span className="text-gray-700">
                      <strong>Check Local Rules:</strong> Regulations vary by state and municipality
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-red-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Rent a Dumpster?
          </h2>
          <p className="text-xl text-red-100 mb-8">
            Get quotes from providers who can help with proper disposal
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-8 py-3 bg-white text-red-600 rounded-lg font-medium hover:bg-red-50 transition"
          >
            Get Free Quotes
          </Link>
        </div>
      </section>
    </div>
  );
}