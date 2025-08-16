'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  CreditCard,
  DollarSign,
  Package,
  Settings,
  Plus,
  Edit,
  Trash2,
  RefreshCw
} from 'lucide-react';

interface StripeConfig {
  stripe_publishable_key: string;
  stripe_secret_key: string;
  stripe_webhook_secret: string;
  stripe_mode: 'test' | 'live';
  stripe_enabled: boolean;
  trial_days: number;
  auto_charge: boolean;
}

interface SubscriptionPlan {
  id?: string;
  name: string;
  description: string;
  price: number;
  lead_credits: number;
  features: string[];
  stripe_product_id?: string;
  stripe_price_id?: string;
  is_active: boolean;
}

export default function StripeAdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  const [showSecretKey, setShowSecretKey] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);

  const [config, setConfig] = useState<StripeConfig>({
    stripe_publishable_key: '',
    stripe_secret_key: '',
    stripe_webhook_secret: '',
    stripe_mode: 'test',
    stripe_enabled: false,
    trial_days: 14,
    auto_charge: true
  });

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [showPlanModal, setShowPlanModal] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchConfig();
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

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/admin/stripe/config');
      if (response.ok) {
        const data = await response.json();
        setConfig(data.config);
      }
    } catch (error) {
      console.error('Error fetching config:', error);
    } finally {
      setLoading(false);
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
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/stripe/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      if (response.ok) {
        setMessage('Stripe configuration saved successfully!');
        setMessageType('success');
      } else {
        const data = await response.json();
        setMessage(data.error || 'Failed to save configuration');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('An error occurred while saving');
      setMessageType('error');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const savePlan = async () => {
    if (!editingPlan) return;

    try {
      const response = await fetch('/api/admin/stripe/plans', {
        method: editingPlan.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPlan)
      });

      if (response.ok) {
        await fetchPlans();
        setShowPlanModal(false);
        setEditingPlan(null);
        setMessage('Plan saved successfully!');
        setMessageType('success');
      } else {
        const data = await response.json();
        setMessage(data.error || 'Failed to save plan');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('An error occurred while saving plan');
      setMessageType('error');
    }
  };

  const syncPlanWithStripe = async (planId: string) => {
    try {
      const response = await fetch(`/api/admin/stripe/plans/${planId}/sync`, {
        method: 'POST'
      });

      if (response.ok) {
        await fetchPlans();
        setMessage('Plan synced with Stripe successfully!');
        setMessageType('success');
      } else {
        const data = await response.json();
        setMessage(data.error || 'Failed to sync with Stripe');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('An error occurred while syncing');
      setMessageType('error');
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
              href="/admin"
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-3xl font-bold">Stripe Configuration</h1>
          </div>

          {message && (
            <div className={`p-4 rounded-lg flex items-center gap-2 ${
              messageType === 'success'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {messageType === 'success' ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              {message}
            </div>
          )}
        </div>

        {/* Stripe Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="h-8 w-8 text-purple-600" />
              <div>
                <h2 className="text-xl font-semibold">Stripe Status</h2>
                <p className="text-sm text-gray-600">
                  Mode: <span className="font-medium">{config.stripe_mode}</span>
                </p>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-full font-medium ${
              config.stripe_enabled
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {config.stripe_enabled ? 'Enabled' : 'Disabled'}
            </div>
          </div>
        </div>

        {/* Configuration Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Settings className="h-5 w-5" />
            API Configuration
          </h2>

          <div className="space-y-6">
            {/* Mode Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Environment Mode</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="test"
                    checked={config.stripe_mode === 'test'}
                    onChange={(e) => setConfig({ ...config, stripe_mode: 'test' })}
                  />
                  <span>Test Mode</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="live"
                    checked={config.stripe_mode === 'live'}
                    onChange={(e) => setConfig({ ...config, stripe_mode: 'live' })}
                  />
                  <span className="text-red-600 font-medium">Live Mode</span>
                </label>
              </div>
              {config.stripe_mode === 'live' && (
                <p className="text-red-600 text-sm mt-2">
                  ⚠️ Live mode will process real payments. Make sure you&apos;re using live keys.
                </p>
              )}
            </div>

            {/* Publishable Key */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Publishable Key
                <span className="text-gray-500 ml-2">(starts with pk_)</span>
              </label>
              <input
                type="text"
                value={config.stripe_publishable_key}
                onChange={(e) => setConfig({ ...config, stripe_publishable_key: e.target.value })}
                placeholder="pk_test_..."
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Secret Key */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Secret Key
                <span className="text-gray-500 ml-2">(starts with sk_)</span>
              </label>
              <div className="relative">
                <input
                  type={showSecretKey ? 'text' : 'password'}
                  value={config.stripe_secret_key}
                  onChange={(e) => setConfig({ ...config, stripe_secret_key: e.target.value })}
                  placeholder="sk_test_..."
                  className="w-full px-4 py-2 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={() => setShowSecretKey(!showSecretKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showSecretKey ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="text-yellow-600 text-sm mt-1">
                ⚠️ Keep this key secure. Never expose it in client-side code.
              </p>
            </div>

            {/* Webhook Secret */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Webhook Endpoint Secret
                <span className="text-gray-500 ml-2">(starts with whsec_)</span>
              </label>
              <div className="relative">
                <input
                  type={showWebhookSecret ? 'text' : 'password'}
                  value={config.stripe_webhook_secret}
                  onChange={(e) => setConfig({ ...config, stripe_webhook_secret: e.target.value })}
                  placeholder="whsec_..."
                  className="w-full px-4 py-2 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showWebhookSecret ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="text-gray-600 text-sm mt-1">
                Add webhook endpoint in Stripe: <code className="bg-gray-100 px-2 py-1 rounded">
                  {typeof window !== 'undefined' ? window.location.origin : ''}/api/stripe/webhook
                </code>
              </p>
            </div>

            {/* Additional Settings */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Trial Period (days)</label>
                <input
                  type="number"
                  value={config.trial_days}
                  onChange={(e) => setConfig({ ...config, trial_days: parseInt(e.target.value) })}
                  min="0"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.stripe_enabled}
                    onChange={(e) => setConfig({ ...config, stripe_enabled: e.target.checked })}
                    className="h-4 w-4 text-purple-600"
                  />
                  <span className="font-medium">Enable Stripe Payments</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.auto_charge}
                    onChange={(e) => setConfig({ ...config, auto_charge: e.target.checked })}
                    className="h-4 w-4 text-purple-600"
                  />
                  <span className="font-medium">Auto-charge for leads</span>
                </label>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={saveConfig}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>
          </div>
        </div>

        {/* Subscription Plans */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Package className="h-5 w-5" />
              Subscription Plans
            </h2>
            <button
              onClick={() => {
                setEditingPlan({
                  name: '',
                  description: '',
                  price: 0,
                  lead_credits: 0,
                  features: [],
                  is_active: true
                });
                setShowPlanModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Plus className="h-4 w-4" />
              Add Plan
            </button>
          </div>

          <div className="space-y-4">
            {plans.map((plan) => (
              <div key={plan.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{plan.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        plan.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {plan.is_active ? 'Active' : 'Inactive'}
                      </span>
                      {plan.stripe_product_id && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                          Synced with Stripe
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-2">{plan.description}</p>
                    <div className="flex items-center gap-6 text-sm">
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        ${plan.price}/month
                      </span>
                      <span>
                        {plan.lead_credits === -1 ? 'Unlimited' : plan.lead_credits} leads
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!plan.stripe_product_id && (
                      <button
                        onClick={() => syncPlanWithStripe(plan.id!)}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                        title="Sync with Stripe"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setEditingPlan(plan);
                        setShowPlanModal(true);
                      }}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Plan Modal */}
      {showPlanModal && editingPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold mb-6">
              {editingPlan.id ? 'Edit Plan' : 'Create Plan'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Plan Name</label>
                <input
                  type="text"
                  value={editingPlan.name}
                  onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={editingPlan.description}
                  onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Price (USD)</label>
                  <input
                    type="number"
                    value={editingPlan.price}
                    onChange={(e) => setEditingPlan({ ...editingPlan, price: parseFloat(e.target.value) })}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Lead Credits</label>
                  <input
                    type="number"
                    value={editingPlan.lead_credits}
                    onChange={(e) => setEditingPlan({ ...editingPlan, lead_credits: parseInt(e.target.value) })}
                    min="-1"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                  <p className="text-xs text-gray-500 mt-1">Use -1 for unlimited</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Features (one per line)</label>
                <textarea
                  value={editingPlan.features.join('\n')}
                  onChange={(e) => setEditingPlan({
                    ...editingPlan,
                    features: e.target.value.split('\n').filter(f => f.trim())
                  })}
                  rows={5}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editingPlan.is_active}
                  onChange={(e) => setEditingPlan({ ...editingPlan, is_active: e.target.checked })}
                  className="h-4 w-4"
                />
                <span>Active</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowPlanModal(false);
                  setEditingPlan(null);
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={savePlan}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Save Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
