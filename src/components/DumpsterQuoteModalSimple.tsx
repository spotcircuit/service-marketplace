"use client";

import { useState, useEffect } from 'react';
import { X, Phone } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DumpsterQuoteModalSimpleProps {
  isOpen: boolean;
  onClose: () => void;
  businessId?: string;
  businessName?: string;
  initialCustomerType?: 'residential' | 'commercial';
  initialData?: Partial<QuoteData>;
}

interface QuoteData {
  customerType: 'residential' | 'commercial';
  zipcode: string;
  city?: string;
  state?: string;
  dumpsterSize: string;
  debrisType: string;
  deliveryDate: string;
  projectType: string;
  phone: string;
  email: string;
  consent?: boolean;
}

const PROJECT_TYPES_RES = [
  { id: 'home-cleanout', label: 'Home Clean Out' },
  { id: 'moving', label: 'Moving' },
  { id: 'construction', label: 'Construction/Demo' },
  { id: 'heavy-debris', label: 'Heavy Debris' },
  { id: 'landscaping', label: 'Landscaping/Other' },
];

const PROJECT_TYPES_COM = [
  { id: 'office-cleanout', label: 'Office Cleanout' },
  { id: 'retail-fitout', label: 'Retail Build-Out' },
  { id: 'construction', label: 'Construction/Demo' },
  { id: 'industrial-heavy', label: 'Industrial/Heavy' },
  { id: 'landscaping', label: 'Landscaping/Events' },
];

const DUMPSTER_SIZES = [
  { id: '10-yard', name: '10-Yard', popular: false },
  { id: '20-yard', name: '20-Yard', popular: true },
  { id: '30-yard', name: '30-Yard', popular: false },
  { id: '40-yard', name: '40-Yard', popular: false },
];

