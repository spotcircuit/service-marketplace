"use client";

import { useState, useEffect } from 'react';
import { X, MapPin, Calendar, User, Mail, Phone, Building, Check, ChevronRight, ChevronLeft, Home, Hammer, Truck, Trees, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import GoogleLocationSearch from './GoogleLocationSearch';

interface DumpsterQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId?: string;
  businessName?: string;
  initialCustomerType?: 'residential' | 'commercial';
  initialData?: Partial<QuoteData>;
  startAtStep?: number;
}

interface QuoteData {
  // Customer Type
  customerType: 'residential' | 'commercial';
  
  // Location
  serviceAddress: string;
  city: string;
  state: string;
  zipcode: string;
  lat?: number;
  lng?: number;
  deliveryDate: string;
  
  // Contact
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName?: string;
  
  // Project Details
  projectType: string;
  debrisType: string;
  dumpsterSize: string;
  rentalPeriod: number;
  
  // Additional
  additionalInfo?: string;
  totalPrice?: number;
}

const PROJECT_TYPES_RES = [
  { id: 'home-cleanout', label: 'Home Clean Out', icon: Home, description: 'Decluttering, estate cleanouts, garage cleaning' },
  { id: 'moving', label: 'Moving', icon: Truck, description: 'Disposing of unwanted items during a move' },
  { id: 'construction', label: 'Construction/Demolition', icon: Hammer, description: 'Renovation, remodeling, or demolition projects' },
  { id: 'heavy-debris', label: 'Heavy Debris', icon: Truck, description: 'Concrete, dirt, brick, or other heavy materials' },
  { id: 'landscaping', label: 'Landscaping/Other', icon: Trees, description: 'Yard waste, events, or other projects' },
];

const PROJECT_TYPES_COM = [
  { id: 'office-cleanout', label: 'Office Cleanout', icon: Building, description: 'Office furniture, fixtures, and general business cleanouts' },
  { id: 'retail-fitout', label: 'Retail Build-Out/Closeout', icon: Hammer, description: 'Store remodels, build-outs, or closing projects' },
  { id: 'construction', label: 'Construction/Demolition', icon: Hammer, description: 'Active construction, remodeling, or demo sites' },
  { id: 'industrial-heavy', label: 'Industrial/Heavy Debris', icon: Truck, description: 'Concrete, dirt, brick, asphalt; weight limits apply' },
  { id: 'landscaping', label: 'Landscaping/Events', icon: Trees, description: 'Property maintenance, landscaping, or event cleanup' },
];

const DEBRIS_TYPES = [
  { 
    id: 'general', 
    label: 'General Waste', 
    description: 'Choose this for waste from home or office cleanouts and light renovations. Includes wood, plastic, textiles, and other non-hazardous materials.',
    restricted: []
  },
  { 
    id: 'construction', 
    label: 'Construction Debris', 
    description: 'Ideal for building or dismantling structures with materials like lumber, drywall, tile, and other construction debris.',
    restricted: ['No hazardous materials', 'No liquids', 'No tires']
  },
  { 
    id: 'heavy', 
    label: 'Heavy Materials', 
    description: 'For concrete, dirt, brick, asphalt, and other heavy materials. Weight restrictions apply.',
    restricted: ['Weight limit: 10 tons', 'No mixed loads']
  },
];

const RESIDENTIAL_SIZES = [
  {
    id: '10-yard',
    name: '10-Yard Dumpster',
    dimensions: '14\' L × 8\' W × 4\' H',
    description: 'Best for single room cleanouts (attic, garage) or renovations (bathroom, small kitchen) and yard cleanup.',
    capacity: '10 cubic yards',
    truckLoads: '3-4 pickup truck loads',
    priceLabel: 'Most Affordable'
  },
  {
    id: '20-yard',
    name: '20-Yard Dumpster',
    dimensions: '16\' L × 8\' W × 5.5\' H',
    description: 'Best for multi-room cleanouts, flooring, large kitchen or bathroom renovations, or tenant cleanouts.',
    capacity: '20 cubic yards',
    truckLoads: '6-8 pickup truck loads',
    priceLabel: 'Best Value',
    recommended: true
  },
  {
    id: '30-yard',
    name: '30-Yard Dumpster',
    dimensions: '20\' L × 8\' W × 6\' H',
    description: 'Best for full home cleanouts, multi-room renovations, large construction projects, and new builds.',
    capacity: '30 cubic yards',
    truckLoads: '9-12 pickup truck loads',
    priceLabel: 'Large Projects'
  },
];

