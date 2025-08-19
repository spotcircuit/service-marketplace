'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Clock, 
  DollarSign,
  Shield,
  Camera,
  Save,
  AlertCircle,
  CheckCircle,
  Plus,
  X,
  Wrench,
  Map
} from 'lucide-react';

interface BusinessProfile {
  id: string;
  name: string;
  category: string;
  description: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  price_range: string;
  years_in_business: number;
  license_number: string;
  insurance: boolean;
  services: string[];
  service_areas: string[];
  hours: any;
  service_radius_miles: number;
  service_zipcodes: string[];
}

export default function BusinessProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [serviceAreaMode, setServiceAreaMode] = useState<'radius' | 'zipcodes'>('radius');
  const [newZipcode, setNewZipcode] = useState('');
  const [formData, setFormData] = useState<BusinessProfile>({
    id: '',
    name: '',
    category: '',
    description: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    city: '',
    state: '',
    zipcode: '',
    price_range: '',
    years_in_business: 0,
    license_number: '',
    insurance: false,
    services: [],
    service_areas: [],
    hours: {},
    service_radius_miles: 25,
    service_zipcodes: []
  });

  useEffect(() => {
    fetchBusinessProfile();
  }, []);

  const fetchBusinessProfile = async () => {
    try {
      const response = await fetch('/api/dealer-portal/business-profile');
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      const data = await response.json();
      setProfile(data.business);
      // Ensure all fields have non-null values for form inputs
      setFormData({
        ...data.business,
        description: data.business.description || '',
        phone: data.business.phone || '',
        email: data.business.email || '',
        website: data.business.website || '',
        address: data.business.address || '',
        city: data.business.city || '',
        state: data.business.state || '',
        zipcode: data.business.zipcode || '',
        price_range: data.business.price_range || '',
        license_number: data.business.license_number || '',
        services: data.business.services || [],
        service_areas: data.business.service_areas || [],
        hours: data.business.hours || {},
        service_radius_miles: data.business.service_radius_miles || 25,
        service_zipcodes: data.business.service_zipcodes || []
      });
      // Determine service area mode based on existing data
      if (data.business.service_zipcodes && data.business.service_zipcodes.length > 0) {
        setServiceAreaMode('zipcodes');
      } else {
        setServiceAreaMode('radius');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load business profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/dealer-portal/business-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      setSuccess('Business profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update business profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading business profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/5">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Business Profile</h1>
          <p className="opacity-70 mt-2">Manage your business information and settings</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
            <div className="text-sm text-destructive">{error}</div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-secondary rounded-lg flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-secondary-foreground mt-0.5" />
            <div className="text-sm text-secondary-foreground">{success}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-primary/10 rounded-lg shadow p-6 border border-primary/20">
            <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Business Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-2 pl-10 border border-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  />
                  <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-primary" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                >
                  <option value="">Select a category</option>
                  <option value="Dumpster Rental">Dumpster Rental</option>
                  <option value="Junk Removal">Junk Removal</option>
                  <option value="Demolition">Demolition</option>
                  <option value="Construction Cleanup">Construction Cleanup</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  placeholder="Describe your business, services, and what makes you unique..."
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-primary/10 rounded-lg shadow p-6 border border-primary/20">
            <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Phone
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    className="w-full px-4 py-2 pl-10 border border-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                    placeholder="(555) 123-4567"
                  />
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-primary" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full px-4 py-2 pl-10 border border-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                    placeholder="business@example.com"
                  />
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-primary" />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Website
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-4 py-2 pl-10 border border-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                    placeholder="https://www.example.com"
                  />
                  <Globe className="absolute left-3 top-2.5 h-4 w-4 text-primary" />
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-primary/10 rounded-lg shadow p-6 border border-primary/20">
            <h2 className="text-lg font-semibold mb-4">Business Location</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="123 Main Street"
                  />
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Houston"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    required
                    maxLength={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="TX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    value={formData.zipcode}
                    onChange={(e) => setFormData({ ...formData, zipcode: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="77001"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Service Coverage Area - NEW SECTION */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Map className="h-5 w-5" />
              Service Coverage Area
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Define where you provide services. Customers in these areas will see your business in search results.
            </p>
            
            {/* Service Area Mode Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                How do you define your service area?
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setServiceAreaMode('radius');
                    setFormData({ ...formData, service_zipcodes: [] });
                  }}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    serviceAreaMode === 'radius' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium mb-1">Service Radius</div>
                  <div className="text-sm text-gray-600">
                    I service within a certain distance from my location
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setServiceAreaMode('zipcodes');
                    setFormData({ ...formData, service_radius_miles: 0 });
                  }}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    serviceAreaMode === 'zipcodes' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium mb-1">Specific ZIP Codes</div>
                  <div className="text-sm text-gray-600">
                    I only service specific ZIP codes
                  </div>
                </button>
              </div>
            </div>

            {/* Radius Configuration */}
            {serviceAreaMode === 'radius' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Radius (miles)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="5"
                      max="100"
                      step="5"
                      value={formData.service_radius_miles}
                      onChange={(e) => setFormData({ ...formData, service_radius_miles: parseInt(e.target.value) })}
                      className="flex-1"
                    />
                    <div className="w-20">
                      <input
                        type="number"
                        min="5"
                        max="100"
                        value={formData.service_radius_miles}
                        onChange={(e) => setFormData({ ...formData, service_radius_miles: Math.min(100, Math.max(5, parseInt(e.target.value) || 25)) })}
                        className="w-full px-3 py-1 border border-gray-300 rounded-lg text-center"
                      />
                    </div>
                    <span className="text-sm text-gray-600">miles</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    You'll receive leads from customers within {formData.service_radius_miles} miles of your business location
                  </p>
                </div>
              </div>
            )}

            {/* ZIP Codes Configuration */}
            {serviceAreaMode === 'zipcodes' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service ZIP Codes
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newZipcode}
                      onChange={(e) => setNewZipcode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newZipcode.length === 5 && !formData.service_zipcodes.includes(newZipcode)) {
                            setFormData({ 
                              ...formData, 
                              service_zipcodes: [...formData.service_zipcodes, newZipcode] 
                            });
                            setNewZipcode('');
                          }
                        }
                      }}
                      placeholder="Enter ZIP code"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      maxLength={5}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newZipcode.length === 5 && !formData.service_zipcodes.includes(newZipcode)) {
                          setFormData({ 
                            ...formData, 
                            service_zipcodes: [...formData.service_zipcodes, newZipcode] 
                          });
                          setNewZipcode('');
                        }
                      }}
                      disabled={newZipcode.length !== 5 || formData.service_zipcodes.includes(newZipcode)}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add ZIP
                    </button>
                  </div>
                  
                  {formData.service_zipcodes.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.service_zipcodes.map((zip, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 border border-gray-300 rounded-full text-sm"
                        >
                          {zip}
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                service_zipcodes: formData.service_zipcodes.filter((_, i) => i !== index)
                              });
                            }}
                            className="ml-1 text-gray-500 hover:text-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {formData.service_zipcodes.length === 0 && (
                    <p className="text-sm text-gray-500">No ZIP codes added yet</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Services Offered */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Services Offered
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Add the services your business provides.
            </p>
            
            <div className="space-y-3">
              {formData.services && formData.services.map((service, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={service}
                    onChange={(e) => {
                      const newServices = [...formData.services];
                      newServices[index] = e.target.value;
                      setFormData({ ...formData, services: newServices });
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g., Dumpster Rental, Junk Removal"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newServices = formData.services.filter((_, i) => i !== index);
                      setFormData({ ...formData, services: newServices });
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  setFormData({ 
                    ...formData, 
                    services: [...(formData.services || []), ''] 
                  });
                }}
                className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary hover:text-primary transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Service
              </button>
            </div>
          </div>

          {/* Business Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years in Business
                </label>
                <input
                  type="number"
                  value={formData.years_in_business}
                  onChange={(e) => setFormData({ ...formData, years_in_business: parseInt(e.target.value) || 0 })}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <select
                  value={formData.price_range}
                  onChange={(e) => setFormData({ ...formData, price_range: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select price range</option>
                  <option value="$">$ - Budget Friendly</option>
                  <option value="$$">$$ - Moderate</option>
                  <option value="$$$">$$$ - Premium</option>
                  <option value="$$$$">$$$$ - Luxury</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  License Number
                </label>
                <input
                  type="text"
                  value={formData.license_number}
                  onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="LIC-123456"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Insurance
                </label>
                <div className="flex items-center space-x-4 mt-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="insurance"
                      checked={formData.insurance === true}
                      onChange={() => setFormData({ ...formData, insurance: true })}
                      className="mr-2"
                    />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="insurance"
                      checked={formData.insurance === false}
                      onChange={() => setFormData({ ...formData, insurance: false })}
                      className="mr-2"
                    />
                    <span>No</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push('/dealer-portal')}
              className="w-full sm:w-auto px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center sm:justify-start gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}