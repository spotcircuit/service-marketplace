'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, User, Mail, Phone, Clock, ArrowRight, Shield, Truck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function QuoteSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-gray-600 mt-4">Loading...</p>
          </div>
        </div>
      }
    >
      <QuoteSuccessContent />
    </Suspense>
  );
}

function QuoteSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const [accountData, setAccountData] = useState<any>(null);
  const [showAccountCreation, setShowAccountCreation] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [redirectTimer, setRedirectTimer] = useState(5);
  
  const quoteId = searchParams.get('id');
  const email = searchParams.get('email');

  useEffect(() => {
    // Get stored account data from sessionStorage
    const stored = sessionStorage.getItem('pendingAccount');
    if (stored) {
      setAccountData(JSON.parse(stored));
    }
  }, []);

  // If user is logged in, redirect to dashboard after showing success
  useEffect(() => {
    if (!loading && user) {
      const timer = setInterval(() => {
        setRedirectTimer((prev) => {
          if (prev <= 1) {
            // Use setTimeout to avoid state update during render
            setTimeout(() => {
              router.push('/dashboard');
            }, 0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [user, loading, router]);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }

    setIsCreatingAccount(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: accountData?.email || email,
          password,
          phone: accountData?.phone,
          role: 'customer',
          quoteId: accountData?.quoteId || quoteId,
        }),
      });

      if (response.ok) {
        // Clear stored data
        sessionStorage.removeItem('pendingAccount');
        
        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create account');
      }
    } catch (error) {
      console.error('Error creating account:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsCreatingAccount(false);
    }
  };

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-gray-600 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Header */}
      <div className="bg-green-500 text-white py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <CheckCircle className="h-16 w-16 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Quote Request Submitted!</h1>
          <p className="text-xl">We'll contact you within the next 30 minutes with pricing.</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {/* What Happens Next */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">What Happens Next?</h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">1</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold">Provider Review</h3>
                  <p className="text-sm text-gray-600">Local providers are reviewing your request right now</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">2</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold">Receive Quotes</h3>
                  <p className="text-sm text-gray-600">You'll receive 2-4 competitive quotes via email and text</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">3</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold">Choose & Book</h3>
                  <p className="text-sm text-gray-600">Compare prices and choose the best provider for your needs</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">4</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold">Delivery</h3>
                  <p className="text-sm text-gray-600">Your dumpster will be delivered on your scheduled date</p>
                </div>
              </div>
            </div>

            {/* Expected Timeline */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700">
                <Clock className="h-5 w-5" />
                <span className="font-semibold">Expected Response Time</span>
              </div>
              <p className="text-sm text-blue-600 mt-1">Most customers receive quotes within 30 minutes during business hours</p>
            </div>
          </div>

          {/* Create Account Section or Dashboard Link */}
          <div className="bg-white rounded-lg shadow p-6">
            {user ? (
              // User is logged in - show dashboard link
              <>
                <h2 className="text-xl font-bold mb-4">Your Quote is Saved</h2>
                <p className="text-gray-600 mb-6">
                  We've saved this quote to your account. You can track all responses in your dashboard.
                </p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800">
                    Redirecting to your dashboard in {redirectTimer} seconds...
                  </p>
                </div>
                
                <Link 
                  href="/dashboard"
                  className="w-full px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition flex items-center justify-center gap-2"
                >
                  Go to Dashboard
                  <ArrowRight className="h-5 w-5" />
                </Link>
                
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-2">What's Next?</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Track quote responses in real-time</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Compare prices from multiple providers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Message providers directly</span>
                    </li>
                  </ul>
                </div>
              </>
            ) : !showAccountCreation ? (
              <>
                <h2 className="text-xl font-bold mb-4">Track Your Quote</h2>
                <p className="text-gray-600 mb-6">Create a free account to:</p>
                
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <span className="text-sm">Track all your quotes in one place</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <span className="text-sm">Message providers directly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <span className="text-sm">Save your preferences for future orders</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <span className="text-sm">Get exclusive member discounts</span>
                  </li>
                </ul>

                <button
                  onClick={() => setShowAccountCreation(true)}
                  className="w-full px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition flex items-center justify-center gap-2"
                >
                  <User className="h-5 w-5" />
                  Create Free Account
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  No credit card required • Takes 30 seconds
                </p>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold mb-4">Create Your Account</h2>
                
                <form onSubmit={handleCreateAccount} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <span className="text-sm">{accountData?.email || email}</span>
                    </div>
                  </div>

                  {accountData?.phone && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Phone</label>
                      <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                        <Phone className="h-5 w-5 text-gray-400" />
                        <span className="text-sm">{accountData.phone}</span>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-1">Create Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                      minLength={8}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Confirm Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                      minLength={8}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isCreatingAccount}
                    className="w-full px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition disabled:opacity-50"
                  >
                    {isCreatingAccount ? 'Creating Account...' : 'Create Account & Continue'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowAccountCreation(false)}
                    className="w-full px-6 py-2 text-gray-600 hover:text-gray-800 text-sm"
                  >
                    Maybe later
                  </button>
                </form>

                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-gray-400 mt-0.5" />
                    <p className="text-xs text-gray-600">
                      Your information is secure and will never be shared with third parties.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Important Information</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Quote Reference</h3>
              <p className="text-sm text-gray-600">Your quote ID: <span className="font-mono">{quoteId?.slice(0, 8)}</span></p>
              <p className="text-xs text-gray-500 mt-1">Keep this for your records</p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Need Help?</h3>
              <p className="text-sm text-gray-600">Call us at <a href="tel:+14342076559" className="text-primary font-semibold">(434) 207-6559</a></p>
              <p className="text-xs text-gray-500 mt-1">Mon-Fri 8am-6pm EST</p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Service Guarantee</h3>
              <div className="flex items-start gap-2">
                <Truck className="h-4 w-4 text-primary mt-0.5" />
                <p className="text-sm text-gray-600">All providers are licensed, insured, and verified</p>
              </div>
            </div>
          </div>
        </div>

        {/* Return Home */}
        <div className="mt-8 text-center">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            Return to Homepage
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}