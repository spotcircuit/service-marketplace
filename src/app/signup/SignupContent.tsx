'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { User, Briefcase, Mail, Lock, Building2, Phone, AlertCircle, CheckCircle, MapPin } from 'lucide-react';

export default function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isPro = searchParams.get('pro') === 'true';
  const businessId = searchParams.get('businessId');
  const businessName = searchParams.get('businessName');
  const claim = searchParams.get('claim');
  
  // Quote-related params for customer signup after quote submission
  const quoteId = searchParams.get('quoteId');
  const emailFromQuote = searchParams.get('email');
  const firstNameFromQuote = searchParams.get('firstName');
  const lastNameFromQuote = searchParams.get('lastName');
  const phoneFromQuote = searchParams.get('phone');
  const redirectTo = searchParams.get('redirectTo');
  
  // Business details from business-setup
  const addressFromParams = searchParams.get('address');
  const cityFromParams = searchParams.get('city');
  const stateFromParams = searchParams.get('state');
  const zipcodeFromParams = searchParams.get('zipcode');
  const latFromParams = searchParams.get('lat');
  const lngFromParams = searchParams.get('lng');

  const [formData, setFormData] = useState({
    email: emailFromQuote || '',
    password: '',
    confirmPassword: '',
    name: (firstNameFromQuote && lastNameFromQuote) ? `${firstNameFromQuote} ${lastNameFromQuote}` : '',
    phone: phoneFromQuote || '',
    businessName: businessName || '',
    role: isPro ? 'business_owner' : 'customer',
    // Business details from business-setup
    category: '',
    address: addressFromParams || '',
    city: cityFromParams || '',
    state: stateFromParams || '',
    zipcode: zipcodeFromParams || '',
    lat: latFromParams || '',
    lng: lngFromParams || '',
    businessId: businessId || '',
    claim: claim || '',
    website: '',
    description: '',
    services: [] as string[]
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [accountType, setAccountType] = useState(isPro ? 'business' : 'customer');

  useEffect(() => {
    // Update account type if URL param changes
    if (searchParams.get('pro') === 'true') {
      setAccountType('business');
      setFormData(prev => ({ ...prev, role: 'business_owner' }));
    }
    // Prefill business name if provided
    if (businessName) {
      setFormData(prev => ({ ...prev, businessName: businessName }));
    }
  }, [searchParams, businessName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          phone: formData.phone,
          role: formData.role,
          businessName: formData.businessName,
          quoteId: quoteId, // Include quote ID to link after signup
          // Business details for business owners
          ...(formData.role === 'business_owner' && {
            businessId: formData.businessId,
            claim: formData.claim,
            category: formData.category,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zipcode: formData.zipcode,
            lat: formData.lat,
            lng: formData.lng,
            website: formData.website,
            description: formData.description,
            services: formData.services
          })
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Signup failed');
        setLoading(false);
        return;
      }

      // Show success message before redirect
      setError('');

      // Redirect based on role or redirectTo param
      if (redirectTo) {
        router.push(redirectTo);
      } else if (formData.role === 'business_owner') {
        router.push('/dealer-portal');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleAccountTypeChange = (type: string) => {
    if (type === 'business' && !businessName) {
      // Redirect to business setup if switching to business without coming from there
      router.push('/business-setup');
      return;
    }
    setAccountType(type);
    setFormData(prev => ({
      ...prev,
      role: type === 'business' ? 'business_owner' : 'customer'
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Account Type Selector */}
        <div className="bg-white rounded-lg shadow-sm p-2 mb-6 flex gap-2">
          <button
            onClick={() => handleAccountTypeChange('customer')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md transition-colors text-sm font-medium ${
              accountType === 'customer'
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <User className="h-4 w-4" />
            Customer Account
          </button>
          <button
            onClick={() => handleAccountTypeChange('business')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md transition-colors text-sm font-medium ${
              accountType === 'business'
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Briefcase className="h-4 w-4" />
            Business Account
          </button>
        </div>

        {/* Signup Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              {accountType === 'business' ? (
                <Briefcase className="h-8 w-8 text-primary" />
              ) : (
                <User className="h-8 w-8 text-primary" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {accountType === 'business' ? 'Join as a Professional' : 'Create Your Account'}
            </h1>
            <p className="text-sm text-gray-600">
              {accountType === 'business'
                ? 'Start receiving leads and grow your business'
                : 'Get quotes from trusted service providers'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div className="text-sm text-destructive">{error}</div>
            </div>
          )}

          {accountType === 'business' && (
            <div className="mb-6 p-4 bg-accent/10 border border-accent/20 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-accent mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Business Benefits</h3>
                  <ul className="text-sm text-accent space-y-1">
                    <li>• Receive qualified leads in your area</li>
                    <li>• Manage your business profile</li>
                    <li>• Access to dealer portal</li>
                    <li>• Start with 10 free lead credits</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter your full name"
              />
            </div>

            {accountType === 'business' && (
              <>
                {businessName && (
                  <div className="mb-6 p-4 bg-accent/10 border border-accent/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-accent mt-0.5" />
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-1">
                          {claim === 'true' ? 'Claiming Business' : 'Creating Business'}
                        </h3>
                        <p className="text-sm text-accent font-medium">{businessName}</p>
                        <p className="text-sm text-accent mt-1">
                          {formData.address}, {formData.city}, {formData.state} {formData.zipcode}
                        </p>
                        <Link 
                          href="/business-setup" 
                          className="text-sm text-accent underline hover:text-accent/90 mt-2 inline-block"
                        >
                          Edit business details
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {!businessName && (
                  <div className="mb-6 p-4 bg-secondary/10 border border-secondary/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-secondary mt-0.5" />
                      <div>
                        <p className="text-sm text-secondary">
                          You need to set up your business details first.
                        </p>
                        <Link 
                          href="/business-setup" 
                          className="text-sm text-secondary underline hover:text-secondary/90 mt-2 inline-block font-medium"
                        >
                          Go to Business Setup
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Business Phone
                  </label>
                  <div className="relative">
                    <input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                      className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="(555) 123-4567"
                    />
                    <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Service Category
                  </label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Select a category</option>
                    <option value="Dumpster Rental">Dumpster Rental</option>
                    <option value="Junk Removal">Junk Removal</option>
                    <option value="Demolition">Demolition</option>
                    <option value="Construction Cleanup">Construction Cleanup</option>
                    <option value="Roofing">Roofing</option>
                    <option value="HVAC">HVAC</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Landscaping">Landscaping</option>
                    <option value="Moving">Moving</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your email"
                />
                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Create a password (min 8 characters)"
                />
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Confirm your password"
                />
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div className="flex items-start">
              <input
                id="terms"
                type="checkbox"
                required
                className="mt-1 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                I agree to the{' '}
                <Link href="/terms" className="text-primary hover:text-primary/80">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-primary hover:text-primary/80">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : accountType === 'business' ? 'Join as Professional' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                href={`/login?type=${accountType}`}
                className="text-primary hover:text-primary/80 font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>

          {accountType === 'business' && (
            <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <p className="text-sm text-primary">
                <strong>Have an existing listing?</strong> You can{' '}
                <Link href="/claim" className="underline hover:text-primary/90">
                  claim your business
                </Link>{' '}
                instead of creating a new account.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
