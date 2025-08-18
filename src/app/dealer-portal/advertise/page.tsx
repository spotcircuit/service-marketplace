'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { loadGoogleMaps } from '@/lib/google-maps';
import {
  Megaphone,
  Star,
  TrendingUp,
  MapPin,
  Check,
  X,
  Zap,
  Award,
  BarChart3,
  Users,
  Eye,
  Target,
  Crown,
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react';

interface AdvertisingPackage {
  name: string;
  price: number;
  duration: string;
  features: string[];
  icon: any;
  color: string;
  popular?: boolean;
  savings?: string;
}

const advertisingPackages: AdvertisingPackage[] = [
  {
    name: 'Boost Listing',
    price: 49,
    duration: 'for 30 days',
    icon: TrendingUp,
    color: 'green',
    features: [
      'Highlighted in search results',
      'Priority placement in your category',
      'Boost icon on your listing',
      'Show above standard listings',
      'Mobile & desktop visibility'
    ]
  },
  {
    name: 'Featured Business',
    price: 99,
    duration: 'for 30 days',
    icon: Star,
    color: 'yellow',
    popular: true,
    features: [
      'Everything in Boost Listing',
      'Featured badge on listing',
      'Top 3 placement in your city',
      'Homepage featured section',
      'Priority in "Near Me" searches',
      'Show in multiple categories'
    ]
  },
  {
    name: 'Premium Spotlight',
    price: 199,
    duration: 'for 30 days',
    icon: Crown,
    color: 'purple',
    features: [
      'Everything in Featured Business',
      '#1 placement in your city',
      'Exclusive category banner',
      'No competitor ads on your page',
      'Priority customer support',
      'Performance analytics',
      'Extra photos & content'
    ]
  }
];

const addonServices = [
  {
    name: 'Extra Photos',
    price: 19,
    description: 'Add up to 10 photos to showcase your work',
    icon: Eye
  },
  {
    name: 'Refresh Boost',
    price: 29,
    description: 'Move back to top of search results',
    icon: Zap
  },
  {
    name: 'Multi-City',
    price: 39,
    description: 'Show in 3 additional nearby cities',
    icon: MapPin
  },
  {
    name: 'Urgent Badge',
    price: 25,
    description: 'Show "Available Today" badge for 7 days',
    icon: Target
  }
];

interface BusinessInfo {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  latitude?: number;
  longitude?: number;
}

export default function AdvertisePage() {
  const router = useRouter();
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<number[]>([]);
  // One-time fees only for now
  const [loading, setLoading] = useState(false);
  const [business, setBusiness] = useState<BusinessInfo | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const circlesRef = useRef<any[]>([]);

  useEffect(() => {
    fetchBusinessProfile();
  }, []);

  useEffect(() => {
    if (business && business.latitude && business.longitude && selectedPackage !== null) {
      initializeMap();
    }
  }, [business, selectedPackage]);

  const fetchBusinessProfile = async () => {
    try {
      const response = await fetch('/api/dealer-portal/business-profile');
      if (response.ok) {
        const data = await response.json();
        setBusiness(data.business);
      }
    } catch (error) {
      console.error('Error fetching business profile:', error);
    }
  };

  const initializeMap = async () => {
    if (!mapRef.current || !business?.latitude || !business?.longitude) return;

    try {
      await loadGoogleMaps();
      
      const center = { lat: business.latitude, lng: business.longitude };
      
      // Initialize map
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center,
        zoom: 11,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      // Add business marker
      new window.google.maps.Marker({
        position: center,
        map: mapInstanceRef.current,
        title: business.name,
        icon: {
          url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
        }
      });

      // Clear existing circles
      circlesRef.current.forEach(circle => circle.setMap(null));
      circlesRef.current = [];

      // Add coverage circles based on selected package
      const coverageRadii = {
        0: 8000,  // Boost: 5 mile radius (8000 meters)
        1: 16000, // Featured: 10 mile radius
        2: 32000  // Premium: 20 mile radius
      };

      if (selectedPackage !== null) {
        const radius = coverageRadii[selectedPackage as keyof typeof coverageRadii] || 8000;
        
        // Primary coverage area
        const primaryCircle = new window.google.maps.Circle({
          strokeColor: selectedPackage === 2 ? '#9333ea' : selectedPackage === 1 ? '#eab308' : '#22c55e',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: selectedPackage === 2 ? '#9333ea' : selectedPackage === 1 ? '#eab308' : '#22c55e',
          fillOpacity: 0.15,
          map: mapInstanceRef.current,
          center,
          radius
        });
        circlesRef.current.push(primaryCircle);

        // Show extended coverage for multi-city addon
        if (selectedAddons.includes(2)) {
          const extendedCircle = new window.google.maps.Circle({
            strokeColor: '#3b82f6',
            strokeOpacity: 0.5,
            strokeWeight: 1,
            fillColor: '#3b82f6',
            fillOpacity: 0.08,
            map: mapInstanceRef.current,
            center,
            radius: radius * 1.5
          });
          circlesRef.current.push(extendedCircle);
        }
      }
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  };

  const calculateTotal = () => {
    let total = 0;
    
    if (selectedPackage !== null) {
      total += advertisingPackages[selectedPackage].price;
    }
    
    selectedAddons.forEach(index => {
      total += addonServices[index].price;
    });
    
    // No discounts - these are one-time fees
    
    return total;
  };

  const handlePurchase = async () => {
    if (selectedPackage === null) return;
    
    setLoading(true);
    
    try {
      const pkg = advertisingPackages[selectedPackage];
      const totalPrice = calculateTotal();
      
      // Create checkout session for featured listing
      const response = await fetch('/api/dealer-portal/subscription/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          mode: 'payment', // One-time payment
          lineItems: [
            {
              price_data: {
                currency: 'usd',
                product_data: {
                  name: pkg.name,
                  description: `${pkg.duration} featured listing for your business`
                },
                unit_amount: pkg.price * 100 // Convert to cents
              },
              quantity: 1
            },
            // Add addon items if selected
            ...selectedAddons.map(index => ({
              price_data: {
                currency: 'usd',
                product_data: {
                  name: addonServices[index].name,
                  description: addonServices[index].description
                },
                unit_amount: addonServices[index].price * 100
              },
              quantity: 1
            }))
          ],
          metadata: {
            type: 'featured',
            package: pkg.name,
            duration: '30', // 30 days
            addons: selectedAddons.join(',')
          }
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Checkout error:', data);
        if (response.status === 401) {
          alert('Please log in to purchase advertising');
          router.push('/login?type=business');
        } else {
          alert(data.error || 'Failed to start checkout. Please make sure Stripe is configured.');
        }
        return;
      }
      
      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Payment system not configured. Please contact support.');
      }
    } catch (error) {
      console.error('Error starting checkout:', error);
      alert('Failed to process payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleAddon = (index: number) => {
    setSelectedAddons(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary text-primary-foreground rounded-full mb-4">
          <Megaphone className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Get More Customers Today
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Stand out from competitors with featured placement and priority visibility
        </p>
      </div>

      {/* Stats Banner */}
      <div className="bg-primary rounded-2xl p-8 mb-12 text-white">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold">3x</div>
            <div className="text-white/80">More Visibility</div>
          </div>
          <div>
            <div className="text-3xl font-bold">Top 3</div>
            <div className="text-white/80">Search Placement</div>
          </div>
          <div>
            <div className="text-3xl font-bold">30</div>
            <div className="text-white/80">Days Featured</div>
          </div>
          <div>
            <div className="text-3xl font-bold">100%</div>
            <div className="text-white/80">Risk Free</div>
          </div>
        </div>
      </div>

      {/* One-Time Purchase Notice */}
      <div className="text-center mb-8">
        <span className="inline-flex items-center px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-medium">
          <Check className="h-4 w-4 mr-2" />
          One-time payment • No recurring fees • 30 days featured
        </span>
      </div>

      {/* Packages */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {advertisingPackages.map((pkg, index) => (
          <div
            key={index}
            className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all cursor-pointer ${
              selectedPackage === index
                ? 'ring-4 ring-secondary transform scale-105'
                : 'hover:shadow-xl'
            }`}
            onClick={() => setSelectedPackage(index)}
          >
            {pkg.popular && (
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
                MOST POPULAR
              </div>
            )}
            
            <div className="p-8">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 ${index === 0 ? 'bg-accent/10' : index === 1 ? 'bg-primary/10' : 'bg-secondary/10'}`}>
                <pkg.icon className={`h-6 w-6 ${index === 0 ? 'text-accent' : index === 1 ? 'text-primary' : 'text-secondary'}`} />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
              
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">
                  ${pkg.price}
                </span>
                <span className="text-gray-600 ml-2">
                  {pkg.duration}
                </span>
                
              </div>
              
              <ul className="space-y-3 mb-6">
                {pkg.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <Check className="h-5 w-5 text-accent mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button
                className={`w-full py-3 rounded-lg font-medium transition ${
                  selectedPackage === index
                    ? 'bg-secondary text-secondary-foreground'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {selectedPackage === index ? 'Selected' : 'Select Package'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add-on Services */}
      <div className="bg-gray-50 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Boost Your Results</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {addonServices.map((addon, index) => (
            <div
              key={index}
              onClick={() => toggleAddon(index)}
              className={`p-4 bg-white rounded-lg border-2 cursor-pointer transition ${
                selectedAddons.includes(index)
                  ? 'border-secondary bg-secondary/10'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <addon.icon className="h-5 w-5 text-gray-600 mr-3 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">{addon.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{addon.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">+${addon.price}</div>
                  <div className="text-xs text-gray-500">one-time</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Territory Map Preview */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Territory Coverage</h2>
        {business?.latitude && business?.longitude ? (
          <div>
            <div ref={mapRef} className="w-full h-96 rounded-lg" />
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-accent rounded-full opacity-20 border-2 border-accent"></div>
                <span>Boost: 5 mile radius</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-primary rounded-full opacity-20 border-2 border-primary"></div>
                <span>Featured: 10 mile radius</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-secondary rounded-full opacity-20 border-2 border-secondary"></div>
                <span>Premium: 20 mile radius</span>
              </div>
            </div>
            {selectedAddons.includes(2) && (
              <div className="mt-2 flex items-center gap-2 text-sm">
                <div className="w-4 h-4 bg-secondary rounded-full opacity-10 border border-secondary"></div>
                <span>Extended coverage with Multi-City addon</span>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {business ? 'Setting up map...' : 'Loading business location...'}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Premium packages include exclusive territory rights
            </p>
          </div>
        )}
      </div>

      {/* Order Summary */}
      {selectedPackage !== null && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-white p-4 md:static md:border-0 md:rounded-2xl md:shadow-lg md:p-8 md:bottom-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Order Summary</h3>
              <p className="text-gray-600 mt-1">
                {advertisingPackages[selectedPackage].name}
                {selectedAddons.length > 0 && ` + ${selectedAddons.length} addon(s)`}
              </p>
            </div>
            <div className="md:text-right">
              <div className="text-2xl md:text-3xl font-bold text-gray-900">
                ${calculateTotal()}
                <span className="text-base md:text-lg text-gray-600 ml-2">total</span>
              </div>
              <p className="text-sm text-gray-500">One-time payment</p>
            </div>
            <button
              onClick={handlePurchase}
              disabled={loading}
              className="w-full md:w-auto md:ml-8 px-6 md:px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Start Advertising'}
              <ArrowRight className="inline-block ml-2 h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="mt-12 bg-secondary/10 rounded-lg p-6">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-secondary mt-0.5 mr-3" />
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">How It Works</h4>
            <ul className="text-sm text-secondary space-y-1">
              <li>• Your promotion starts immediately after payment</li>
              <li>• Featured placement lasts for 30 days from purchase</li>
              <li>• First-come, first-served for premium positions</li>
              <li>• Renew anytime to maintain your featured status</li>
              <li>• Email support for custom packages</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}