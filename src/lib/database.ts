import { supabase, isSupabaseConfigured } from './supabase';
import { db as neonDb, isNeonConfigured, getDatabaseType, sql } from './neon';
import type { Business, Lead } from './neon';
import { sampleBusinesses } from '@/data/sample-businesses';

// Unified database interface
export class Database {
  private dbType: 'neon' | 'supabase' | 'none';

  constructor() {
    this.dbType = getDatabaseType();
    console.log(`Using database: ${this.dbType}`);
  }

  // Business operations
  async getBusinesses(filters?: any) {
    // If no database is configured, use sample data
    if (this.dbType === 'none') {
      let filtered = [...sampleBusinesses];

      if (filters?.category) {
        filtered = filtered.filter(b => b.category === filters.category);
      }
      if (filters?.city) {
        filtered = filtered.filter(b => b.city === filters.city);
      }
      if (filters?.search) {
        const search = filters.search.toLowerCase();
        filtered = filtered.filter(b =>
          b.name.toLowerCase().includes(search) ||
          b.description?.toLowerCase().includes(search)
        );
      }

      return {
        businesses: filtered.slice(filters?.offset || 0, (filters?.offset || 0) + (filters?.limit || 100)),
        total: filtered.length,
        source: 'sample'
      };
    }

    // Use Neon
    if (this.dbType === 'neon') {
      try {
        const businesses = await neonDb.businesses.findMany(filters);
        return {
          businesses,
          total: businesses.length,
          source: 'neon'
        };
      } catch (error) {
        console.error('Neon query error:', error);
        // Fallback to sample data
        return {
          businesses: sampleBusinesses.slice(0, filters?.limit || 100),
          total: sampleBusinesses.length,
          source: 'sample',
          error: 'Database error'
        };
      }
    }

    // Use Supabase
    if (this.dbType === 'supabase' && supabase) {
      try {
        let query = supabase.from('businesses').select('*', { count: 'exact' });

        if (filters?.category) query = query.eq('category', filters.category);
        if (filters?.city) query = query.eq('city', filters.city);
        if (filters?.state) query = query.eq('state', filters.state);
        if (filters?.is_featured) query = query.eq('is_featured', true);
        if (filters?.is_verified) query = query.eq('is_verified', true);
        if (filters?.search) {
          query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
        }

        query = query
          .order('is_featured', { ascending: false })
          .order('rating', { ascending: false });

        if (filters?.limit) {
          query = query.range(
            filters.offset || 0,
            (filters.offset || 0) + filters.limit - 1
          );
        }

        const { data, error, count } = await query;

        if (error) throw error;

        return {
          businesses: data || [],
          total: count || 0,
          source: 'supabase'
        };
      } catch (error) {
        console.error('Supabase query error:', error);
        return {
          businesses: sampleBusinesses.slice(0, filters?.limit || 100),
          total: sampleBusinesses.length,
          source: 'sample',
          error: 'Database error'
        };
      }
    }

    // Default fallback
    return {
      businesses: sampleBusinesses.slice(0, filters?.limit || 100),
      total: sampleBusinesses.length,
      source: 'sample'
    };
  }

  async getBusinessById(id: string) {
    if (this.dbType === 'none') {
      return sampleBusinesses.find(b => b.id === id);
    }

    if (this.dbType === 'neon') {
      try {
        return await neonDb.businesses.findById(id);
      } catch (error) {
        console.error('Neon query error:', error);
        return sampleBusinesses.find(b => b.id === id);
      }
    }

    if (this.dbType === 'supabase' && supabase) {
      try {
        const { data, error } = await supabase
          .from('businesses')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Supabase query error:', error);
        return sampleBusinesses.find(b => b.id === id);
      }
    }

    return sampleBusinesses.find(b => b.id === id);
  }

  async createBusiness(data: Partial<Business>) {
    if (this.dbType === 'none') {
      return { error: 'Database not configured' };
    }

    if (this.dbType === 'neon') {
      try {
        const business = await neonDb.businesses.create(data);
        return { success: true, business };
      } catch (error) {
        return { error: 'Failed to create business' };
      }
    }

    if (this.dbType === 'supabase' && supabase) {
      try {
        const { data: createdBusiness, error } = await supabase
          .from('businesses')
          .insert([data])
          .select()
          .single();

        if (error) throw error;
        return { success: true, business: createdBusiness };
      } catch (error) {
        return { error: 'Failed to create business' };
      }
    }

    return { error: 'Database not configured' };
  }

