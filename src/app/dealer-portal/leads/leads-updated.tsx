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
  Coins,
  Users,
  Archive
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
  const [filter, setFilter] = useState('active'); // Changed default to 'active'
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [leadCredits, setLeadCredits] = useState(0);
  const [revealingLead, setRevealingLead] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    contacted: 0,
    archived: 0
  });

  useEffect(() => {
    checkAuth();
    fetchLeads();
    fetchCredits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        const archivedLeads = data.leads.filter((l: Lead) => 
          l.status === 'viewed' || l.status === 'won' || l.status === 'lost'
        ).length;

        setStats({
          total: data.leads.length,
          new: newLeads,
          contacted: contactedLeads,
          archived: archivedLeads
        });
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterLeads = () => {
    if (filter === 'active') {
      // Show new and contacted leads (not archived)
      setFilteredLeads(leads.filter(lead => 
        lead.status === 'new' || lead.status === 'contacted'
      ));
    } else if (filter === 'archived') {
      // Show viewed, won, lost leads
      setFilteredLeads(leads.filter(lead => 
        lead.status === 'viewed' || lead.status === 'won' || lead.status === 'lost'
      ));
    } else if (filter === 'all') {
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
        // Refresh stats
        await fetchLeads();
      }
    } catch (error) {
      console.error('Error updating lead:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-secondary text-secondary-foreground';
      case 'viewed': return 'bg-primary/20 border border-primary/30';
      case 'contacted': return 'bg-primary text-primary-foreground';
      case 'won': return 'bg-secondary/20 border border-secondary/30';
      case 'lost': return 'bg-primary/10 border border-primary/20';
      default: return 'bg-secondary/20 border border-secondary/30';
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/5">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4 flex-wrap gap-3">
            <div className="flex items-center min-w-0">
              <Link
                href="/dealer-portal"
                className="mr-4 p-2 hover:bg-primary-foreground/10 rounded-lg transition"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Leads Management</h1>
                <p className="text-sm opacity-80">Manage and respond to customer inquiries</p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2 px-3 py-2 bg-secondary text-secondary-foreground rounded-lg flex-shrink-0">
                <Coins className="h-5 w-5" />
                <span className="font-semibold">{leadCredits}</span>
                <span className="text-sm opacity-80">credits</span>
              </div>
              <Link
                href="/dealer-portal"
                className="text-sm px-3 py-2 bg-primary-foreground text-primary rounded-lg hover:bg-primary-foreground/90 transition ml-auto sm:ml-0"
              >
                Buy Credits
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards - Removed Won and Conversion */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-primary/10 rounded-lg shadow p-4 border border-primary/20">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm opacity-70">Total Leads</div>
          </div>
          <div className="bg-secondary rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-secondary-foreground">{stats.new}</div>
            <div className="text-sm text-secondary-foreground/70">New</div>
          </div>
          <div className="bg-primary rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-primary-foreground">{stats.contacted}</div>
            <div className="text-sm text-primary-foreground/70">Contacted</div>
          </div>
          <div className="bg-secondary/20 rounded-lg shadow p-4 border border-secondary/30">
            <div className="flex items-center gap-2">
              <Archive className="h-5 w-5" />
              <div className="text-2xl font-bold">{stats.archived}</div>
            </div>
            <div className="text-sm opacity-70">Archived</div>
          </div>
        </div>

        {/* Filters - Fixed text color */}
        <div className="bg-primary/10 rounded-lg shadow mb-6 border border-primary/20">
          <div className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-shrink-0">
                <Filter className="h-5 w-5" />
                <span className="font-medium">Filter:</span>
              </div>
              <div className="flex gap-2 overflow-x-auto -mx-2 px-2 pb-1">
                {['active', 'new', 'contacted', 'archived', 'all'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                      filter === status
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary/20 hover:bg-secondary/30 border border-secondary/30'
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
        <div className="bg-primary/5 rounded-lg shadow border border-primary/10">
          <div className="divide-y divide-primary/10">
            {filteredLeads.length > 0 ? (
              filteredLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="p-6 hover:bg-primary/10 transition cursor-pointer"
                  onClick={() => {
                    const currentLead = leads.find(l => l.id === lead.id) || lead;
                    setSelectedLead(currentLead);
                  }}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">
                          {lead.is_revealed ? lead.name : lead.name || 'Potential Customer'}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                          {lead.status}
                        </span>
                        {lead.status === 'new' && (
                          <span className="text-xs font-medium bg-secondary text-secondary-foreground px-2 py-1 rounded">
                            Respond quickly!
                          </span>
                        )}
                        {!lead.is_revealed && (
                          <span className="flex items-center gap-1 px-2 py-1 bg-secondary/20 rounded-full text-xs border border-secondary/30">
                            <Lock className="h-3 w-3" />
                            Contact Hidden
                          </span>
                        )}
                      </div>

                      <div className="text-sm mb-3">
                        <p className="font-medium">{lead.service_type}</p>
                        <p className="opacity-80 line-clamp-2">{lead.project_description}</p>
                      </div>

                      {/* Contact Info Row - Always visible */}
                      <div className="flex items-center gap-4 mb-2">
                        {lead.is_revealed ? (
                          <>
                            <a 
                              href={`tel:${lead.phone}`}
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1 bg-primary text-primary-foreground px-2 py-1 rounded hover:bg-primary/90 transition"
                            >
                              <Phone className="h-4 w-4" />
                              <span className="text-sm font-medium">{lead.phone}</span>
                            </a>
                            <a 
                              href={`mailto:${lead.email}`}
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded hover:bg-secondary/90 transition"
                            >
                              <Mail className="h-4 w-4" />
                              <span className="text-sm font-medium">{lead.email}</span>
                            </a>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center gap-1 opacity-50">
                              <Phone className="h-4 w-4" />
                              <span className="text-sm">{maskContactInfo(lead.phone || '•••-•••-••••', 'phone')}</span>
                            </div>
                            <div className="flex items-center gap-1 opacity-50">
                              <Mail className="h-4 w-4" />
                              <span className="text-sm">{maskContactInfo(lead.email || '••••@••••.com', 'email')}</span>
                            </div>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-6 text-sm opacity-60">
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

                    {/* Desktop Actions */}
                    <div className="hidden sm:flex gap-2 ml-4">
                      {lead.is_revealed ? (
                        <>
                          <a
                            href={`tel:${lead.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
                          >
                            <Phone className="h-5 w-5" />
                          </a>
                          <a
                            href={`mailto:${lead.email}`}
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition"
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
                          className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {revealingLead === lead.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-secondary-foreground"></div>
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

                  {/* Quick Actions - Archive buttons */}
                  {lead.is_revealed && lead.status === 'new' && (
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateLeadStatus(lead.id, 'contacted');
                        }}
                        className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90 transition"
                      >
                        Mark as Contacted
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateLeadStatus(lead.id, 'viewed');
                        }}
                        className="px-3 py-1 bg-secondary/20 border border-secondary/30 rounded text-sm hover:bg-secondary/30 transition flex items-center gap-1"
                      >
                        <Archive className="h-3 w-3" />
                        Archive
                      </button>
                    </div>
                  )}
                  {lead.is_revealed && lead.status === 'contacted' && (
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateLeadStatus(lead.id, 'viewed');
                        }}
                        className="px-3 py-1 bg-secondary/20 border border-secondary/30 rounded text-sm hover:bg-secondary/30 transition flex items-center gap-1"
                      >
                        <Archive className="h-3 w-3" />
                        Archive Lead
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-40" />
                <h3 className="text-lg font-medium mb-2">No leads yet</h3>
                <p className="opacity-60 mb-6">
                  Get featured to start receiving more leads
                </p>
                <Link
                  href="/dealer-portal/advertise"
                  className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
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
                    <h3 className="font-semibold mb-2">Contact Information</h3>
                    <div className="bg-secondary/10 rounded-lg p-4 space-y-2 border border-secondary/20">
                      <p><span className="font-medium">Name:</span> {selectedLead.name}</p>
                      <p><span className="font-medium">Email:</span> {selectedLead.email}</p>
                      <p><span className="font-medium">Phone:</span> {selectedLead.phone}</p>
                      <p><span className="font-medium">Location:</span> {selectedLead.service_city || selectedLead.zipcode}{selectedLead.service_state ? `, ${selectedLead.service_state}` : ''}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Project Details</h3>
                    <div className="bg-primary/10 rounded-lg p-4 space-y-2 border border-primary/20">
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
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
                    >
                      <Phone className="h-5 w-5" />
                      Call Customer
                    </a>
                    <a
                      href={`mailto:${selectedLead.email}`}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition"
                    >
                      <Mail className="h-5 w-5" />
                      Send Email
                    </a>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Lock className="h-16 w-16 mx-auto mb-4 opacity-40" />
                  <h3 className="text-lg font-semibold mb-2">Contact Information Hidden</h3>
                  <p className="opacity-60 mb-6">
                    Use 1 credit to reveal this lead's contact information
                  </p>
                  
                  <div className="bg-secondary/10 rounded-lg p-4 mb-6 border border-secondary/20">
                    <h4 className="font-semibold mb-2">What you'll get:</h4>
                    <ul className="text-sm opacity-80 space-y-1">
                      <li>• Customer's full name</li>
                      <li>• Phone number for direct contact</li>
                      <li>• Email address</li>
                      <li>• Ability to mark lead status</li>
                    </ul>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm">
                      You have <span className="font-semibold bg-secondary text-secondary-foreground px-2 py-1 rounded">{leadCredits} credits</span> remaining
                    </p>
                  </div>

                  {leadCredits > 0 ? (
                    <button
                      onClick={() => revealLead(selectedLead.id)}
                      disabled={revealingLead === selectedLead.id}
                      className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition disabled:opacity-50"
                    >
                      {revealingLead === selectedLead.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-secondary-foreground inline-block mr-2"></div>
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
                      className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
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