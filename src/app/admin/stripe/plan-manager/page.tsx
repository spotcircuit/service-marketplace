'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  Edit,
  DollarSign,
  AlertCircle,
  Save,
  RefreshCw,
  Trash2,
  Archive,
  TrendingUp,
  Users
} from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  stripe_price_id?: string;
  stripe_product_id?: string;
  lead_credits: number;
  features: string[];
  is_active: boolean;
  available_for_new_customers?: boolean;
}

export default function PlanManagerPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [priceChangeData, setPriceChangeData] = useState({
    planId: '',
    planName: '',
    currentPrice: 0,
    newPrice: 0,
    reason: '',
    updateExisting: false
  });

  useEffect(() => {
    checkAuth();
    fetchPlans();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (!response.ok) {
        router.push('/login');
        return;
      }
      const data = await response.json();
      if (data.user.role !== 'admin') {
        router.push('/dashboard');
      }
    } catch (error) {
      router.push('/login');
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/admin/stripe/plans');
      if (response.ok) {
        const data = await response.json();
        setPlans(data.plans);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePriceChange = (plan: Plan) => {
    setPriceChangeData({
      planId: plan.id,
      planName: plan.name,
      currentPrice: parseFloat(plan.price.toString()),
      newPrice: parseFloat(plan.price.toString()),
      reason: '',
      updateExisting: false
    });
    setShowPriceModal(true);
  };

  const submitPriceChange = async () => {
    if (!priceChangeData.newPrice || priceChangeData.newPrice <= 0) {
      alert('Please enter a valid price');
      return;
    }

    if (priceChangeData.newPrice === priceChangeData.currentPrice) {
      alert('New price must be different from current price');
      return;
    }

    try {
      const response = await fetch(`/api/admin/stripe/plans/${priceChangeData.planId}/update-price`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newPrice: priceChangeData.newPrice,
          reason: priceChangeData.reason,
          updateExistingSubscriptions: priceChangeData.updateExisting
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Price updated successfully!
        ${result.archivedOldPrice ? 'Old price archived in Stripe.' : ''}
        ${priceChangeData.updateExisting ? 'Existing subscriptions will be migrated.' : 'Existing subscriptions will continue at old price.'}`);

        setShowPriceModal(false);
        fetchPlans();
      } else {
        const error = await response.json();
        alert(`Failed to update price: ${error.error}`);
      }
    } catch (error) {
      alert('An error occurred while updating price');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/admin/stripe"
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-3xl font-bold">Plan & Pricing Manager</h1>
          </div>
        </div>

        {/* Important Notes */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
            <div className="text-sm">
              <h3 className="font-semibold text-yellow-900 mb-2">Important Pricing Notes:</h3>
              <ul className="space-y-1 text-yellow-800">
                <li>• Stripe does NOT allow editing existing prices - a new price will be created</li>
                <li>• Existing subscriptions continue at their current price unless explicitly migrated</li>
                <li>• Price decreases require manual migration of existing customers</li>
                <li>• Price increases can be scheduled for next billing cycle</li>
                <li>• Always communicate price changes to customers in advance</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-lg shadow-lg p-6 ${!plan.is_active ? 'opacity-60' : ''}`}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold">{plan.name}</h3>
                {plan.stripe_price_id && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                    Synced
                  </span>
                )}
              </div>

              <div className="text-3xl font-bold mb-2">
                ${plan.price}
                <span className="text-sm text-gray-500">/month</span>
              </div>

              <p className="text-sm text-gray-600 mb-4">{plan.description}</p>

              <div className="text-sm text-gray-500 mb-4">
                {plan.lead_credits === -1 ? 'Unlimited' : plan.lead_credits} leads/month
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => handlePriceChange(plan)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition"
                >
                  <DollarSign className="h-4 w-4" />
                  Change Price
                </button>

                <button
                  onClick={() => setEditingPlan(plan)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 transition"
                >
                  <Edit className="h-4 w-4" />
                  Edit Details
                </button>

                {!plan.stripe_price_id && (
                  <button
                    onClick={() => {/* Sync with Stripe */}}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Sync with Stripe
                  </button>
                )}
              </div>

              {/* Status Info */}
              <div className="mt-4 pt-4 border-t text-xs text-gray-500">
                {plan.available_for_new_customers === false && (
                  <p className="text-red-600 mb-1">⚠️ Not available for new customers</p>
                )}
                {plan.stripe_price_id && (
                  <p className="truncate" title={plan.stripe_price_id}>
                    Price ID: {plan.stripe_price_id}
                  </p>
                )}
              </div>
            </div>
          ))}

          {/* Add New Plan Card */}
          <div className="bg-gray-100 rounded-lg p-6 flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-orange-400 transition cursor-pointer">
            <button className="text-center">
              <Plus className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <span className="text-gray-600 font-medium">Add New Plan</span>
            </button>
          </div>
        </div>

        {/* Price Change History */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Price Changes</h2>
          <div className="text-sm text-gray-600">
            <p>Price history will be shown here once you make changes.</p>
          </div>
        </div>
      </div>

      {/* Price Change Modal */}
      {showPriceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <h2 className="text-2xl font-bold mb-4">
              Update Price: {priceChangeData.planName}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Current Price</label>
                <div className="text-2xl font-bold text-gray-600">
                  ${priceChangeData.currentPrice}/month
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">New Price *</label>
                <input
                  type="number"
                  value={priceChangeData.newPrice}
                  onChange={(e) => setPriceChangeData({
                    ...priceChangeData,
                    newPrice: parseFloat(e.target.value)
                  })}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Reason for Change</label>
                <textarea
                  value={priceChangeData.reason}
                  onChange={(e) => setPriceChangeData({
                    ...priceChangeData,
                    reason: e.target.value
                  })}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="e.g., Market adjustment, feature additions, etc."
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={priceChangeData.updateExisting}
                    onChange={(e) => setPriceChangeData({
                      ...priceChangeData,
                      updateExisting: e.target.checked
                    })}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <div className="font-medium text-blue-900">
                      Update existing subscriptions
                    </div>
                    <div className="text-sm text-blue-700 mt-1">
                      {priceChangeData.newPrice > priceChangeData.currentPrice
                        ? 'Price increase will be applied at next billing cycle with customer notification'
                        : 'Price decrease will be applied immediately to all active subscriptions'}
                    </div>
                  </div>
                </label>
              </div>

              {priceChangeData.newPrice > priceChangeData.currentPrice && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Price Increase:</strong> Customers should be notified at least 30 days
                    in advance. Consider grandfathering existing customers at current price.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowPriceModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={submitPriceChange}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                Update Price
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
