'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  TrendingUp,
  Users,
  DollarSign,
  Star,
  Building2,
  Megaphone,
  CreditCard,
  Edit,
  ChevronRight,
  Eye,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Sparkles
} from 'lucide-react';

interface DashboardStats {
  total_leads: number;
  new_leads: number;
  conversion_rate: number;
  revenue_this_month: number;
  active_subscription: boolean;
  is_featured: boolean;
  listing_views: number;
  response_rate: number;
}

interface BusinessInfo {
  id: string;
  name: string;
  category: string;
  is_featured: boolean;
  is_verified: boolean;
  rating: number;
  reviews: number;
  featured_until?: string;
}

export default function DealerDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    total_leads: 0,
    new_leads: 0,
    conversion_rate: 0,
    revenue_this_month: 0,
    active_subscription: false,
    is_featured: false,
    listing_views: 0,
    response_rate: 0
  });
  const [business, setBusiness] = useState<BusinessInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const statsResponse = await fetch('/api/dealer-portal/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Fetch business info
      const businessResponse = await fetch('/api/dealer-portal/business-profile');
      if (businessResponse.ok) {
        const businessData = await businessResponse.json();
        setBusiness(businessData.business);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back to your Dealer Portal
            </h1>
            <p className="text-gray-600 mt-1">
              {business?.name || 'Your Business'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {business?.is_verified && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                <CheckCircle className="h-4 w-4" />
                Verified
              </span>
            )}
            {business?.is_featured && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                <Star className="h-4 w-4" />
                Featured
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/dealer-portal/profile"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow group"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Edit Business Profile</h3>
              </div>
              <p className="text-sm text-gray-600">
                Update your business information, hours, and services
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
          </div>
        </Link>

        <Link
          href="/dealer-portal/advertise"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow group"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Megaphone className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Advertise & Feature</h3>
              </div>
              <p className="text-sm text-gray-600">
                Boost visibility with featured listings and ads
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
          </div>
        </Link>

        <Link
          href="/dealer-portal/settings"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow group"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Edit className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Account Settings</h3>
              </div>
              <p className="text-sm text-gray-600">
                Manage your login credentials and preferences
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
          </div>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <Users className="h-8 w-8 text-blue-500" />
            <span className="text-2xl font-bold text-gray-900">{stats.total_leads}</span>
          </div>
          <p className="text-sm text-gray-600">Total Leads</p>
          {stats.new_leads > 0 && (
            <p className="text-xs text-green-600 mt-1">+{stats.new_leads} new</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <Eye className="h-8 w-8 text-purple-500" />
            <span className="text-2xl font-bold text-gray-900">{stats.listing_views}</span>
          </div>
          <p className="text-sm text-gray-600">Listing Views</p>
          <p className="text-xs text-gray-500 mt-1">This month</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="h-8 w-8 text-green-500" />
            <span className="text-2xl font-bold text-gray-900">{stats.response_rate}%</span>
          </div>
          <p className="text-sm text-gray-600">Response Rate</p>
          <p className="text-xs text-gray-500 mt-1">Keep it above 80%</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <Star className="h-8 w-8 text-yellow-500" />
            <span className="text-2xl font-bold text-gray-900">
              {business?.rating || 0}
            </span>
          </div>
          <p className="text-sm text-gray-600">Rating</p>
          <p className="text-xs text-gray-500 mt-1">{business?.reviews || 0} reviews</p>
        </div>
      </div>

      {/* Featured Listing Promotion */}
      {!business?.is_featured && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg shadow p-6 border border-yellow-200">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Sparkles className="h-8 w-8 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Boost Your Business with Featured Listing
                </h3>
                <ul className="text-sm text-gray-700 space-y-1 mb-4">
                  <li>• Get 5x more visibility in search results</li>
                  <li>• Priority placement in your category</li>
                  <li>• Featured badge on your listing</li>
                  <li>• Detailed analytics and insights</li>
                </ul>
                <Link
                  href="/dealer-portal/advertise"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  <Megaphone className="h-4 w-4" />
                  Get Featured Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Leads</h3>
              <Link
                href="/dealer-portal/leads"
                className="text-sm text-primary hover:text-primary/80"
              >
                View all
              </Link>
            </div>
          </div>
          <div className="p-6">
            {stats.new_leads > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">New lead received</p>
                    <p className="text-sm text-gray-600">Dumpster Rental - Houston, TX</p>
                  </div>
                  <span className="text-xs text-blue-600">2 hours ago</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No new leads</p>
            )}
          </div>
        </div>

        {/* Performance Tips */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Performance Tips</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Complete your profile</p>
                  <p className="text-sm text-gray-600">
                    Add photos and detailed descriptions to increase conversions
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Great response time!</p>
                  <p className="text-sm text-gray-600">
                    Keep responding quickly to maintain your ranking
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}