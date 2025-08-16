"use client";

import { useState, useEffect } from 'react';
import { X, Send, CheckCircle, User, MapPin, LogIn } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface QuoteRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessIds?: string[];
  businessName?: string;
  category?: string;
}

export default function QuoteRequestModal({
  isOpen,
  onClose,
  businessIds = [],
  businessName,
  category = 'General Service',
}: QuoteRequestModalProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipcode: '',
    service_type: category,
    project_description: '',
    timeline: 'within_week',
    budget: 'not_sure',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill form with user data when logged in
  useEffect(() => {
    console.log('QuoteRequestModal user:', user); // Debug log
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        zipcode: user.zipcode || '',
      }));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          ...formData,
          business_ids: businessIds,
          category,
          source: 'quote_request',
          user_id: user?.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        setTimeout(() => {
          onClose();
          setIsSuccess(false);
          // Reset only non-user fields
          setFormData(prev => ({
            ...prev,
            service_type: category,
            project_description: '',
            timeline: 'within_week',
            budget: 'not_sure',
          }));
        }, 3000);
      } else {
        setError(data.error || 'Failed to submit request');
      }
    } catch (err) {
      setError('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignupClick = () => {
    onClose();
    router.push('/auth/signup');
  };

  const handleLoginClick = () => {
    onClose();
    router.push('/auth/login');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-card rounded-lg max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        {!user ? (
          /* Not Logged In - Show Login/Signup Prompt */
          <div className="p-8">
            <div className="flex justify-end mb-2">
              <button
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 text-primary rounded-full mb-4">
                <User className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Create an Account to Get Quotes</h3>
              <p className="text-muted-foreground mb-6">
                We need your location and contact information to connect you with local service providers.
              </p>

              <div className="space-y-3">
                <button
                  onClick={handleSignupClick}
                  className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium"
                >
                  Sign Up - It's Free
                </button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-card text-muted-foreground">Already have an account?</span>
                  </div>
                </div>

                <button
                  onClick={handleLoginClick}
                  className="w-full px-6 py-3 border border-border rounded-lg hover:bg-muted font-medium"
                >
                  Log In
                </button>
              </div>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Why create an account?</h4>
                <ul className="text-sm text-left space-y-1 text-muted-foreground">
                  <li>✓ Get quotes from multiple providers</li>
                  <li>✓ Track your quote requests</li>
                  <li>✓ Save your preferences</li>
                  <li>✓ Faster quote submissions</li>
                </ul>
              </div>
            </div>
          </div>
        ) : isSuccess ? (
          /* Success Message */
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mb-4">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Request Sent!</h3>
            <p className="text-muted-foreground">
              {businessName
                ? `${businessName} will contact you soon.`
                : 'Service providers will contact you soon with quotes.'}
            </p>
          </div>
        ) : (
          /* Quote Request Form */
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold">Get Free Quotes</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {businessName && (
                <div className="p-3 bg-primary/10 rounded-lg text-sm">
                  Requesting quote from: <strong>{businessName}</strong>
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* User Info Section - Read-only when logged in */}
              <div className="space-y-4 p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 text-sm font-medium mb-2">
                  <User className="h-4 w-4" />
                  Your Information
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      required
                      readOnly={!!user}
                      value={formData.name}
                      onChange={(e) => !user && setFormData({ ...formData, name: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg ${
                        user ? 'bg-background/50 text-muted-foreground' : ''
                      } focus:outline-none focus:ring-2 focus:ring-primary`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      readOnly={!!user}
                      value={formData.phone}
                      onChange={(e) => !user && setFormData({ ...formData, phone: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg ${
                        user ? 'bg-background/50 text-muted-foreground' : ''
                      } focus:outline-none focus:ring-2 focus:ring-primary`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      readOnly={!!user}
                      value={formData.email}
                      onChange={(e) => !user && setFormData({ ...formData, email: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg ${
                        user ? 'bg-background/50 text-muted-foreground' : ''
                      } focus:outline-none focus:ring-2 focus:ring-primary`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      required
                      readOnly={!!user}
                      value={formData.zipcode}
                      onChange={(e) => !user && setFormData({ ...formData, zipcode: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg ${
                        user ? 'bg-background/50 text-muted-foreground' : ''
                      } focus:outline-none focus:ring-2 focus:ring-primary`}
                    />
                  </div>
                </div>

                {/* Address Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      required
                      readOnly={!!user}
                      value={formData.address}
                      onChange={(e) => !user && setFormData({ ...formData, address: e.target.value })}
                      placeholder="123 Main St"
                      className={`w-full px-3 py-2 border rounded-lg ${
                        user ? 'bg-background/50 text-muted-foreground' : ''
                      } focus:outline-none focus:ring-2 focus:ring-primary`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        readOnly={!!user}
                        value={formData.city}
                        onChange={(e) => !user && setFormData({ ...formData, city: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg ${
                          user ? 'bg-background/50 text-muted-foreground' : ''
                        } focus:outline-none focus:ring-2 focus:ring-primary`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        State *
                      </label>
                      <input
                        type="text"
                        required
                        readOnly={!!user}
                        value={formData.state}
                        onChange={(e) => !user && setFormData({ ...formData, state: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg ${
                          user ? 'bg-background/50 text-muted-foreground' : ''
                        } focus:outline-none focus:ring-2 focus:ring-primary`}
                      />
                    </div>
                  </div>
                </div>

                {user && (
                  <p className="text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3 inline mr-1" />
                    Using your saved address. Update in your profile if needed.
                  </p>
                )}
              </div>

              {/* Project Details Section */}
              <div className="space-y-4 p-4 border rounded-lg">
                <div className="text-sm font-medium mb-2">Project Details</div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Service Needed *
                  </label>
                  <select
                    required
                    value={formData.service_type}
                    onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select a service</option>
                    <option value="Dumpster Rental">Dumpster Rental</option>
                    <option value="Junk Removal">Junk Removal</option>
                    <option value="Demolition">Demolition</option>
                    <option value="Construction Cleanup">Construction Cleanup</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Project Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.project_description}
                    onChange={(e) => setFormData({ ...formData, project_description: e.target.value })}
                    placeholder="Tell us about your project..."
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Timeline
                    </label>
                    <select
                      value={formData.timeline}
                      onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="asap">ASAP</option>
                      <option value="within_week">Within a week</option>
                      <option value="within_month">Within a month</option>
                      <option value="flexible">Flexible</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Budget Range
                    </label>
                    <select
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="not_sure">Not sure</option>
                      <option value="under_500">Under $500</option>
                      <option value="500_1000">$500 - $1,000</option>
                      <option value="1000_2500">$1,000 - $2,500</option>
                      <option value="2500_5000">$2,500 - $5,000</option>
                      <option value="over_5000">Over $5,000</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 font-medium"
                >
                  <Send className="h-4 w-4" />
                  {isSubmitting ? 'Sending...' : 'Get Free Quotes'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 border rounded-lg hover:bg-muted"
                >
                  Cancel
                </button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                By submitting, you agree to receive quotes from service providers.
                Your information is secure and never shared.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}