const COMMERCIAL_SIZES = [
  {
    id: '20-yard',
    name: '20-Yard Dumpster',
    dimensions: '16\' L × 8\' W × 5.5\' H',
    description: 'Ideal for light commercial projects, small build-outs, and property cleanups.',
    capacity: '20 cubic yards',
    truckLoads: '6-8 pickup truck loads',
    priceLabel: 'Best Value',
    recommended: true
  },
  {
    id: '30-yard',
    name: '30-Yard Dumpster',
    dimensions: '20\' L × 8\' W × 6\' H',
    description: 'Great for larger renovations, tenant turnovers, and mid-size construction.',
    capacity: '30 cubic yards',
    truckLoads: '9-12 pickup truck loads',
    priceLabel: 'Commercial Standard'
  },
  {
    id: '40-yard',
    name: '40-Yard Dumpster',
    dimensions: '22\' L × 8\' W × 8\' H',
    description: 'Best for major construction, large-scale cleanouts, and industrial projects.',
    capacity: '40 cubic yards',
    truckLoads: '14-16 pickup truck loads',
    priceLabel: 'Large Commercial'
  },
];

const RENTAL_PERIODS = [
  { days: 7, label: 'Standard (7 days)', included: true },
  { days: 10, label: '10 days' },
  { days: 14, label: '2 weeks' },
  { days: 21, label: '3 weeks' },
  { days: 30, label: 'Monthly' },
];

