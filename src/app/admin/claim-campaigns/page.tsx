'use client';

import { useState, useEffect, useCallback } from 'react';
import { Download, Mail, RefreshCw, Check, X, Copy, ExternalLink, Filter, Search, ArrowLeft, Home, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Business {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  category: string;
  website: string;
  rating: number;
  reviews: number;
  claim_token?: string;
  email_sent_at?: string;
  email_opened_at?: string;
  link_clicked_at?: string;
  expires_at?: string;
}

export default function ClaimCampaignsPage() {
  const router = useRouter();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusinesses, setSelectedBusinesses] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [includeEmailed, setIncludeEmailed] = useState(false);
  const [includeClaimed, setIncludeClaimed] = useState(false);
  const [emailFilter, setEmailFilter] = useState<'all' | 'with-email' | 'without-email'>('with-email');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterState, setFilterState] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [generating, setGenerating] = useState(false);
  const [exportingCsv, setExportingCsv] = useState(false);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState({ totalUnclaimed: 0, withTokens: 0, emailsSent: 0 });
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const checkAuth = useCallback(async () => {
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
      setUser(data.user);
      return true;
    } catch (error) {
      router.push('/login');
      return false;
    } finally {
      setAuthLoading(false);
    }
  }, [router]);

  

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/claim-campaigns/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  const fetchBusinesses = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('includeEmailed', includeEmailed.toString());
      params.append('includeClaimed', includeClaimed.toString());
      params.append('emailFilter', emailFilter);
      if (filterState) params.append('state', filterState);
      if (filterCity) params.append('city', filterCity);
      
      const response = await fetch(`/api/admin/claim-campaigns?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch businesses');
      }

      const data = await response.json();
      setBusinesses(data.businesses);
      setTotal(data.total);
    } catch (error) {
      console.error('Error fetching businesses:', error);
    } finally {
      setLoading(false);
    }
  }, [includeEmailed, includeClaimed, emailFilter, filterState, filterCity]);

  // Initialize after callbacks are defined
  useEffect(() => {
    const init = async () => {
      const isAuthed = await checkAuth();
      if (isAuthed) {
        fetchBusinesses();
        fetchStats();
      }
    };
    init();
  }, [checkAuth, fetchBusinesses, fetchStats]);

  const handleSelectAll = () => {
    if (selectedBusinesses.size === filteredBusinesses.length) {
      setSelectedBusinesses(new Set());
    } else {
      setSelectedBusinesses(new Set(filteredBusinesses.map(b => b.id)));
    }
  };

  const handleSelectBusiness = (id: string) => {
    const newSelected = new Set(selectedBusinesses);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedBusinesses(newSelected);
  };

  const generateTokens = async () => {
    if (selectedBusinesses.size === 0) {
      alert('Please select at least one business');
      return;
    }

    if (!confirm(`Generate claim tokens for ${selectedBusinesses.size} businesses?`)) {
      return;
    }

    try {
      setGenerating(true);
      const response = await fetch('/api/admin/claim-campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessIds: Array.from(selectedBusinesses),
          campaignName: `Admin Campaign ${new Date().toISOString().split('T')[0]}`,
          expiresInDays: 30
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate tokens');
      }

      const data = await response.json();
      alert(`Successfully generated ${data.summary.successful} tokens. ${data.summary.failed} failed.`);
      
      // Refresh the list
      await fetchBusinesses();
      setSelectedBusinesses(new Set());
    } catch (error) {
      console.error('Error generating tokens:', error);
      alert('Failed to generate tokens');
    } finally {
      setGenerating(false);
    }
  };

  const exportToCsv = async () => {
    try {
      setExportingCsv(true);
      const params = new URLSearchParams();
      params.append('includeEmailed', includeEmailed.toString());
      params.append('includeClaimed', includeClaimed.toString());
      params.append('emailFilter', emailFilter);
      if (filterState) params.append('state', filterState);
      if (filterCity) params.append('city', filterCity);
      if (filterCategory) params.append('category', filterCategory);
      // Only export selected businesses if any are selected
      if (selectedBusinesses.size > 0) {
        params.append('businessIds', Array.from(selectedBusinesses).join(','));
      }
      
      const response = await fetch(`/api/admin/claim-campaigns/export?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to export CSV');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      const dateStr = new Date().toISOString().split('T')[0];
      const locationStr = filterCity ? `-${filterCity}` : filterState ? `-${filterState}` : '';
      a.download = `unclaimed-businesses${locationStr}-${dateStr}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export CSV');
    } finally {
      setExportingCsv(false);
    }
  };

  const copyClaimUrl = (token: string) => {
    const url = `${window.location.origin}/claim/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch = !searchQuery || 
      business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      business.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      business.city.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !filterCategory || 
      business.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(businesses.map(b => b.category))].sort();
  const states = [...new Set(businesses.map(b => b.state))].sort();
  const cities = [...new Set(businesses.filter(b => !filterState || b.state === filterState).map(b => b.city))].sort();

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
                Back to Admin
              </button>
              <div className="text-gray-300">|</div>
              <h1 className="text-xl font-semibold">Claim Campaign Manager</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                <Home className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                href="/admin/leads"
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Leads
              </Link>
              <Link
                href="/directory"
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Directory
              </Link>
              <Link
                href="/admin"
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Total Unclaimed</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalUnclaimed}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">With Tokens</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.withTokens}
              </p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Emails Sent</p>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.emailsSent}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search businesses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={filterState}
              onChange={(e) => {
                setFilterState(e.target.value);
                setFilterCity(''); // Reset city when state changes
              }}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All States</option>
              {states.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>

            <select
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={!filterState && cities.length > 50}
            >
              <option value="">All Cities</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>

            <select
              value={emailFilter}
              onChange={(e) => setEmailFilter(e.target.value as 'all' | 'with-email' | 'without-email')}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Businesses</option>
              <option value="with-email">With Email</option>
              <option value="without-email">Without Email</option>
            </select>

            <label className="flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={includeClaimed}
                onChange={(e) => setIncludeClaimed(e.target.checked)}
                className="rounded"
              />
              <span>Include Claimed</span>
            </label>

            <label className="flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={includeEmailed}
                onChange={(e) => setIncludeEmailed(e.target.checked)}
                className="rounded"
              />
              <span>Include Already Emailed</span>
            </label>

            <button
              onClick={() => {
                fetchBusinesses();
                fetchStats();
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-4 mb-6">

            <button
              onClick={exportToCsv}
              disabled={exportingCsv}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {exportingCsv ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Export {selectedBusinesses.size > 0 ? `Selected (${selectedBusinesses.size})` : filteredBusinesses.length > 0 ? `Filtered (${filteredBusinesses.length})` : 'All'} to CSV
                </>
              )}
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-y">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedBusinesses.size === filteredBusinesses.length && filteredBusinesses.length > 0}
                      onChange={handleSelectAll}
                      className="rounded"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Business</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Contact</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Location</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Stats</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Campaign Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredBusinesses.map((business) => (
                  <tr key={business.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedBusinesses.has(business.id)}
                        onChange={() => handleSelectBusiness(business.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{business.name}</p>
                        <p className="text-sm text-gray-500">{business.category}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <p>{business.email}</p>
                        <p className="text-gray-500">{business.phone}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <p>{business.city}, {business.state}</p>
                        <p className="text-gray-500">{business.zipcode}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <p>⭐ {business.rating}</p>
                        <p className="text-gray-500">{business.reviews} reviews</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1 text-xs">
                        {business.claim_token ? (
                          <>
                            <span className="flex items-center gap-1">
                              <Check className="h-3 w-3 text-green-600" />
                              Token Generated
                            </span>
                            {business.email_sent_at && (
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3 text-blue-600" />
                                Email Sent
                              </span>
                            )}
                            {business.link_clicked_at && (
                              <span className="flex items-center gap-1">
                                <ExternalLink className="h-3 w-3 text-purple-600" />
                                Link Clicked
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-gray-400">No token</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {business.claim_token && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => copyClaimUrl(business.claim_token!)}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="Copy claim URL"
                          >
                            {copiedToken === business.claim_token ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4 text-gray-600" />
                            )}
                          </button>
                          <a
                            href={`/claim/${business.claim_token}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 hover:bg-gray-100 rounded"
                            title="Preview claim page"
                          >
                            <ExternalLink className="h-4 w-4 text-gray-600" />
                          </a>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredBusinesses.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No businesses found matching your criteria
            </div>
          )}
        </div>
      </div>
    </div>
  );
}