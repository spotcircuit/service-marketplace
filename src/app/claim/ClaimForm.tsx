"use client";

import { useState } from 'react';
import { CheckCircle, MapPin, Phone, Mail, Building2, ArrowRight, Globe } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ClaimFormProps {
  business: any;
  isNewBusiness?: boolean;
  businessData?: any;
  onBusinessDataChange?: (data: any) => void;
}

export default function ClaimForm({ business, isNewBusiness = false, businessData, onBusinessDataChange }: ClaimFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    owner_name: '',
    owner_email: '',
    owner_phone: business?.phone || '',
    password: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Get claim token from session if available
      const claimToken = typeof window !== 'undefined' ? sessionStorage.getItem('claimToken') : null;
      
      // For existing businesses, create account and link
      if (!isNewBusiness || (business && isNewBusiness)) {
        // If we have a business ID (either from directory or from pros page)
        const businessId = business?.id || businessData?.id;
        
        const response = await fetch('/api/claim', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            businessId: businessId,
            name: formData.owner_name,
            email: formData.owner_email,
            phone: formData.owner_phone,
            businessEmail: businessData?.email || '',
            businessWebsite: businessData?.website || '',
            role: 'business_owner',
            password: formData.password,
            verificationMethod: 'email',
            claimToken: claimToken // Include token for tracking
          })
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to claim business');
        }

        const data = await response.json();
        
        // Track claim completion if we have a token
        if (claimToken && data.success) {
          await fetch(`/api/claim/token/${claimToken}/track`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              action: 'account_created',
              userId: data.userId
            })
          }).catch(err => console.error('Failed to track claim:', err));
        }
        
        // Show success message
        if (data.success) {
          // Store success message for the dealer portal to show
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('claimSuccess', 'true');
            sessionStorage.setItem('businessName', business?.name || businessData?.name || '');
          }
        }
        
        // The claim API already sets the auth cookie, so just redirect
        if (data.redirect) {
          router.push(data.redirect);
        } else {
          router.push('/dealer-portal');
        }
      } else if (!business && isNewBusiness) {
        // Only create new business if we don't have an existing one
        console.log("Creating business with data:", businessData);
        const businessResponse = await fetch('/api/businesses/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: businessData?.name || '',
            address: businessData?.address || '',
            city: businessData?.city || '',
            state: businessData?.state || '',
            zipcode: businessData?.zipcode || '',
            phone: businessData?.phone || '',
            email: businessData?.email || '',
            website: businessData?.website || '',
            category: businessData?.category || 'Dumpster Rental'
          })
        });

        if (!businessResponse.ok) {
          const error = await businessResponse.json();
          throw new Error(error.error || 'Failed to create business');
        }

        const { business: newBusiness } = await businessResponse.json();
        console.log("Business created:", newBusiness);
        
        // Step 2: Create user account and link to the new business
        const response = await fetch('/api/claim', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            businessId: newBusiness.id,
            name: formData.owner_name,
            email: formData.owner_email,
            phone: formData.owner_phone,
            businessEmail: businessData?.email || '',
            businessWebsite: businessData?.website || '',
            role: 'business_owner',
            password: formData.password,
            verificationMethod: 'email'
          })
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to create account');
        }

        const data = await response.json();
        
        // Show success message
        if (data.success) {
          // Store success message for the dealer portal to show
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('claimSuccess', 'true');
            sessionStorage.setItem('businessName', business?.name || businessData?.name || '');
          }
        }
        
        // The claim API already sets the auth cookie, so just redirect
        if (data.redirect) {
          router.push(data.redirect);
        } else {
          router.push('/dealer-portal');
        }
      }
    } catch (error: any) {
      setError(error.message || 'Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-card rounded-lg border p-8">
        <h2 className="text-2xl font-bold mb-6">
          {isNewBusiness ? 'Complete Your Business Listing' : 'Create Your Business Account'}
        </h2>

        {/* Business Info Display */}
        {(!isNewBusiness || (isNewBusiness && business)) ? (
          <div className="space-y-4 mb-6">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-green-900">Business Found!</h3>
                  <p className="text-sm text-green-700 mt-1">
                    Create an account to manage this business listing.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-3 text-lg">{business.name}</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <p>{business.address}</p>
                    <p>{business.city}, {business.state} {business.zipcode}</p>
                  </div>
                </div>
                {business.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 flex-shrink-0" />
                    <span>{business.phone}</span>
                  </div>
                )}
                {business.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 flex-shrink-0" />
                    <span>{business.email}</span>
                  </div>
                )}
                {business.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 flex-shrink-0" />
                    <a href={business.website} target="_blank" rel="noopener noreferrer" 
                       className="text-primary hover:underline">
                      {business.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (!business && isNewBusiness) ? (
          <div className="space-y-6 mb-6">
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold mb-4">Business Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={businessData?.name || ''}
                    onChange={(e) => onBusinessDataChange?.({...businessData, name: e.target.value})}
                    placeholder="Enter your business name"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={businessData?.address || ''}
                    onChange={(e) => onBusinessDataChange?.({...businessData, address: e.target.value})}
                    placeholder="123 Main Street"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={businessData?.city || ''}
                    onChange={(e) => onBusinessDataChange?.({...businessData, city: e.target.value})}
                    placeholder="City"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={businessData?.state || ''}
                    onChange={(e) => onBusinessDataChange?.({...businessData, state: e.target.value})}
                    placeholder="State"
                    maxLength={2}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    value={businessData?.zipcode || ''}
                    onChange={(e) => onBusinessDataChange?.({...businessData, zipcode: e.target.value})}
                    placeholder="12345"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Business Phone
                  </label>
                  <input
                    type="tel"
                    value={businessData?.phone || ''}
                    onChange={(e) => onBusinessDataChange?.({...businessData, phone: e.target.value})}
                    placeholder="(555) 123-4567"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Business Email
                  </label>
                  <input
                    type="email"
                    value={businessData?.email || ''}
                    onChange={(e) => onBusinessDataChange?.({...businessData, email: e.target.value})}
                    placeholder="business@example.com"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Business Website
                  </label>
                  <input
                    type="url"
                    value={businessData?.website || ''}
                    onChange={(e) => onBusinessDataChange?.({...businessData, website: e.target.value})}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
            </div>
            </div>
          </div>
        ) : null}

        {/* Account Creation Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold mb-2">Your Account Details</h3>
            <p className="text-sm text-muted-foreground">
              Create your account to manage this business listing
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.owner_name}
                onChange={(e) => setFormData({...formData, owner_name: e.target.value})}
                placeholder="Enter your full name"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.owner_email}
                onChange={(e) => setFormData({...formData, owner_email: e.target.value})}
                placeholder="john@example.com"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground mt-1">
                You'll use this email to log in to your account
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={formData.owner_phone}
                onChange={(e) => setFormData({...formData, owner_phone: e.target.value})}
                placeholder="(555) 123-4567"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Create Password *
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="Enter a secure password"
                minLength={8}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground mt-1">
                At least 8 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Confirm Password *
              </label>
              <input
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                placeholder="Re-enter your password"
                minLength={8}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5" />
                <span>We'll create your account and link it to this business</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5" />
                <span>You'll receive an email verification</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5" />
                <span>Start managing your listing immediately</span>
              </li>
            </ul>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account & Claim Business'}
              {!isSubmitting && <ArrowRight className="h-4 w-4" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}