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
  Sparkles,
  Coins,
  Calendar,
  ArrowRight
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
  lead_credits?: number;
  recent_leads?: RecentLead[];
}

interface RecentLead {
  id: string;
  status: string;
  created_at: string;
  viewed_at?: string;
  service_type: string;
  city?: string;
  state?: string;
  zipcode: string;
  timeline: string;
  project_description: string;
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

const getTimeAgo = (date: string) => {
  const now = new Date();
  const past = new Date(date);
  const diff = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

export default function DealerDashboard() {
  const router = useRouter();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState('');
  const [stats, setStats] = useState<DashboardStats>({
    total_leads: 0,
    new_leads: 0,
    conversion_rate: 0,
    revenue_this_month: 0,
    active_subscription: false,
    is_featured: false,
    listing_views: 0,
    response_rate: 0,
    lead_credits: 10
  });
  const [business, setBusiness] = useState<BusinessInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [buyingCredits, setBuyingCredits] = useState(false);

  useEffect(() => {
    // Check for payment success in URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('payment') === 'success') {
      setShowSuccessMessage(true);
      setPaymentMessage('Payment successful! Your purchase is being processed.');
      // Clean URL
      window.history.replaceState({}, '', '/dealer-portal/dashboard');
      // Refresh data to show new credits/featured status
      setTimeout(() => {
        fetchDashboardData();
      }, 2000);
    }
    
    fetchDashboardData();
  }, []);

  const handleBuyCredits = async (credits: number, priceInCents: number) => {
    setBuyingCredits(true);
    try {
      // Use existing checkout endpoint with metadata for credits
      const response = await fetch('/api/dealer-portal/subscription/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Important for cookies
        body: JSON.stringify({
          mode: 'payment', // One-time payment instead of subscription
          lineItems: [{
            price_data: {
              currency: 'usd',
              product_data: {
                name: `${credits} Lead Credits`,
                description: `${credits} credits to view customer contact information`
              },
              unit_amount: priceInCents
            },
            quantity: 1
          }],
          metadata: {
            type: 'credits',
            credits: credits.toString()
          }
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Checkout error full details:', {
          status: response.status,
          data: data,
          error: data.error,
          details: data.details
        });
        
        if (response.status === 401) {
          alert('Please log in to purchase credits');
          router.push('/login?type=business');
        } else {
          // Show detailed error in development
          const errorMessage = data.details 
            ? `Error: ${data.error}\n\nDetails: ${JSON.stringify(data.details, null, 2)}`
            : data.error || 'Failed to start checkout. Please make sure Stripe is configured.';
          
          alert(errorMessage);
        }
        return;
      }
      
      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Payment system not configured. Please contact support.');
      }
    } catch (error) {
      console.error('Error buying credits:', error);
      alert('Failed to process payment. Please check your connection and try again.');
    } finally {
      setBuyingCredits(false);
    }
  };

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
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-primary" />
            <div>
              <p className="font-semibold text-accent">{paymentMessage}</p>
              <p className="text-sm text-accent/80">Your account has been updated.</p>
            </div>
          </div>
          <button 
            onClick={() => setShowSuccessMessage(false)}
            className="text-accent hover:text-accent/90"
          >
            ✕
          </button>
        </div>
      )}
      
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back to your Dealer Portal
            </h1>
            <p className="text-gray-600 mt-1">
              {business?.name || 'Your Business'}
              {stats.new_leads > 0 && (
                <span className="ml-3 inline-flex items-center gap-1 px-2 py-1 bg-destructive/10 text-destructive rounded-full text-sm font-semibold">
                  <span className="animate-pulse">●</span>
                  {stats.new_leads} new {stats.new_leads === 1 ? 'lead' : 'leads'} waiting
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {business?.is_verified && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-accent/10 text-accent rounded-full text-sm">
                <CheckCircle className="h-4 w-4" />
                Verified
              </span>
            )}
            {business?.is_featured && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
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
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <Building2 className="h-6 w-6 text-primary" />
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
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Megaphone className="h-6 w-6 text-primary" />
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
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <Edit className="h-6 w-6 text-primary" />
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

      {/* Featured Status Card - Show if Featured */}
      {business?.is_featured && (
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Star className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Featured Listing Active</h3>
                <p className="text-sm text-gray-600">Your business is currently featured with priority placement</p>
                {business.featured_until && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <p className="text-sm text-primary font-medium">
                        Featured until: {new Date(business.featured_until).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="mt-1">
                      <p className="text-lg font-bold text-primary">
                        {(() => {
                          const daysLeft = Math.ceil((new Date(business.featured_until).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                          if (daysLeft <= 0) return 'Expiring today';
                          if (daysLeft === 1) return '1 day remaining';
                          return `${daysLeft} days remaining`;
                        })()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-1">Your Package</p>
              <p className="text-lg font-bold text-gray-900 mb-2">Premium Spotlight</p>
              <Link
                href="/dealer-portal/advertise"
                className="text-sm text-secondary hover:text-secondary/90 underline"
              >
                Extend or Upgrade
              </Link>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-primary/20">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">3x</p>
                <p className="text-xs text-gray-600">More Visibility</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">#1</p>
                <p className="text-xs text-gray-600">Search Position</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">20mi</p>
                <p className="text-xs text-gray-600">Coverage Area</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link href="/dealer-portal/leads" className="block">
          <div className="bg-white rounded-lg shadow p-6 relative hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-gray-900">{stats.total_leads}</span>
            </div>
            <p className="text-sm text-gray-600">Total Leads</p>
            {stats.new_leads > 0 && (
              <p className="text-xs text-accent mt-1">+{stats.new_leads} new</p>
            )}
            <div className="absolute bottom-2 right-2">
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </Link>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <Eye className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-gray-900">{stats.listing_views}</span>
          </div>
          <p className="text-sm text-gray-600">Listing Views</p>
          <p className="text-xs text-gray-500 mt-1">This month</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-gray-900">{stats.response_rate}%</span>
          </div>
          <p className="text-sm text-gray-600">Response Rate</p>
          <p className="text-xs text-gray-500 mt-1">Keep it above 80%</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <Star className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-gray-900">
              {business?.rating || 0}
            </span>
          </div>
          <p className="text-sm text-gray-600">Rating</p>
          <p className="text-xs text-gray-500 mt-1">{business?.reviews || 0} reviews</p>
        </div>
      </div>

      {/* Lead Credits Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Coins className="h-6 w-6 text-primary" />
            <h3 className="text-lg font-semibold">Lead Credits</h3>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">{stats.lead_credits || 10}</p>
            <p className="text-sm text-gray-600">credits remaining</p>
          </div>
        </div>
        
        <div className="border-t pt-4">
          <p className="text-sm text-gray-600 mb-4">
            Each credit lets you view one customer contact information
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => handleBuyCredits(10, 20000)}
              disabled={buyingCredits}
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 text-left"
            >
              <p className="font-semibold">10 Credits</p>
              <p className="text-sm text-gray-600">$200</p>
              <p className="text-xs text-accent">$20/lead</p>
            </button>
            
            <button
              onClick={() => handleBuyCredits(25, 45000)}
              disabled={buyingCredits}
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors relative disabled:opacity-50 text-left"
            >
              <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs px-2 py-1 rounded-full">Save $50</span>
              <p className="font-semibold">25 Credits</p>
              <p className="text-sm text-gray-600">$450</p>
              <p className="text-xs text-accent">$18/lead</p>
            </button>
            
            <button
              onClick={() => handleBuyCredits(50, 80000)}
              disabled={buyingCredits}
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 text-left"
            >
              <p className="font-semibold">50 Credits</p>
              <p className="text-sm text-gray-600">$800</p>
              <p className="text-xs text-accent">$16/lead</p>
            </button>
          </div>
        </div>
      </div>

      {/* Featured Listing Promotion */}
      {!business?.is_featured && (
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg shadow p-6 border border-primary/20">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                <Sparkles className="h-8 w-8 text-primary" />
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
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
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
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900">Recent Leads</h3>
                {stats.new_leads > 0 && (
                  <span className="bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded-full font-semibold">
                    {stats.new_leads} new
                  </span>
                )}
              </div>
              <Link
                href="/dealer-portal/leads"
                className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
              >
                View all
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
          <div className="p-6">
            {stats.recent_leads && stats.recent_leads.length > 0 ? (
              <div className="space-y-4">
                {stats.recent_leads.slice(0, 3).map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between p-3 bg-secondary/10 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{lead.service_type}</p>
                      <p className="text-sm text-gray-600">
                        {lead.city ? `${lead.city}, ${lead.state}` : `ZIP: ${lead.zipcode}`} - {lead.timeline}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                        {lead.project_description}
                      </p>
                    </div>
                    <span className="text-xs text-secondary">
                      {getTimeAgo(lead.created_at)}
                    </span>
                  </div>
                ))}
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
                <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Complete your profile</p>
                  <p className="text-sm text-gray-600">
                    Add photos and detailed descriptions to increase conversions
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
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