  async updateBusiness(id: string, data: Partial<Business>) {
    if (this.dbType === 'none') {
      return { error: 'Database not configured' };
    }

    if (this.dbType === 'neon') {
      try {
        const business = await neonDb.businesses.update(id, data);
        return { success: true, business };
      } catch (error) {
        return { error: 'Failed to update business' };
      }
    }

    if (this.dbType === 'supabase' && supabase) {
      try {
        const { data: updatedBusiness, error } = await supabase
          .from('businesses')
          .update(data)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return { success: true, business: updatedBusiness };
      } catch (error) {
        return { error: 'Failed to update business' };
      }
    }

    return { error: 'Database not configured' };
  }

  // Lead operations
  async getLeads(filters?: any) {
    if (this.dbType === 'none') {
      return { leads: [], source: 'memory' };
    }

    if (this.dbType === 'neon') {
      try {
        const leads = await neonDb.leads.findMany(filters);
        return { leads, source: 'neon' };
      } catch (error) {
        console.error('Neon query error:', error);
        return { leads: [], source: 'memory', error: 'Database error' };
      }
    }

    if (this.dbType === 'supabase' && supabase) {
      try {
        let query = supabase
          .from('leads')
          .select('*')
          .order('created_at', { ascending: false });

        if (filters?.business_id) {
          query = query.contains('business_ids', [filters.business_id]);
        }
        if (filters?.status) {
          query = query.eq('status', filters.status);
        }

        const { data, error } = await query;

        if (error) throw error;
        return { leads: data || [], source: 'supabase' };
      } catch (error) {
        console.error('Supabase query error:', error);
        return { leads: [], source: 'memory', error: 'Database error' };
      }
    }

    return { leads: [], source: 'memory' };
  }

  async createLead(data: Partial<Lead>) {
    // Generate ID if not provided
    if (!data.id) {
      data.id = `lead-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Set defaults
    data.created_at = new Date().toISOString();
    data.status = data.status || 'new';
    data.source = data.source || 'website';

    if (this.dbType === 'none') {
      // Store in memory (for demo)
      return {
        success: true,
        lead: data as Lead,
        source: 'memory',
        message: 'Lead saved locally (no database configured)'
      };
    }

    if (this.dbType === 'neon') {
      try {
        const lead = await neonDb.leads.create(data);
        return {
          success: true,
          lead,
          source: 'neon',
          message: 'Your request has been sent to service providers!'
        };
      } catch (error) {
        console.error('Neon error:', error);
        return {
          success: true,
          lead: data as Lead,
          source: 'memory',
          message: 'Lead saved locally',
          error: 'Database error'
        };
      }
    }

    if (this.dbType === 'supabase' && supabase) {
      try {
        const { data: lead, error } = await supabase
          .from('leads')
          .insert([data])
          .select()
          .single();

        if (error) throw error;

        return {
          success: true,
          lead,
          source: 'supabase',
          message: 'Your request has been sent to service providers!'
        };
      } catch (error) {
        console.error('Supabase error:', error);
        return {
          success: true,
          lead: data as Lead,
          source: 'memory',
          message: 'Lead saved locally',
          error: 'Database error'
        };
      }
    }

    return {
      success: true,
      lead: data as Lead,
      source: 'memory',
      message: 'Lead saved locally'
    };
  }

  async updateLeadStatus(id: string, status: string) {
    if (this.dbType === 'none') {
      return { error: 'Database not configured' };
    }

    if (this.dbType === 'neon') {
      try {
        const lead = await neonDb.leads.updateStatus(id, status);
        return { success: true, lead, source: 'neon' };
      } catch (error) {
        return { error: 'Failed to update lead' };
      }
    }

    if (this.dbType === 'supabase' && supabase) {
      try {
        const { data, error } = await supabase
          .from('leads')
          .update({ status })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return { success: true, lead: data, source: 'supabase' };
      } catch (error) {
        return { error: 'Failed to update lead' };
      }
    }

    return { error: 'Database not configured' };
  }

  // Test connection
  async testConnection() {
    if (this.dbType === 'none') {
      return {
        success: false,
        message: 'No database configured',
        type: 'none'
      };
    }

    if (this.dbType === 'neon') {
      if (!sql) {
        return {
          success: false,
          error: 'Neon is not configured',
          type: 'neon'
        };
      }

      try {
        const result = await sql`SELECT NOW() as current_time`;
        return {
          success: true,
          time: result[0].current_time,
          type: 'neon'
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          type: 'neon'
        };
      }
    }

    if (this.dbType === 'supabase' && supabase) {
      try {
        const { data, error } = await supabase.from('businesses').select('count').limit(1);
        if (error) throw error;
        return {
          success: true,
          type: 'supabase'
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          type: 'supabase'
        };
      }
    }

    return {
      success: false,
      message: 'No database configured',
      type: 'none'
    };
  }
}

// Export singleton instance
export const database = new Database();

// Export types
export type { Business, Lead };
