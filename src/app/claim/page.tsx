"use client";

import { useState, useEffect } from 'react';
import { Search, Building2, CheckCircle, Mail, Phone, Shield, ArrowRight, Edit } from 'lucide-react';
import { sampleBusinesses } from '@/data/sample-businesses';
import Link from 'next/link';

export default function ClaimBusinessPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<typeof sampleBusinesses>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<any>(null);
  const [claimStep, setClaimStep] = useState<'search' | 'verify' | 'success'>('search');
  const [user, setUser] = useState<any>(null);
  const [verificationData, setVerificationData] = useState({
    owner_name: '',
    owner_email: '',
    owner_phone: '',
    verification_method: 'email',
    business_license: '',
    additional_info: '',
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      // User not logged in
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    // Search businesses by name, phone, or address
    const results = sampleBusinesses.filter(b =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.phone.includes(searchQuery) ||
      b.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.city.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setSearchResults(results);
  };

  const handleClaimBusiness = (business: any) => {
    setSelectedBusiness(business);
    setClaimStep('verify');
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Create a password for the user (they can change it later)
    const tempPassword = 'Business' + Math.random().toString(36).slice(-8) + '!';

    try {
      const response = await fetch('/api/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: selectedBusiness?.id,
          email: verificationData.owner_email,
          password: tempPassword,
          name: verificationData.owner_name,
          phone: verificationData.owner_phone,
          verificationMethod: verificationData.verification_method,
          verificationCode: '123456', // In production, this would be sent via email/SMS
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Store the temp password to show the user
        localStorage.setItem('tempPassword', tempPassword);
        setClaimStep('success');

        // Redirect after 3 seconds
        setTimeout(() => {
          window.location.href = data.redirect || '/dealer-portal';
        }, 3000);
      } else {
        alert(data.error || 'Failed to claim business. Please try again.');
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary to-primary/80 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Claim Your Business Listing
            </h1>
            <p className="text-xl text-white/90">
              Take control of your online presence and start getting more leads
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {claimStep === 'search' && (
          <div className="max-w-3xl mx-auto">
            {/* Search Form */}
            <div className="bg-card rounded-lg border p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6">Find Your Business</h2>
              <form onSubmit={handleSearch} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Search by business name, phone, or address
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="e.g., R&L Dumpsters or (936) 236-9474"
                      className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                      type="submit"
                      className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium flex items-center gap-2"
                    >
                      <Search className="h-5 w-5" />
                      Search
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  Found {searchResults.length} business{searchResults.length !== 1 ? 'es' : ''}
                </h3>
                {searchResults.map(business => (
                  <div key={business.id} className="bg-card rounded-lg border p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-xl font-bold">{business.name}</h4>
                          {business.is_claimed && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                              Already Claimed
                            </span>
                          )}
                          {business.is_verified && (
                            <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                              <Shield className="h-3 w-3" />
                              Verified
                            </span>
                          )}
                        </div>
                        <p className="text-muted-foreground mb-2">{business.category}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {business.phone}
                          </span>
                          <span>{business.address}, {business.city}, {business.state}</span>
                        </div>
                      </div>

                      {!business.is_claimed ? (
                        <button
                          onClick={() => handleClaimBusiness(business)}
                          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium"
                        >
                          Claim This Business
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          {user && user.business_id === business.id ? (
                            <Link
                              href="/dealer-portal"
                              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium inline-flex items-center gap-2"
                            >
                              <Edit className="h-4 w-4" />
                              Manage Listing
                            </Link>
                          ) : (
                            <Link
                              href="/login?type=business"
                              className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 font-medium"
                            >
                              Sign In to Manage
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* No Results */}
            {searchQuery && searchResults.length === 0 && (
              <div className="bg-card rounded-lg border p-8 text-center">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No businesses found</h3>
                <p className="text-muted-foreground mb-6">
                  We couldn&apos;t find a business matching your search.
                </p>
                <Link
                  href="/signup?pro=true"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium"
                >
                  Add Your Business
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        )}

        {claimStep === 'verify' && selectedBusiness && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-card rounded-lg border p-8">
              <h2 className="text-2xl font-bold mb-6">Verify Your Ownership</h2>

              {/* Business Info */}
              <div className="p-4 bg-muted rounded-lg mb-6">
                <h3 className="font-semibold mb-2">{selectedBusiness.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedBusiness.address}, {selectedBusiness.city}, {selectedBusiness.state}
                </p>
                <p className="text-sm text-muted-foreground">{selectedBusiness.phone}</p>
              </div>

              <form onSubmit={handleVerificationSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={verificationData.owner_name}
                      onChange={(e) => setVerificationData({...verificationData, owner_name: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Your Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={verificationData.owner_phone}
                      onChange={(e) => setVerificationData({...verificationData, owner_phone: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Business Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={verificationData.owner_email}
                    onChange={(e) => setVerificationData({...verificationData, owner_email: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Business License Number (if available)
                  </label>
                  <input
                    type="text"
                    value={verificationData.business_license}
                    onChange={(e) => setVerificationData({...verificationData, business_license: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Verification Method *
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted">
                      <input
                        type="radio"
                        name="verification"
                        value="email"
                        checked={verificationData.verification_method === 'email'}
                        onChange={(e) => setVerificationData({...verificationData, verification_method: e.target.value})}
                      />
                      <div>
                        <div className="font-medium">Email Verification</div>
                        <div className="text-sm text-muted-foreground">
                          We&apos;ll send a verification code to your business email
                        </div>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted">
                      <input
                        type="radio"
                        name="verification"
                        value="phone"
                        checked={verificationData.verification_method === 'phone'}
                        onChange={(e) => setVerificationData({...verificationData, verification_method: e.target.value})}
                      />
                      <div>
                        <div className="font-medium">Phone Verification</div>
                        <div className="text-sm text-muted-foreground">
                          We&apos;ll call the business phone number on file
                        </div>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted">
                      <input
                        type="radio"
                        name="verification"
                        value="document"
                        checked={verificationData.verification_method === 'document'}
                        onChange={(e) => setVerificationData({...verificationData, verification_method: e.target.value})}
                      />
                      <div>
                        <div className="font-medium">Document Verification</div>
                        <div className="text-sm text-muted-foreground">
                          Upload business license or registration documents
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Additional Information
                  </label>
                  <textarea
                    rows={3}
                    value={verificationData.additional_info}
                    onChange={(e) => setVerificationData({...verificationData, additional_info: e.target.value})}
                    placeholder="Tell us more about your role at this business..."
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium"
                  >
                    Submit Claim Request
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setClaimStep('search');
                      setSelectedBusiness(null);
                    }}
                    className="px-6 py-3 border rounded-lg hover:bg-muted"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {claimStep === 'success' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-card rounded-lg border p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mb-4">
                <CheckCircle className="h-8 w-8" />
              </div>

              <h2 className="text-2xl font-bold mb-4">Claim Request Submitted!</h2>

              <p className="text-muted-foreground mb-6">
                Your business <strong>{selectedBusiness?.name}</strong> has been successfully claimed!
              </p>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-green-900 mb-2">Your Account Details:</h3>
                <p className="text-sm text-green-800">
                  Email: <strong>{verificationData.owner_email}</strong><br/>
                  Temporary Password: <strong>{typeof window !== 'undefined' ? localStorage.getItem('tempPassword') : ''}</strong>
                </p>
                <p className="text-sm text-green-700 mt-2">
                  Please save this password. You can change it after logging in.
                </p>
              </div>

              <div className="bg-muted rounded-lg p-6 text-left mb-6">
                <h3 className="font-semibold mb-3">What happens next?</h3>
                <ol className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="font-semibold">1.</span>
                    <span>You&apos;ll receive a verification {verificationData.verification_method === 'email' ? 'email' : 'call'} within 24 hours</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold">2.</span>
                    <span>Complete the verification process to confirm ownership</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold">3.</span>
                    <span>Once verified, you&apos;ll get full access to manage your listing</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold">4.</span>
                    <span>Start receiving leads and growing your business!</span>
                  </li>
                </ol>
              </div>

              <div className="flex gap-3 justify-center">
                <Link
                  href="/"
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium"
                >
                  Return to Homepage
                </Link>
                <Link
                  href="/for-business"
                  className="px-6 py-3 border rounded-lg hover:bg-muted font-medium"
                >
                  Learn About Premium
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
