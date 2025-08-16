"use client";

import { useState, useEffect } from 'react';
import { Phone, Mail, Clock, Calendar, DollarSign, CheckCircle, XCircle, MessageSquare, TrendingUp, Download } from 'lucide-react';
import Link from 'next/link';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  zipcode: string;
  service_type: string;
  project_description: string;
  timeline: string;
  budget?: string;
  business_ids: string[];
  category?: string;
  created_at: string;
  status: 'new' | 'contacted' | 'quoted' | 'won' | 'lost';
  source: string;
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'new' | 'contacted' | 'quoted' | 'won' | 'lost'>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await fetch('/api/leads');
      const data = await response.json();
      setLeads(data.leads || data || []);
    } catch (error) {
      console.error('Failed to fetch leads:', error);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const updateLeadStatus = async (leadId: string, status: Lead['status']) => {
    try {
      const response = await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: leadId, status }),
      });

      if (response.ok) {
        setLeads(leads.map(lead =>
          lead.id === leadId ? { ...lead, status } : lead
        ));
      }
    } catch (error) {
      console.error('Failed to update lead status:', error);
    }
  };

  const filteredLeads = filter === 'all'
    ? leads
    : leads.filter(lead => lead.status === filter);

  const statusColors = {
    new: 'bg-blue-100 text-blue-700',
    contacted: 'bg-yellow-100 text-yellow-700',
    quoted: 'bg-purple-100 text-purple-700',
    won: 'bg-green-100 text-green-700',
    lost: 'bg-red-100 text-red-700',
  };

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    conversion: leads.length > 0
      ? Math.round((leads.filter(l => l.status === 'won').length / leads.length) * 100)
      : 0,
    value: leads.filter(l => l.status === 'won' && l.budget)
      .reduce((sum, l) => {
        const budgetValue = l.budget?.includes('_')
          ? parseInt(l.budget.split('_')[0]) || 0
          : 0;
        return sum + budgetValue;
      }, 0),
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Lead Management</h1>
            <p className="text-muted-foreground">
              Track and manage customer inquiries
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin"
              className="px-4 py-2 bg-card border rounded-lg hover:bg-muted"
            >
              Back to Admin
            </Link>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Leads</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
          </div>

          <div className="bg-card rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">New Leads</p>
                <p className="text-2xl font-bold">{stats.new}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-card rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">{stats.conversion}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-card rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Est. Value</p>
                <p className="text-2xl font-bold">${stats.value.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-lg border p-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Filter by status:</span>
            <div className="flex gap-2">
              {(['all', 'new', 'contacted', 'quoted', 'won', 'lost'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    filter === status
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                  {status !== 'all' && (
                    <span className="ml-1">
                      ({leads.filter(l => l.status === status).length})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Leads Table */}
        <div className="bg-card rounded-lg border">
          {loading ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">Loading leads...</p>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No leads found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Customer</th>
                    <th className="text-left p-4">Service</th>
                    <th className="text-left p-4">Timeline</th>
                    <th className="text-left p-4">Budget</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Date</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map(lead => (
                    <tr key={lead.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{lead.name}</div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {lead.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {lead.phone}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{lead.service_type}</div>
                          {lead.project_description && (
                            <div className="text-sm text-muted-foreground line-clamp-2">
                              {lead.project_description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm">
                          {lead.timeline.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm">
                          {lead.budget ? lead.budget.replace(/_/g, ' ') : 'Not specified'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[lead.status]}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(lead.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <select
                            value={lead.status}
                            onChange={(e) => updateLeadStatus(lead.id, e.target.value as Lead['status'])}
                            className="px-2 py-1 border rounded text-sm"
                          >
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="quoted">Quoted</option>
                            <option value="won">Won</option>
                            <option value="lost">Lost</option>
                          </select>
                          <button
                            onClick={() => setSelectedLead(lead)}
                            className="px-2 py-1 bg-primary text-primary-foreground rounded text-sm"
                          >
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Lead Details Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedLead(null)} />
          <div className="relative bg-card rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-xl font-bold mb-4">Lead Details</h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <p>{selectedLead.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p>{selectedLead.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Phone</label>
                  <p>{selectedLead.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">ZIP Code</label>
                  <p>{selectedLead.zipcode || 'Not provided'}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Service Type</label>
                <p>{selectedLead.service_type}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Project Description</label>
                <p>{selectedLead.project_description || 'No description provided'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Timeline</label>
                  <p>{selectedLead.timeline.replace('_', ' ')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Budget</label>
                  <p>{selectedLead.budget ? selectedLead.budget.replace(/_/g, ' ') : 'Not specified'}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <p className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[selectedLead.status]}`}>
                    {selectedLead.status}
                  </span>
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Created</label>
                <p>{new Date(selectedLead.created_at).toLocaleString()}</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setSelectedLead(null)}
                className="px-4 py-2 border rounded-lg hover:bg-muted"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
