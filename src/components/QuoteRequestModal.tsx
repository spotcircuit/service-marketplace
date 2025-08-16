"use client";

import { useState } from 'react';
import { X, Send, CheckCircle } from 'lucide-react';

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
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    zipcode: '',
    service_type: category,
    project_description: '',
    timeline: 'within_week',
    budget: 'not_sure',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          business_ids: businessIds,
          category,
          source: 'quote_request',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        setTimeout(() => {
          onClose();
          setIsSuccess(false);
          setFormData({
            name: '',
            email: '',
            phone: '',
            zipcode: '',
            service_type: category,
            project_description: '',
            timeline: 'within_week',
            budget: 'not_sure',
          });
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-card rounded-lg max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        {isSuccess ? (
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    value={formData.zipcode}
                    onChange={(e) => setFormData({ ...formData, zipcode: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

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