export default function DumpsterQuoteModal({
  isOpen,
  onClose,
  businessId,
  businessName,
  initialCustomerType = 'residential',
  initialData,
  startAtStep,
}: DumpsterQuoteModalProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(startAtStep || 1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [quoteData, setQuoteData] = useState<QuoteData>({
    customerType: initialCustomerType,
    serviceAddress: '',
    city: '',
    state: '',
    zipcode: '',
    deliveryDate: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: '',
    projectType: '',
    debrisType: '',
    dumpsterSize: '',
    rentalPeriod: 7,
    additionalInfo: '',
  });

  // Pre-fill form with user data when logged in
  useEffect(() => {
    if (user) {
      setQuoteData(prev => ({
        ...prev,
        firstName: user.name?.split(' ')[0] || '',
        lastName: user.name?.split(' ').slice(1).join(' ') || '',
        email: user.email || '',
        phone: user.phone || '',
        serviceAddress: user.address || '',
        city: user.city || '',
        state: user.state || '',
        zipcode: user.zipcode || '',
      }));
    }
    
    // Set default delivery date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setQuoteData(prev => ({
      ...prev,
      deliveryDate: prev.deliveryDate || tomorrow.toISOString().split('T')[0]
    }));
  }, [user]);

  // Apply initial data and starting step when opening
  useEffect(() => {
    if (isOpen) {
      if (startAtStep) {
        setCurrentStep(startAtStep);
      }
      if (initialData) {
        setQuoteData(prev => ({
          ...prev,
          ...initialData,
          customerType: (initialData.customerType as 'residential' | 'commercial') || prev.customerType,
        }));
      }
    }
  }, [isOpen, startAtStep, initialData]);

  const handleLocationChange = (locationData: any) => {
    setQuoteData(prev => ({
      ...prev,
      serviceAddress: locationData.formatted || '',
      city: locationData.city || '',
      state: locationData.state || '',
      zipcode: locationData.zipcode || '',
      lat: locationData.lat,
      lng: locationData.lng,
    }));
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const calculateTotal = () => {
    // Return null since we're not showing prices
    return null;
  };

  const handleSubmit = async () => {
    if (isSubmitting) return; // guard against double submit
    setIsSubmitting(true);
    setError('');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

    try {
      const totalPrice = calculateTotal();

      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // API-required fields
          name: `${quoteData.firstName} ${quoteData.lastName}`.trim(),
          email: quoteData.email,
          phone: quoteData.phone,
          service_type: 'Dumpster Rental',
          zipcode: quoteData.zipcode,
          serviceAddress: quoteData.serviceAddress,
          city: quoteData.city,
          state: quoteData.state,
          // Helpful context for providers
          project_description: [
            quoteData.projectType ? `Project: ${quoteData.projectType}` : null,
            quoteData.debrisType ? `Debris: ${quoteData.debrisType}` : null,
            quoteData.dumpsterSize ? `Size: ${quoteData.dumpsterSize}` : null,
            quoteData.rentalPeriod ? `Rental: ${quoteData.rentalPeriod} days` : null,
            quoteData.additionalInfo ? `Notes: ${quoteData.additionalInfo}` : null,
          ].filter(Boolean).join(' | '),
          businessId: businessId || undefined,
          businessName: businessName || undefined,
          source: 'website',
          customerType: quoteData.customerType,
          deliveryDate: quoteData.deliveryDate,
        }),
        signal: controller.signal,
      });

      let data: any = null;
      try {
        data = await response.json();
      } catch (parseErr) {
        // Handle empty or non-JSON responses gracefully
        data = null;
      }

      if (!response.ok) {
        const statusText = data?.error || response.statusText || 'Failed to submit quote request';
        throw new Error(`${statusText}${response.status ? ` (HTTP ${response.status})` : ''}`);
      }

      // Get the quote ID from response
      const quoteId = data?.quote?.id || data?.quoteId;
      
      // If not logged in, prompt to create account with pre-filled data
      if (!user) {
        if (!quoteId) {
          console.warn('Quote created but no id returned:', data);
        }
        // Redirect to signup with quote info to link account after creation
        const signupParams = new URLSearchParams({
          quoteId: quoteId || '',
          email: quoteData.email,
          firstName: quoteData.firstName,
          lastName: quoteData.lastName,
          phone: quoteData.phone || '',
          redirectTo: '/dashboard'
        });
        router.push(`/signup?${signupParams.toString()}`);
      } else {
        // User is logged in - redirect to their dashboard
        router.push('/dashboard');
      }

      onClose();
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        setError('Request timed out. Please try again.');
      } else {
        const message = err instanceof Error ? err.message : 'Failed to submit quote request';
        setError(message);
      }
      console.error('Quote submit error:', err);
    } finally {
      clearTimeout(timeoutId);
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return quoteData.serviceAddress && quoteData.deliveryDate;
      case 2:
        return quoteData.firstName && quoteData.lastName && quoteData.email && quoteData.phone;
      case 3:
        return quoteData.projectType;
      case 4:
        return quoteData.debrisType && quoteData.dumpsterSize;
      case 5:
        return true; // Review step is always valid
      default:
        return false;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />

        {/* Modal */}
        <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">
                {businessName ? `Get Quote from ${businessName}` : 'Get Your Dumpster Quote'}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Step {currentStep} of 5 - {
                  currentStep === 1 ? 'Location & Date' :
                  currentStep === 2 ? 'Contact Information' :
                  currentStep === 3 ? 'Project Type' :
                  currentStep === 4 ? 'Size & Duration' :
                  'Review & Submit'
                }
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 h-1">
            <div 
              className="bg-primary h-1 transition-all duration-300"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            />
          </div>

          {/* Content */}
          <div className="p-6">
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Where and when do you need a dumpster?</h3>
                  {quoteData.city && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 text-green-800 rounded-lg mb-4">
                      <Check className="h-5 w-5" />
                      <span>Great news, we service your location in {quoteData.city}, {quoteData.state}!</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Service Address
                  </label>
                  <GoogleLocationSearch
                    value={quoteData.serviceAddress}
                    onChange={handleLocationChange}
                    placeholder="Enter your service address"
                    types={['address']}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter service address to confirm availability and get an accurate quote.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Delivery Date
                  </label>
                  <input
                    type="date"
                    value={quoteData.deliveryDate}
                    onChange={(e) => setQuoteData(prev => ({ ...prev, deliveryDate: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    max={new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    You can schedule up to 60 days in the future.
                  </p>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">What is your contact information?</h3>
                  
                  {/* Customer Type Selection */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-2">
                      Customer Type
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setQuoteData(prev => ({ ...prev, customerType: 'residential' }))}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          quoteData.customerType === 'residential'
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Home className="h-5 w-5 text-primary" />
                          <div className="text-left">
                            <p className="font-medium">Residential</p>
                            <p className="text-xs text-muted-foreground">Home projects</p>
                          </div>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuoteData(prev => ({ ...prev, customerType: 'commercial' }))}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          quoteData.customerType === 'commercial'
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Building className="h-5 w-5 text-primary" />
                          <div className="text-left">
                            <p className="font-medium">Commercial</p>
                            <p className="text-xs text-muted-foreground">Business projects</p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={quoteData.firstName}
                      onChange={(e) => setQuoteData(prev => ({ ...prev, firstName: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={quoteData.lastName}
                      onChange={(e) => setQuoteData(prev => ({ ...prev, lastName: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={quoteData.email}
                    onChange={(e) => setQuoteData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={quoteData.phone}
                    onChange={(e) => setQuoteData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(555) 123-4567"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Company Name <span className="text-gray-400">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={quoteData.companyName}
                    onChange={(e) => setQuoteData(prev => ({ ...prev, companyName: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">What type of project are you doing?</h3>
                </div>

                <div className="space-y-3">
                  {(
                    quoteData.customerType === 'commercial' ? PROJECT_TYPES_COM : PROJECT_TYPES_RES
                  ).map((project) => {
                    const Icon = project.icon;
                    return (
                      <button
                        key={project.id}
                        onClick={() => setQuoteData(prev => ({ ...prev, projectType: project.id }))}
                        className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                          quoteData.projectType === project.id
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Icon className="h-5 w-5 text-primary mt-0.5" />
                          <div className="flex-1">
                            <p className="font-medium">{project.label}</p>
                            <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                          </div>
                          {quoteData.projectType === project.id && (
                            <Check className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">What type of debris will be in the dumpster?</h3>
                </div>

                <div className="space-y-3">
                  {DEBRIS_TYPES.map((debris) => (
                    <button
                      key={debris.id}
                      onClick={() => setQuoteData(prev => ({ ...prev, debrisType: debris.id }))}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                        quoteData.debrisType === debris.id
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <p className="font-medium">{debris.label}</p>
                          <p className="text-sm text-muted-foreground mt-1">{debris.description}</p>
                          {debris.restricted.length > 0 && (
                            <div className="mt-2 text-xs text-red-600">
                              {debris.restricted.map((r, i) => (
                                <span key={i} className="block">• {r}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        {quoteData.debrisType === debris.id && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">What size dumpster do you need?</h3>
                  
                  <div className="lg:grid lg:grid-cols-2 lg:gap-6">
                    <div className="space-y-3">
                      {(quoteData.customerType === 'commercial' ? COMMERCIAL_SIZES : RESIDENTIAL_SIZES).map((size) => (
                        <button
                          key={size.id}
                          onClick={() => setQuoteData(prev => ({ ...prev, dumpsterSize: size.id }))}
                          className={`w-full p-4 rounded-lg border-2 transition-all text-left relative ${
                            quoteData.dumpsterSize === size.id
                              ? 'border-primary bg-primary/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {size.recommended && (
                            <span className="absolute top-2 right-2 px-2 py-1 bg-primary text-white text-xs rounded-full">
                              Most Popular
                            </span>
                          )}
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <p className="font-medium">{size.name}</p>
                              <p className="text-sm text-muted-foreground">{size.dimensions}</p>
                              <p className="text-xs text-muted-foreground mt-1">{size.description}</p>
                              <div className="flex items-center gap-4 mt-2">
                                <span className="text-sm font-semibold text-primary">{size.priceLabel}</span>
                                <span className="text-xs text-muted-foreground">{size.truckLoads}</span>
                              </div>
                            </div>
                            {quoteData.dumpsterSize === size.id && (
                              <Check className="h-5 w-5 text-primary" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                    {/* Right-side visual guide (desktop only) */}
                    <div className="hidden lg:flex items-center justify-center">
                      <div className="relative w-full max-w-sm aspect-[4/3]">
                        <Image
                          src="/images/dumpstersize.png"
                          alt="Dumpster size comparison guide"
                          fill
                          className="object-contain"
                          sizes="(min-width: 1024px) 320px, 100vw"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Customize Your Rental Period</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Have a longer project? Pay less than our standard rate of $15/day for extra days.
                  </p>
                  
                  <div className="grid grid-cols-3 gap-3">
                    {RENTAL_PERIODS.map((period) => (
                      <button
                        key={period.days}
                        onClick={() => setQuoteData(prev => ({ 
                          ...prev, 
                          rentalPeriod: period.days
                        }))}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          quoteData.rentalPeriod === period.days
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <p className="font-medium text-sm">{period.label}</p>
                        {period.included && (
                          <p className="text-xs text-green-600 font-semibold">Included</p>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Review Your Quote</h3>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Service Address:</span>
                    <span className="text-sm font-medium">{quoteData.serviceAddress}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Delivery Date:</span>
                    <span className="text-sm font-medium">
                      {new Date(quoteData.deliveryDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Contact:</span>
                    <span className="text-sm font-medium">
                      {quoteData.firstName} {quoteData.lastName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Email:</span>
                    <span className="text-sm font-medium">{quoteData.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Phone:</span>
                    <span className="text-sm font-medium">{quoteData.phone}</span>
                  </div>
                  
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Customer Type:</span>
                      <span className="text-sm font-medium">
                        {quoteData.customerType === 'residential' ? 'Residential' : 'Commercial'}
                      </span>
                    </div>
                    {businessName && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Provider:</span>
                        <span className="text-sm font-medium">{businessName}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Project Type:</span>
                      <span className="text-sm font-medium">
                        {[...PROJECT_TYPES_RES, ...PROJECT_TYPES_COM].find(p => p.id === quoteData.projectType)?.label}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Debris Type:</span>
                      <span className="text-sm font-medium">
                        {DEBRIS_TYPES.find(d => d.id === quoteData.debrisType)?.label}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Dumpster Size:</span>
                      <span className="text-sm font-medium">
                        {[...RESIDENTIAL_SIZES, ...COMMERCIAL_SIZES].find(s => s.id === quoteData.dumpsterSize)?.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Rental Period:</span>
                      <span className="text-sm font-medium">{quoteData.rentalPeriod} days</span>
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-900 font-medium">
                        <Info className="inline h-4 w-4 mr-1" />
                        Final pricing will be provided after quote submission
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        Our team will review your requirements and provide competitive pricing within 1 business day
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Additional Information <span className="text-gray-400">(Optional)</span>
                  </label>
                  <textarea
                    value={quoteData.additionalInfo}
                    onChange={(e) => setQuoteData(prev => ({ ...prev, additionalInfo: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Any special instructions or requirements?"
                  />
                </div>

                {!user && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-900">
                      <Info className="inline h-4 w-4 mr-1" />
                      After submitting, you'll have the option to create an account to track your quote and manage your rental.
                    </p>
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                currentStep === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>

            <button
              onClick={handleNext}
              disabled={!isStepValid() || isSubmitting}
              className={`px-6 py-2 rounded-lg flex items-center gap-2 font-medium ${
                isStepValid() && !isSubmitting
                  ? 'bg-primary text-white hover:bg-primary/90'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {currentStep === 5 ? (
                isSubmitting ? 'Submitting...' : user ? 'Submit Quote' : 'Get Quote & Create Account'
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}