export default function DumpsterQuoteModalSimple({
  isOpen,
  onClose,
  businessId,
  businessName,
  initialCustomerType = 'residential',
  initialData
}: DumpsterQuoteModalSimpleProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [zipcodeDisplay, setZipcodeDisplay] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  
  const [formData, setFormData] = useState<QuoteData>({
    customerType: initialData?.customerType || initialCustomerType || 'residential',
    zipcode: initialData?.zipcode || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    dumpsterSize: initialData?.dumpsterSize || '20-yard',
    debrisType: initialData?.debrisType || 'general',
    deliveryDate: initialData?.deliveryDate || 'asap',
    projectType: initialData?.projectType || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    consent: false,
  });

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        customerType: initialData.customerType || prev.customerType,
        zipcode: initialData.zipcode || prev.zipcode,
        city: initialData.city || prev.city,
        state: initialData.state || prev.state,
        dumpsterSize: initialData.dumpsterSize || prev.dumpsterSize,
        debrisType: initialData.debrisType || prev.debrisType,
        deliveryDate: initialData.deliveryDate || prev.deliveryDate,
        projectType: initialData.projectType || prev.projectType,
        phone: initialData.phone || prev.phone,
        email: initialData.email || prev.email,
      }));
    }
  }, [initialData]);

  // Auto-lookup city/state when zipcode is entered
  useEffect(() => {
    const lookupZipcode = async () => {
      if (formData.zipcode.length === 5 && /^\d{5}$/.test(formData.zipcode)) {
        try {
          const response = await fetch(`/api/zipcode?zip=${formData.zipcode}`);
          if (response.ok) {
            const data = await response.json();
            if (data.city && data.state) {
              setZipcodeDisplay(`${data.city}, ${data.state}`);
              setFormData(prev => ({
                ...prev,
                city: data.city,
                state: data.state
              }));
            }
          }
        } catch (error) {
          console.error('Failed to lookup zipcode:', error);
        }
      } else {
        setZipcodeDisplay('');
      }
    };

    const debounceTimer = setTimeout(lookupZipcode, 300);
    return () => clearTimeout(debounceTimer);
  }, [formData.zipcode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.consent) {
      alert('Please agree to receive quotes');
      return;
    }

    setIsSubmitting(true);

    // Prepare the quote data
    const quoteData = {
      ...formData,
      deliveryDate: formData.deliveryDate === 'date' ? selectedDate : formData.deliveryDate,
      source: businessId ? 'business-modal' : 'modal',
      businessId,
      businessName,
      service_type: `Dumpster Rental - ${formData.dumpsterSize}`,
      name: formData.email.split('@')[0], // Use email prefix as name
    };

    try {
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quoteData),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Store quote info for potential account creation
        const accountData = {
          email: formData.email,
          phone: formData.phone,
          customerType: formData.customerType,
          quoteId: result.quoteId
        };
        sessionStorage.setItem('pendingAccount', JSON.stringify(accountData));
        
        // Close modal and redirect to success page
        onClose();
        router.push(`/quote-success?id=${result.quoteId}&email=${encodeURIComponent(formData.email)}`);
      } else {
        alert('Failed to submit quote. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting quote:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const projectTypes = formData.customerType === 'commercial' ? PROJECT_TYPES_COM : PROJECT_TYPES_RES;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full">
          {/* Header - Using Background color with Foreground text */}
          <div className="sticky top-0 bg-background text-foreground border-b px-4 py-3 flex items-center justify-between z-10">
            <h2 className="text-xl font-bold">
              {businessName ? `Get Quote from ${businessName}` : 'Get Quotes'}
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-muted rounded-lg transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-3 space-y-2">
            {/* Customer Type */}
            <div>
              <label className="block text-xs font-medium mb-1">Customer Type</label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, customerType: 'residential'})}
                  className={`py-1.5 px-2 border rounded-md text-xs transition-all ${
                    formData.customerType === 'residential' 
                      ? 'bg-primary text-primary-foreground font-semibold' 
                      : 'border-gray-300 hover:border-primary/50'
                  }`}
                >
                  Residential
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, customerType: 'commercial'})}
                  className={`py-1.5 px-2 border rounded-md text-xs transition-all ${
                    formData.customerType === 'commercial' 
                      ? 'bg-secondary text-secondary-foreground font-semibold' 
                      : 'border-gray-300 hover:border-secondary/50'
                  }`}
                >
                  Commercial
                </button>
              </div>
            </div>

            {/* ZIP Code */}
            <div>
              <label className="block text-xs font-medium mb-1">
                ZIP Code
                {zipcodeDisplay && (
                  <span className="ml-2 text-xs font-normal text-primary">
                    {zipcodeDisplay}
                  </span>
                )}
              </label>
              <input
                type="text"
                value={formData.zipcode}
                onChange={(e) => setFormData({...formData, zipcode: e.target.value.replace(/\D/g, '').slice(0, 5)})}
                placeholder="Enter ZIP"
                className="w-full px-2.5 py-1.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                maxLength={5}
                pattern="[0-9]{5}"
                required
              />
            </div>

            {/* Dumpster Size */}
            <div>
              <label className="block text-xs font-medium mb-1">
                Dumpster Size
              </label>
              <div className="grid grid-cols-4 gap-1">
                {DUMPSTER_SIZES.map((size) => (
                  <button
                    key={size.id}
                    type="button"
                    onClick={() => setFormData({...formData, dumpsterSize: size.id})}
                    className={`py-1.5 px-1 border rounded-md text-xs transition ${
                      formData.dumpsterSize === size.id 
                        ? 'bg-accent text-accent-foreground font-semibold' 
                        : 'border-gray-300 hover:border-accent/50'
                    }`}
                  >
                    {size.name}
                    {size.popular && <div className="text-[10px] text-primary">Popular</div>}
                  </button>
                ))}
              </div>
            </div>

            {/* Debris Type */}
            <div>
              <label className="block text-xs font-medium mb-1">Debris Type</label>
              <select
                value={formData.debrisType}
                onChange={(e) => setFormData({...formData, debrisType: e.target.value})}
                className="w-full px-2.5 py-1.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              >
                <option value="general">General Waste</option>
                <option value="construction">Construction Debris</option>
                <option value="heavy">Heavy Materials</option>
              </select>
            </div>

            {/* Project Type */}
            <div>
              <label className="block text-xs font-medium mb-1">Project Type</label>
              <div className="grid grid-cols-3 gap-1">
                {projectTypes.slice(0, 3).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, projectType: p.id })}
                    className={`py-1 px-2 border rounded-md text-xs ${
                      formData.projectType === p.id 
                        ? 'bg-secondary text-secondary-foreground font-semibold' 
                        : 'border-gray-300 hover:border-secondary/30'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Delivery Date */}
            <div>
              <label className="block text-xs font-medium mb-1">When do you need it?</label>
              <div className="grid grid-cols-3 gap-1">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, deliveryDate: 'asap'})}
                  className={`py-1.5 px-2 border rounded-md text-xs ${
                    formData.deliveryDate === 'asap' 
                      ? 'bg-primary text-primary-foreground font-semibold' 
                      : 'border-gray-300 hover:border-primary/50'
                  }`}
                >
                  ASAP
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, deliveryDate: 'week'})}
                  className={`py-1.5 px-2 border rounded-md text-xs ${
                    formData.deliveryDate === 'week' 
                      ? 'bg-primary text-primary-foreground font-semibold' 
                      : 'border-gray-300 hover:border-primary/50'
                  }`}
                >
                  This Week
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, deliveryDate: 'date'})}
                  className={`py-1.5 px-2 border rounded-md text-xs ${
                    formData.deliveryDate === 'date' 
                      ? 'bg-primary text-primary-foreground font-semibold' 
                      : 'border-gray-300 hover:border-primary/50'
                  }`}
                >
                  Pick Date
                </button>
              </div>
              {formData.deliveryDate === 'date' && (
                <div className="mt-1.5">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    max={new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                    className="w-full px-2.5 py-1.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                </div>
              )}
            </div>

            {/* Contact */}
            <div className="grid grid-cols-2 gap-1.5">
              <input
                type="tel"
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="px-2.5 py-1.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="px-2.5 py-1.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                required
              />
            </div>

            {/* TCPA Consent */}
            <div className="flex items-start gap-1.5">
              <input
                type="checkbox"
                id="modal-consent"
                checked={formData.consent}
                onChange={(e) => setFormData({...formData, consent: e.target.checked})}
                className="mt-0.5"
                required
              />
              <label htmlFor="modal-consent" className="text-[11px] text-gray-600 leading-tight">
                I agree to receive quotes via phone/text. Message rates may apply.
              </label>
            </div>


            {/* CTA */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-1.5 btn-primary rounded-md text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Get Quotes →'}
            </button>
            
            {/* Micro-trust */}
            <div className="flex items-center justify-center gap-3 text-[10px] text-gray-600">
              <span>✓ Same-day</span>
              <span>✓ No spam</span>
              <span>✓ Free quotes</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}