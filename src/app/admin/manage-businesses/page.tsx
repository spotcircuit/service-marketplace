'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  Coins,
  Star,
  Calendar,
  Plus,
  Minus,
  Save,
  CheckCircle,
  XCircle,
  Search,
  Filter
} from 'lucide-react';

interface Business {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  is_featured: boolean;
  featured_until?: string;
  is_verified: boolean;
  created_at: string;
  owner_name?: string;
  owner_email?: string;
}

interface BusinessSubscription {
  business_id: string;
  plan: string;
  status: string;
  lead_credits: number;
  leads_received: number;
  featured_listing: boolean;
}

export default function ManageBusinessesPage() {
  const router = useRouter();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [subscriptions, setSubscriptions] = useState<Record<string, BusinessSubscription>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFeatured, setFilterFeatured] = useState<'all' | 'featured' | 'not_featured'>('all');
  const [editingBusiness, setEditingBusiness] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchBusinesses();
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
        return;
      }
    } catch (error) {
      router.push('/login');
    }
  };

  const fetchBusinesses = async () => {
    try {
      const response = await fetch('/api/admin/businesses');
      if (response.ok) {
        const data = await response.json();
        setBusinesses(data.businesses || []);
        
        // Fetch subscriptions for each business
        const subMap: Record<string, BusinessSubscription> = {};
        for (const business of data.businesses) {
          const subResponse = await fetch(`/api/admin/businesses/${business.id}/subscription`);
          if (subResponse.ok) {
            const subData = await subResponse.json();
            if (subData.subscription) {
              subMap[business.id] = subData.subscription;
            }
          }
        }
        setSubscriptions(subMap);
      }
    } catch (error) {
      console.error('Error fetching businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (business: Business) => {
    setEditingBusiness(business.id);
    setEditData({
      is_featured: business.is_featured,
      featured_until: business.featured_until ? new Date(business.featured_until).toISOString().split('T')[0] : '',
      is_verified: business.is_verified,
      lead_credits: subscriptions[business.id]?.lead_credits || 0
    });
  };

  const handleSave = async (businessId: string) => {
    setSaving(true);
    try {
      // Update business featured status
      const businessResponse = await fetch(`/api/admin/businesses/${businessId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_featured: editData.is_featured,
          featured_until: editData.featured_until || null,
          is_verified: editData.is_verified
        })
      });

      // Update subscription credits
      if (subscriptions[businessId]) {
        const creditsResponse = await fetch(`/api/admin/businesses/${businessId}/credits`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lead_credits: parseInt(editData.lead_credits)
          })
        });
      }

      // Refresh data
      await fetchBusinesses();
      setEditingBusiness(null);
    } catch (error) {
      console.error('Error saving:', error);
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const adjustCredits = (amount: number) => {
    setEditData({
      ...editData,
      lead_credits: Math.max(0, parseInt(editData.lead_credits || 0) + amount)
    });
  };

  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch = business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         business.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         business.city?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterFeatured === 'all' ||
                         (filterFeatured === 'featured' && business.is_featured) ||
                         (filterFeatured === 'not_featured' && !business.is_featured);
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <Link
                href="/admin"
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Manage Businesses</h1>
                <p className="text-sm text-gray-600">Control credits, featured status, and verification</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <select
              value={filterFeatured}
              onChange={(e) => setFilterFeatured(e.target.value as any)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Businesses</option>
              <option value="featured">Featured Only</option>
              <option value="not_featured">Not Featured</option>
            </select>
          </div>
        </div>

        {/* Business List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Business
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Credits
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Featured Until
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBusinesses.map((business) => {
                const subscription = subscriptions[business.id];
                const isEditing = editingBusiness === business.id;
                
                return (
                  <tr key={business.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{business.name}</div>
                        <div className="text-sm text-gray-500">{business.email}</div>
                        {business.owner_email && (
                          <div className="text-xs text-gray-400">Owner: {business.owner_email}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{business.city}, {business.state}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isEditing ? (
                        <div className="space-y-2">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={editData.is_featured}
                              onChange={(e) => setEditData({...editData, is_featured: e.target.checked})}
                            />
                            <span className="text-sm">Featured</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={editData.is_verified}
                              onChange={(e) => setEditData({...editData, is_verified: e.target.checked})}
                            />
                            <span className="text-sm">Verified</span>
                          </label>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          {business.is_featured && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <Star className="h-3 w-3 mr-1" />
                              Featured
                            </span>
                          )}
                          {business.is_verified && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => adjustCredits(-10)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <input
                            type="number"
                            value={editData.lead_credits}
                            onChange={(e) => setEditData({...editData, lead_credits: e.target.value})}
                            className="w-20 px-2 py-1 border rounded text-center"
                          />
                          <button
                            onClick={() => adjustCredits(10)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <Coins className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium">{subscription?.lead_credits || 0}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isEditing ? (
                        <input
                          type="date"
                          value={editData.featured_until}
                          onChange={(e) => setEditData({...editData, featured_until: e.target.value})}
                          className="px-2 py-1 border rounded"
                        />
                      ) : (
                        <div className="text-sm text-gray-900">
                          {business.featured_until 
                            ? new Date(business.featured_until).toLocaleDateString()
                            : '-'}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {isEditing ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSave(business.id)}
                            disabled={saving}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50"
                          >
                            <Save className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => setEditingBusiness(null)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <XCircle className="h-5 w-5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEdit(business)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}