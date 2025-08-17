'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  MessageSquare,
  Phone,
  Mail,
  Clock,
  DollarSign,
  MapPin,
  Calendar,
  Check,
  X,
  Filter,
  Download,
  Star,
  Lock,
  Eye,
  EyeOff,
  Coins
} from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  service_type: string;
  project_description: string;
  timeline: string;
  budget: string;
  zipcode: string;
  service_city?: string;
  service_state?: string;
  service_address?: string;
  status: string;
  created_at: string;
  response_time?: number;
  viewed_at?: string;
  contacted_at?: string;
  is_revealed?: boolean;
  revealed_at?: string;
  masked?: boolean;
}

export default function LeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [leadCredits, setLeadCredits] = useState(0);
  const [revealingLead, setRevealingLead] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    contacted: 0,
    won: 0,
    conversionRate: 0
  });

  useEffect(() => {
    checkAuth();
    fetchLeads();
    fetchCredits();
  }, []);

  useEffect(() => {
    filterLeads();
  }, [filter, leads]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (!response.ok) {
        router.push('/login');
        return;
      }
      const data = await response.json();

      if (data.user.role !== 'business_owner' && data.user.role !== 'admin') {
        router.push('/dashboard');
        return;
      }
    } catch (error) {
      router.push('/login');
    }
  };

  const fetchCredits = async () => {
    try {
      const response = await fetch('/api/dealer-portal/stats');
      if (response.ok) {
        const data = await response.json();
        setLeadCredits(data.lead_credits || 0);
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
    }
  };

  const fetchLeads = async () => {
    try {
      const response = await fetch('/api/dealer-portal/leads');
      if (response.ok) {
        const data = await response.json();
        setLeads(data.leads || []);
        setLeadCredits(data.leadCredits || 0);

        // Calculate stats
        const newLeads = data.leads.filter((l: Lead) => l.status === 'new').length;
        const contactedLeads = data.leads.filter((l: Lead) => l.status === 'contacted').length;
        const wonLeads = data.leads.filter((l: Lead) => l.status === 'won').length;
        const revealedLeads = data.leads.filter((l: Lead) => l.is_revealed).length;

        setStats({
          total: data.leads.length,
          new: newLeads - revealedLeads, // Only count unrevealed as new
          contacted: contactedLeads,
          won: wonLeads,
          conversionRate: revealedLeads > 0 ? Math.round((wonLeads / revealedLeads) * 100) : 0
        });
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterLeads = () => {
    if (filter === 'all') {
      setFilteredLeads(leads);
    } else {
      setFilteredLeads(leads.filter(lead => lead.status === filter));
    }
  };

  const revealLead = async (leadId: string) => {
    if (leadCredits <= 0) {
      alert('You need lead credits to reveal contact information. Purchase more credits from your dashboard.');
      router.push('/dealer-portal');
      return;
    }

    setRevealingLead(leadId);
    
    try {
      const response = await fetch(`/api/dealer-portal/leads/${leadId}/reveal`, {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update credits immediately
        setLeadCredits(data.credits_remaining || leadCredits - 1);
        
        // Refresh all leads to get unmasked data
        const leadsResponse = await fetch('/api/dealer-portal/leads');
        if (leadsResponse.ok) {
          const leadsData = await leadsResponse.json();
          setLeads(leadsData.leads || []);
          
          // If this is the selected lead, update it with the refreshed data
          if (selectedLead?.id === leadId) {
            const updatedLead = leadsData.leads.find((l: Lead) => l.id === leadId);
            if (updatedLead) {
              setSelectedLead(updatedLead);
            }
          }
        }
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to reveal lead information');
      }
    } catch (error) {
      console.error('Error revealing lead:', error);
      alert('Failed to reveal lead information');
    } finally {
      setRevealingLead(null);
    }
  };

  const updateLeadStatus = async (leadId: string, status: string) => {
    try {
      const response = await fetch(`/api/dealer-portal/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        setLeads(leads.map(lead =>
          lead.id === leadId ? { ...lead, status } : lead
        ));
      }
    } catch (error) {
      console.error('Error updating lead:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'viewed': return 'bg-yellow-100 text-yellow-800';
      case 'contacted': return 'bg-purple-100 text-purple-800';
      case 'won': return 'bg-green-100 text-green-800';
      case 'lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diff = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  const maskContactInfo = (value: string, type: 'email' | 'phone') => {
    if (type === 'email') {
      const [local, domain] = value.split('@');
      if (!domain) return '••••••••';
      return `${local.substring(0, 2)}••••@${domain}`;
    } else {
      // Phone
      return value.replace(/\d(?=\d{4})/g, '•');
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
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <Link
                href="/dealer-portal"
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Leads Management</h1>
                <p className="text-sm text-gray-600">Manage and respond to customer inquiries</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
                <Coins className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-blue-900">{leadCredits}</span>
                <span className="text-sm text-blue-700">credits</span>
              </div>
              <Link
                href="/dealer-portal"
                className="text-sm text-blue-600 hover:text-blue-700 underline"
              >
                Buy Credits
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Leads</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
            <div className="text-sm text-gray-600">New</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-purple-600">{stats.contacted}</div>
            <div className="text-sm text-gray-600">Contacted</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-green-600">{stats.won}</div>
            <div className="text-sm text-gray-600">Won</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-orange-600">{stats.conversionRate}%</div>
            <div className="text-sm text-gray-600">Conversion</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-500" />
                <span className="font-medium">Filter by Status:</span>
              </div>
              <div className="flex gap-2">
                {['all', 'new', 'viewed', 'contacted', 'won', 'lost'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                      filter === status
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Leads List */}
        <div className="bg-white rounded-lg shadow">
          <div className="divide-y">
            {filteredLeads.length > 0 ? (
              filteredLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="p-6 hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => {
                    // Always use the most current lead data when opening modal
                    const currentLead = leads.find(l => l.id === lead.id) || lead;
                    setSelectedLead(currentLead);
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">
                          {lead.is_revealed ? lead.name : 'Potential Customer'}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                          {lead.status}
                        </span>
                        {lead.status === 'new' && (
                          <span className="text-xs text-orange-600 font-medium">
                            Respond quickly!
                          </span>
                        )}
                        {!lead.is_revealed && (
                          <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                            <Lock className="h-3 w-3" />
                            Contact Hidden
                          </span>
                        )}
                      </div>

                      <div className="text-sm text-gray-600 mb-3">
                        <p className="font-medium">{lead.service_type}</p>
                        <p className="line-clamp-2">{lead.project_description}</p>
                      </div>

                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {getTimeAgo(lead.created_at)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Timeline: {lead.timeline}
                        </div>
                        {lead.budget && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            Budget: {lead.budget}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {lead.service_city || lead.zipcode}{lead.service_state ? `, ${lead.service_state}` : ''}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      {lead.is_revealed ? (
                        <>
                          <a
                            href={`tel:${lead.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
                          >
                            <Phone className="h-5 w-5" />
                          </a>
                          <a
                            href={`mailto:${lead.email}`}
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                          >
                            <Mail className="h-5 w-5" />
                          </a>
                        </>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            revealLead(lead.id);
                          }}
                          disabled={revealingLead === lead.id || leadCredits <= 0}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {revealingLead === lead.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Revealing...
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4" />
                              Reveal (1 Credit)
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  {lead.is_revealed && (
                    <div className="flex gap-2 mt-4">
                      {lead.status === 'new' && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateLeadStatus(lead.id, 'contacted');
                            }}
                            className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm hover:bg-purple-200 transition"
                          >
                            Mark as Contacted
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateLeadStatus(lead.id, 'viewed');
                            }}
                            className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded text-sm hover:bg-yellow-200 transition"
                          >
                            Mark as Viewed
                          </button>
                        </>
                      )}
                      {(lead.status === 'contacted' || lead.status === 'viewed') && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateLeadStatus(lead.id, 'won');
                            }}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 transition"
                          >
                            <Check className="h-4 w-4 inline mr-1" />
                            Won
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateLeadStatus(lead.id, 'lost');
                            }}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition"
                          >
                            <X className="h-4 w-4 inline mr-1" />
                            Lost
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No leads yet</h3>
                <p className="text-gray-600 mb-6">
                  Get featured to start receiving more leads
                </p>
                <Link
                  href="/dealer-portal/advertise"
                  className="inline-block px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                >
                  Get Featured
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Lead Details Modal */}
      {selectedLead && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedLead(null)}
        >
          <div
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold">Lead Details</h2>
              <button
                onClick={() => setSelectedLead(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {selectedLead.is_revealed ? (
                <>
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Contact Information</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <p><span className="font-medium">Name:</span> {selectedLead.name}</p>
                      <p><span className="font-medium">Email:</span> {selectedLead.email}</p>
                      <p><span className="font-medium">Phone:</span> {selectedLead.phone}</p>
                      <p><span className="font-medium">Location:</span> {selectedLead.service_city || selectedLead.zipcode}{selectedLead.service_state ? `, ${selectedLead.service_state}` : ''}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Project Details</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <p><span className="font-medium">Service:</span> {selectedLead.service_type}</p>
                      <p><span className="font-medium">Description:</span> {selectedLead.project_description}</p>
                      <p><span className="font-medium">Timeline:</span> {selectedLead.timeline}</p>
                      {selectedLead.budget && (
                        <p><span className="font-medium">Budget:</span> {selectedLead.budget}</p>
                      )}
                      {selectedLead.service_address && (
                        <p><span className="font-medium">Service Address:</span> {selectedLead.service_address}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <a
                      href={`tel:${selectedLead.phone}`}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      <Phone className="h-5 w-5" />
                      Call Customer
                    </a>
                    <a
                      href={`mailto:${selectedLead.email}`}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      <Mail className="h-5 w-5" />
                      Send Email
                    </a>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Contact Information Hidden</h3>
                  <p className="text-gray-600 mb-6">
                    Use 1 credit to reveal this lead's contact information
                  </p>
                  
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-gray-700 mb-2">What you'll get:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Customer's full name</li>
                      <li>• Phone number for direct contact</li>
                      <li>• Email address</li>
                      <li>• Ability to mark lead status</li>
                    </ul>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600">
                      You have <span className="font-semibold text-blue-600">{leadCredits} credits</span> remaining
                    </p>
                  </div>

                  {leadCredits > 0 ? (
                    <button
                      onClick={() => revealLead(selectedLead.id)}
                      disabled={revealingLead === selectedLead.id}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      {revealingLead === selectedLead.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></div>
                          Revealing...
                        </>
                      ) : (
                        <>
                          <Eye className="h-5 w-5 inline mr-2" />
                          Reveal Contact (1 Credit)
                        </>
                      )}
                    </button>
                  ) : (
                    <Link
                      href="/dealer-portal"
                      className="inline-block px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                    >
                      Buy More Credits
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}