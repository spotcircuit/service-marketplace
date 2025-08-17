'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, CheckCircle, ArrowRight, Calendar, MapPin, Shield, Star, Clock, DollarSign, Truck, Info, ChevronDown, Map } from 'lucide-react';
import DumpsterQuoteModal from '@/components/DumpsterQuoteModal';
import GoogleLocationSearch from '@/components/GoogleLocationSearch';

export default function HomePage() {
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [customerType, setCustomerType] = useState<'residential' | 'commercial'>('residential');
  const [userLocation, setUserLocation] = useState({ city: 'Ashburn', state: 'VA', zipcode: '' });
  const [modalInitialData, setModalInitialData] = useState<any>(null);
  const [modalStartStep, setModalStartStep] = useState<number | undefined>(undefined);
  const [localProviders, setLocalProviders] = useState<any[]>([]);
  const [providersLoading, setProvidersLoading] = useState(false);
  
  // Quote form state
  const [quoteForm, setQuoteForm] = useState({
    zipcode: '',
    size: '20-yard', // Pre-selected most popular
    debrisType: 'general', // align to modal options
    deliveryDate: 'asap', // 'asap' | 'week' | 'date'
    phone: '',
    email: '',
    consent: false,
    projectType: '' as string,
  });
  const [selectedDate, setSelectedDate] = useState<string>('');


  // Detect user location on mount
  useEffect(() => {
    detectUserLocation();
  }, []);

  // Fetch providers when location changes
  useEffect(() => {
    if (userLocation.city && userLocation.state) {
      fetchLocalProviders(userLocation.city, userLocation.state);
    }
  }, [userLocation.city, userLocation.state]);

  // Invert header/hero tone for home page to ensure readable header over hero
  useEffect(() => {
    const root = document.documentElement;
    const previousTone = root.getAttribute('data-header-tone');
    root.setAttribute('data-header-tone', 'secondary');
    return () => {
      if (previousTone) {
        root.setAttribute('data-header-tone', previousTone);
      } else {
        root.removeAttribute('data-header-tone');
      }
    };
  }, []);

  const fetchLocalProviders = async (city: string, state: string) => {
    try {
      setProvidersLoading(true);
      const response = await fetch(`/api/businesses?city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}&featured=true&limit=6`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch providers');
      }
      
      const data = await response.json();
      
      if (data.businesses && data.businesses.length > 0) {
        // Map real businesses to display format
        const providers = data.businesses.map((business: any) => {
          // Parse services to extract sizes
          let sizes: string[] = [];
          if (business.services) {
            if (Array.isArray(business.services)) {
              sizes = business.services
                .map((s: any) => {
                  const service = typeof s === 'string' ? s : s.name || '';
                  // Extract yard sizes
                  const match = service.match(/(\d+)[\s-]*(yard|yd)/i);
                  if (match) return match[1];
                  if (service.includes('10')) return '10';
                  if (service.includes('20')) return '20';
                  if (service.includes('30')) return '30';
                  if (service.includes('40')) return '40';
                  return null;
                })
                .filter(Boolean);
            }
          }
          
          // Default sizes if none found
          if (sizes.length === 0) {
            sizes = business.is_featured ? ['10', '20', '30', '40'] : ['10', '20', '30'];
          }
          
          return {
            id: business.id,
            name: business.name,
            isFeatured: business.is_featured || false,
            isVerified: business.is_verified || false,
            availability: business.same_day_available ? 'Today' : 'Tomorrow',
            sizes: sizes,
            rating: business.rating || 4.5,
            reviews: business.reviews || 0,
            phone: business.phone,
            description: business.description,
            is_verified: business.is_verified,
            is_featured: business.is_featured
          };
        });
        
        setLocalProviders(providers);
      } else {
        // If no real providers, show a message or fallback
        setLocalProviders([]);
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
      setLocalProviders([]);
    } finally {
      setProvidersLoading(false);
    }
  };

  const detectUserLocation = async () => {
    try {
      console.log('Detecting user location...');
      const response = await fetch('/api/geolocation');
      console.log('Geolocation response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Geolocation data:', data);
      
      if (data.city && (data.region_code || data.state)) {
        const detectedLocation = {
          city: data.city,
          state: data.region_code || data.state,
          zipcode: data.postal || ''
        };
        console.log('Setting user location to:', detectedLocation);
        setUserLocation(detectedLocation);
        setQuoteForm(prev => ({ ...prev, zipcode: data.postal || '' }));
      } else if (data.error) {
        console.log('Geolocation API returned default location');
        // Still use the default location provided
        setUserLocation({
          city: data.city || 'Ashburn',
          state: data.state || 'VA',
          zipcode: data.postal || ''
        });
      }
    } catch (error) {
      console.error('Geolocation error:', error);
      // Fallback to default location
      console.log('Using fallback location: Ashburn, VA');
      setUserLocation({
        city: 'Ashburn',
        state: 'VA',
        zipcode: '20147'
      });
    }
  };

  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteForm.consent) {
      alert('Please agree to receive quotes');
      return;
    }
    const initialData: any = {
      customerType,
      zipcode: quoteForm.zipcode,
      debrisType: quoteForm.debrisType,
      dumpsterSize: quoteForm.size,
      email: quoteForm.email,
      phone: quoteForm.phone,
      projectType: quoteForm.projectType || undefined,
    };
    if (quoteForm.deliveryDate === 'date' && selectedDate) {
      initialData.deliveryDate = selectedDate;
    }
    setModalInitialData(initialData);
    setModalStartStep(1);
    setQuoteModalOpen(true);
  };

  type SizeCard = {
    size: string;
    id: string;
    dimensions: string;
    capacity: string;
    projects: string;
    price: string;
    image: string;
    popular?: boolean;
  };

  const dumpsterSizes: SizeCard[] = [
    {
      size: '10-Yard',
      id: '10-yard',
      dimensions: '14\' × 8\' × 3.5\'',
      capacity: '4 pickup loads',
      projects: 'Single room, garage cleanout',
      price: `${userLocation.city}: $295-$395`,
      image: '🚛',
    },
    {
      size: '20-Yard',
      id: '20-yard',
      dimensions: '16\' × 8\' × 5.5\'',
      capacity: '8 pickup loads',
      projects: 'Kitchen remodel, flooring',
      price: `${userLocation.city}: $395-$595`,
      image: '🚛',
      popular: true,
    },
    {
      size: '30-Yard',
      id: '30-yard',
      dimensions: '20\' × 8\' × 6\'',
      capacity: '12 pickup loads',
      projects: 'Full home renovation',
      price: `${userLocation.city}: $495-$695`,
      image: '🚚',
    },
    {
      size: '40-Yard',
      id: '40-yard',
      dimensions: '22\' × 8\' × 8\'',
      capacity: '16 pickup loads',
      projects: 'Major construction',
      price: `${userLocation.city}: $595-$795`,
      image: '🚚',
    },
  ];

  const sizesForCustomer: SizeCard[] = dumpsterSizes;

  const projectTypesResidential = [
    { id: 'home-cleanout', label: 'Home Clean Out' },
    { id: 'moving', label: 'Moving' },
    { id: 'construction', label: 'Construction/Demolition' },
    { id: 'heavy-debris', label: 'Heavy Debris' },
    { id: 'landscaping', label: 'Landscaping/Other' },
  ];

  const projectTypesCommercial = [
    { id: 'office-cleanout', label: 'Office Cleanout' },
    { id: 'retail-fitout', label: 'Retail Build-Out/Closeout' },
    { id: 'construction', label: 'Construction/Demolition' },
    { id: 'industrial-heavy', label: 'Industrial/Heavy Debris' },
    { id: 'landscaping', label: 'Landscaping/Events' },
  ];

  // Show all sizes on homepage
  const sizesForDisplay = dumpsterSizes;

  const recentReviews = [
    { text: "Drop-off in 3 hours", author: "Kim", location: "Ashburn" },
    { text: "Best price, no surprises", author: "Mike", location: "Reston" },
    { text: "Same day delivery!", author: "Sarah", location: "Sterling" }
  ];

  const faqs = [
    {
      question: "What can't I put in a dumpster?",
      answer: "Hazardous materials, tires, batteries, paint, chemicals, and appliances with freon are prohibited."
    },
    {
      question: "How long is the rental period?",
      answer: "Standard rental is 7 days. Extended rentals available for $15/day after the first week."
    },
    {
      question: "Do I need a permit?",
      answer: "Permits are required for street placement. Driveway placement typically doesn't require permits."
    },
    {
      question: "When will my dumpster arrive?",
      answer: "Same-day and next-day delivery available. Most orders delivered within 24 hours."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Instant Quote Form */}
      <section className="hero-gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 py-12 relative z-10 text-hero-foreground">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              {/* Left: Headlines */}
              <div className="self-start">
                {/* Hero Image (left of the quote form, above headline) */}
                <Image
                  src="/images/row-1-column-1.png"
                  alt="Roll-off dumpsters in Ashburn"
                  width={288}
                  height={200}
                  className="mb-4 w-56 h-auto md:w-64 lg:w-72 drop-shadow"
                  priority
                />
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  Need a Dumpster in {userLocation.city}? Get a Quote.
                </h1>
                <p className="text-xl text-hero-foreground/90 mb-6">
                  10–40 yard roll-offs • Same-day delivery in some areas • Upfront pricing—no surprises.
                </p>
                
                {/* Trust Indicators */}
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    <span>Licensed & Insured</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Image
                      src="/images/fasttimecheck.png"
                      alt="Fast same-day delivery"
                      width={20}
                      height={20}
                      className="object-contain"
                    />
                    <span>Same-day in some areas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-current" />
                    <span>4.8/5 Rating</span>
                  </div>
                </div>

                {/* Recent Reviews Carousel */}
                <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                  <div className="flex items-center gap-4 overflow-x-auto">
                    {recentReviews.map((review, idx) => (
                      <div key={idx} className="flex-shrink-0 text-sm">
                        <p className="italic">"{review.text}"</p>
                        <p className="text-hero-foreground/70 text-xs mt-1">— {review.author}, {review.location}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Quote Form */}
              <div className="bg-white rounded-xl shadow-2xl p-6 text-gray-900">
                <h2 className="text-2xl font-bold mb-4">Get Quotes</h2>
                
                <form onSubmit={handleQuoteSubmit} className="space-y-4">
                  {/* Customer Type */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Customer Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setCustomerType('residential')}
                        className={`p-2 border rounded-lg text-sm transition-all ${
                          customerType === 'residential' 
                            ? 'border-primary bg-primary/10 text-primary font-semibold' 
                            : 'border-gray-300 hover:border-primary/50'
                        }`}
                      >
                        Residential
                      </button>
                      <button
                        type="button"
                        onClick={() => setCustomerType('commercial')}
                        className={`p-2 border rounded-lg text-sm transition-all ${
                          customerType === 'commercial' 
                            ? 'border-primary bg-primary/10 text-primary font-semibold' 
                            : 'border-gray-300 hover:border-primary/50'
                        }`}
                      >
                        Commercial
                      </button>
                    </div>
                  </div>
                  {/* ZIP Code */}
                  <div>
                    <label className="block text-sm font-medium mb-1">ZIP Code</label>
                    <input
                      type="text"
                      value={quoteForm.zipcode}
                      onChange={(e) => setQuoteForm({...quoteForm, zipcode: e.target.value})}
                      placeholder="Enter ZIP"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>

                  {/* Size Selection (filtered by customer type) */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Dumpster Size
                      <button type="button" className="ml-2 text-primary text-xs underline">
                        Not sure?
                      </button>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {sizesForCustomer.map((size: SizeCard) => (
                        <button
                          key={size.id}
                          type="button"
                          onClick={() => setQuoteForm({...quoteForm, size: size.id})}
                          className={`p-2 border rounded-lg text-sm transition ${
                            quoteForm.size === size.id 
                              ? 'border-primary bg-primary/10 font-semibold' 
                              : 'border-gray-300 hover:border-primary'
                          }`}
                        >
                          {size.size}
                          {size.popular && <span className="text-xs text-primary ml-1">Popular</span>}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Debris Type */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Debris Type</label>
                    <select
                      value={quoteForm.debrisType}
                      onChange={(e) => setQuoteForm({...quoteForm, debrisType: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="general">General Waste</option>
                      <option value="construction">Construction Debris</option>
                      <option value="heavy">Heavy Materials (concrete, dirt, brick)</option>
                    </select>
                  </div>

                  {/* Project Type (matches modal options) */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Project Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(customerType === 'commercial' ? projectTypesCommercial : projectTypesResidential).map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setQuoteForm({ ...quoteForm, projectType: p.id })}
                          className={`p-2 border rounded-lg text-sm ${
                            quoteForm.projectType === p.id ? 'border-primary bg-primary/10 font-semibold' : 'border-gray-300'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Date */}
                  <div>
                    <label className="block text-sm font-medium mb-1">When do you need it?</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setQuoteForm({...quoteForm, deliveryDate: 'asap'})}
                        className={`p-2 border rounded-lg text-sm ${
                          quoteForm.deliveryDate === 'asap' 
                            ? 'border-primary bg-primary/10' 
                            : 'border-gray-300'
                        }`}
                      >
                        ASAP
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuoteForm({...quoteForm, deliveryDate: 'week'})}
                        className={`p-2 border rounded-lg text-sm ${
                          quoteForm.deliveryDate === 'week' 
                            ? 'border-primary bg-primary/10' 
                            : 'border-gray-300'
                        }`}
                      >
                        This Week
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuoteForm({...quoteForm, deliveryDate: 'date'})}
                        className={`p-2 border rounded-lg text-sm ${
                          quoteForm.deliveryDate === 'date' 
                            ? 'border-primary bg-primary/10' 
                            : 'border-gray-300'
                        }`}
                      >
                        Pick Date
                      </button>
                    </div>
                    {quoteForm.deliveryDate === 'date' && (
                      <div className="mt-2">
                        <input
                          type="date"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          max={new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                        />
                      </div>
                    )}
                  </div>

                  {/* Contact */}
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="tel"
                      placeholder="Phone"
                      value={quoteForm.phone}
                      onChange={(e) => setQuoteForm({...quoteForm, phone: e.target.value})}
                      className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={quoteForm.email}
                      onChange={(e) => setQuoteForm({...quoteForm, email: e.target.value})}
                      className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      required
                    />
                  </div>

                  {/* TCPA Consent */}
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      id="consent"
                      checked={quoteForm.consent}
                      onChange={(e) => setQuoteForm({...quoteForm, consent: e.target.checked})}
                      className="mt-1"
                      required
                    />
                    <label htmlFor="consent" className="text-xs text-gray-600">
                      I agree to receive quotes via phone/text about my request. Message rates may apply.
                    </label>
                  </div>

                  {/* CTAs */}
                  <div className="space-y-2">
                    <button
                      type="submit"
                      className="w-full py-3 btn-primary rounded-lg text-lg"
                    >
                      Get Quotes →
                    </button>
                    <a
                      href="tel:+14342076559"
                      className="w-full py-3 btn-ghost-primary rounded-lg flex items-center justify-center gap-2"
                    >
                      <Phone className="h-5 w-5" />
                      Call Now: (434) 207-6559
                    </a>
                  </div>

                  {/* Micro-trust */}
                  <div className="flex items-center justify-center gap-4 text-xs text-gray-600">
                    <span>✓ Same-day in some areas</span>
                    <span>✓ No spam</span>
                    <span>✓ Free quotes</span>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Size Cards - Mini Configurator */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Choose Your Dumpster Size</h2>
            <p className="text-xl text-muted-foreground">
              Not sure which size? Most customers choose 20-yard for home projects.
            </p>
          </div>

          {/* Illustration near the size section header */}
          <div className="flex justify-center mb-8">
            <Image
              src="/images/row-2-column-2.png"
              alt="Dumpster sizes illustration"
              width={288}
              height={200}
              className="w-56 h-auto md:w-64 lg:w-72 drop-shadow"
            />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sizesForDisplay.map((item) => (
              <div 
                key={item.id}
                className={`border rounded-xl p-6 hover:shadow-xl transition relative cursor-pointer ${
                  item.popular ? 'border-primary shadow-lg ring-2 ring-primary/20' : ''
                }`}
                onClick={() => {
                  setQuoteForm({ ...quoteForm, size: item.id });
                  const initialData: any = {
                    customerType,
                    dumpsterSize: item.id,
                    zipcode: quoteForm.zipcode || '',
                    debrisType: quoteForm.debrisType || undefined,
                    projectType: quoteForm.projectType || undefined,
                    email: quoteForm.email || '',
                    phone: quoteForm.phone || '',
                  };
                  if (quoteForm.deliveryDate === 'date' && selectedDate) {
                    initialData.deliveryDate = selectedDate;
                  }
                  setModalInitialData(initialData);
                  setModalStartStep(1);
                  setQuoteModalOpen(true);
                }}
              >
                {item.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 badge-popular">
                    MOST POPULAR
                  </span>
                )}
                {(item.id === '30-yard' || item.id === '40-yard') && (
                  <span className="absolute -top-3 right-3 badge-commercial">
                    COMMERCIAL
                  </span>
                )}
                
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">{item.image}</div>
                  <h3 className="text-xl font-bold">{item.size}</h3>
                  <p className="text-sm text-muted-foreground">{item.dimensions}</p>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="text-sm">
                    <span className="font-medium">Holds:</span> {item.capacity}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Best for:</span> {item.projects}
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-lg font-bold text-primary mb-3">{item.price}</p>
                  <button className="w-full px-4 py-2 btn-primary rounded">
                    Select This Size
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Illustration under the size grid */}
          <div className="flex justify-center mt-10">
            <Image
              src="/images/row-1-column-2.png"
              alt="Home project with dumpster"
              width={384}
              height={250}
              className="w-64 h-auto md:w-80 lg:w-96 drop-shadow"
            />
          </div>

          <div className="text-center mt-8">
            <button
              onClick={() => alert('Size guide modal would open here')}
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium"
            >
              <Info className="h-4 w-4" />
              Need help choosing? Use our size calculator
            </button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How Dumpster Rental Works</h2>
            <p className="text-xl text-muted-foreground">
              Simple 4-step process. Most deliveries within 24 hours.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Get Quotes', desc: 'Compare prices from local providers' },
              { step: '2', title: 'Schedule Delivery', desc: 'Choose your delivery date & time' },
              { step: '3', title: 'Fill It Up', desc: '7 days included, extensions available' },
              { step: '4', title: 'We Haul Away', desc: 'Text us when ready for pickup', useHaulImage: true }
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  {item.useHaulImage ? (
                    <Image
                      src="/images/haulawaybin.png"
                      alt="Haul away service for dumpster pickup"
                      width={32}
                      height={32}
                      className="object-contain"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-primary">{item.step}</span>
                  )}
                </div>
                <h3 className="font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Providers */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          {/* Illustration above Available Providers */}
          <div className="flex justify-center mb-8">
            <Image
              src="/images/row-2-column-1.png"
              alt="Local providers illustration"
              width={384}
              height={250}
              className="w-64 h-auto md:w-80 lg:w-96 drop-shadow"
            />
          </div>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Providers in {userLocation.city}</h2>
            <p className="text-xl text-muted-foreground">
              Top-rated companies with premium service and fast response times
            </p>
          </div>

          <div className="space-y-4">
            {providersLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Loading local providers...</p>
              </div>
            ) : localProviders.length > 0 ? (
              localProviders.map((provider, idx) => (
              <div key={idx} className={`border rounded-lg p-6 hover:shadow-lg transition relative overflow-hidden ${
                provider.isFeatured ? 'border-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50' : ''
              }`}>
                {provider.isFeatured && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-1 rounded-bl-lg">
                    <span className="flex items-center gap-1 text-sm font-bold">
                      <Star className="h-3 w-3 fill-white" />
                      FEATURED
                    </span>
                  </div>
                )}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-xl font-bold">{provider.name}</h3>
                      {provider.isVerified && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          <Image
                            src="/images/secureverified.png"
                            alt="Verified provider badge"
                            width={12}
                            height={12}
                            className="object-contain"
                          />
                          Verified
                        </span>
                      )}
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{provider.rating}</span>
                        <span className="text-sm text-muted-foreground">({provider.reviews} reviews)</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm mb-3">
                      <span className="flex items-center gap-1">
                        <Truck className="h-4 w-4 text-green-600" />
                        <span className="font-semibold text-green-600">Available {provider.availability}</span>
                      </span>
                      <span>Sizes: {provider.sizes.join(', ')} yard</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        Services {userLocation.city} area
                      </span>
                      {provider.isFeatured && (
                        <span className="flex items-center gap-1 text-orange-600 font-medium">
                          <Clock className="h-4 w-4" />
                          Priority Response
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <a
                      href={`tel:${provider.phone}`}
                      className="px-4 py-2 btn-ghost-primary rounded-lg flex items-center gap-2"
                    >
                      <Phone className="h-4 w-4" />
                      Call
                    </a>
                    <button
                      onClick={() => {
                        setSelectedProvider(provider);
                        const initialData: any = {
                          customerType,
                          zipcode: quoteForm.zipcode || '',
                          debrisType: quoteForm.debrisType || undefined,
                          projectType: quoteForm.projectType || undefined,
                          dumpsterSize: quoteForm.size || undefined,
                          email: quoteForm.email || '',
                          phone: quoteForm.phone || '',
                        };
                        if (quoteForm.deliveryDate === 'date' && selectedDate) {
                          initialData.deliveryDate = selectedDate;
                        }
                        setModalInitialData(initialData);
                        setModalStartStep(1);
                        setQuoteModalOpen(true);
                      }}
                      className="px-4 py-2 btn-primary rounded-lg"
                    >
                      Request Quote
                    </button>
                  </div>
                </div>
              </div>
            ))
            ) : (
              <div className="text-center py-8 border rounded-lg">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-lg font-semibold mb-2">No providers found in {userLocation.city}</p>
                <p className="text-sm text-muted-foreground mb-4">
                  We're expanding our network. Try searching nearby cities or call us for assistance.
                </p>
                <a
                  href="tel:+14342076559"
                  className="inline-flex items-center gap-2 px-4 py-2 btn-primary rounded-lg"
                >
                  <Phone className="h-4 w-4" />
                  Call (434) 207-6559
                </a>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Service Areas */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Service Areas Near {userLocation.city}</h2>
            <p className="text-xl text-muted-foreground">
              We serve all of Northern Virginia and surrounding areas
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {['Reston', 'Sterling', 'Leesburg', 'Herndon', 'Fairfax', 'Chantilly', 
              'Arlington', 'Alexandria', 'McLean', 'Vienna', 'Falls Church', 'Manassas'].map(city => (
              <Link
                key={city}
                href={`/virginia/${city.toLowerCase()}`}
                className="text-center p-3 bg-white rounded-lg hover:shadow-md transition"
              >
                <p className="font-medium">{city}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Our Marketplace</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Compare Prices</h3>
              <p className="text-muted-foreground">
                Get quotes from multiple providers. Save up to 30% vs calling one company.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Image
                  src="/images/secureverified.png"
                  alt="Verified providers security badge"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <h3 className="text-xl font-bold mb-2">Verified Providers</h3>
              <p className="text-muted-foreground">
                All providers are licensed, insured, and background-checked for your protection.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Image
                  src="/images/fasttimecheck.png"
                  alt="Fast delivery guarantee with time check"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <h3 className="text-xl font-bold mb-2">Fast Delivery</h3>
              <p className="text-muted-foreground">
                Same-day and next-day delivery available. Most orders delivered within 24 hours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border rounded-lg p-6">
                <h3 className="text-lg font-bold mb-2">{faq.question}</h3>
                <p className="text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>

        </div>
      </section>


      {/* Sticky Mobile CTA Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-3 z-40 lg:hidden">
        <div className="flex gap-2">
          <button
            onClick={() => {
              const initialData: any = {
                customerType,
                zipcode: quoteForm.zipcode || '',
                debrisType: quoteForm.debrisType || undefined,
                projectType: quoteForm.projectType || undefined,
                dumpsterSize: quoteForm.size || undefined,
                email: quoteForm.email || '',
                phone: quoteForm.phone || '',
              };
              if (quoteForm.deliveryDate === 'date' && selectedDate) {
                initialData.deliveryDate = selectedDate;
              }
              setModalInitialData(initialData);
              setModalStartStep(1);
              setQuoteModalOpen(true);
            }}
            className="flex-1 py-3 btn-primary rounded-lg"
          >
            Get Quotes
          </button>
          <a
            href="tel:+14342076559"
            className="flex-1 py-3 btn-ghost-primary rounded-lg flex items-center justify-center gap-2"
          >
            <Phone className="h-4 w-4" />
            Call Now
          </a>
        </div>
      </div>

      {/* Quote Modal */}
      <DumpsterQuoteModal
        isOpen={quoteModalOpen}
        onClose={() => {
          setQuoteModalOpen(false);
          setSelectedProvider(null);
          setModalInitialData(null);
          setModalStartStep(undefined);
        }}
        businessId={selectedProvider?.id}
        businessName={selectedProvider?.name}
        initialCustomerType={customerType}
        initialData={modalInitialData}
        startAtStep={modalStartStep}
      />
    </div>
  );
}