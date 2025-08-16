'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export default function TestStripePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const testCheckout = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/test-stripe-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create checkout session');
        return;
      }

      setResult(data);

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold mb-6">Test Stripe Integration</h1>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <h2 className="font-semibold text-blue-900 mb-2">Test Card Numbers:</h2>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>✅ Success: <code className="bg-white px-2 py-1 rounded">4242 4242 4242 4242</code></li>
              <li>❌ Decline: <code className="bg-white px-2 py-1 rounded">4000 0000 0000 0002</code></li>
              <li>🔐 3D Secure: <code className="bg-white px-2 py-1 rounded">4000 0025 0000 3155</code></li>
              <li>Use any future expiry date (e.g., 12/34) and any 3-digit CVC</li>
            </ul>
          </div>

          <button
            onClick={testCheckout}
            disabled={loading}
            className="w-full py-3 px-6 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 font-semibold text-lg flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Creating Checkout Session...
              </>
            ) : (
              'Test Stripe Checkout ($99/month Professional Plan)'
            )}
          </button>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {result && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">Success!</h3>
              <p className="text-sm text-green-800">Session ID: {result.sessionId}</p>
              <p className="text-sm text-green-800 mt-2">Redirecting to Stripe Checkout...</p>
            </div>
          )}
        </div>

        <div className="mt-8 bg-white rounded-lg shadow p-8">
          <h2 className="text-xl font-semibold mb-4">Complete Subscription Flow Test</h2>

          <ol className="space-y-3">
            <li className="flex">
              <span className="font-semibold mr-2">1.</span>
              <div>
                <Link href="/login" className="text-orange-600 hover:underline">Login</Link> or
                <Link href="/signup" className="text-orange-600 hover:underline ml-1">Sign up</Link> as a business owner
              </div>
            </li>
            <li className="flex">
              <span className="font-semibold mr-2">2.</span>
              <div>
                Go to <Link href="/dealer-portal/subscription" className="text-orange-600 hover:underline">Subscription Management</Link>
              </div>
            </li>
            <li className="flex">
              <span className="font-semibold mr-2">3.</span>
              <div>
                Click "Upgrade" on any paid plan
              </div>
            </li>
            <li className="flex">
              <span className="font-semibold mr-2">4.</span>
              <div>
                Complete checkout with test card
              </div>
            </li>
            <li className="flex">
              <span className="font-semibold mr-2">5.</span>
              <div>
                Verify subscription is active in dealer portal
              </div>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
