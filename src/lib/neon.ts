import { neon, neonConfig, Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import ws from 'ws';

// Configure Neon for serverless environment
neonConfig.webSocketConstructor = ws;

// Get database URL from environment
const databaseUrl = process.env.DATABASE_URL || process.env.NEXT_PUBLIC_NEON_DATABASE_URL || '';
const directDatabaseUrl = process.env.DIRECT_DATABASE_URL || '';

// Create SQL query function for serverless (only if configured)
export const sql = databaseUrl ? neon(databaseUrl) : null as any;

// Create connection pool for long-running connections (only if configured)
export const pool = (directDatabaseUrl || databaseUrl)
  ? new Pool({ connectionString: directDatabaseUrl || databaseUrl })
  : null as any;

// Helper function to check if Neon is configured
export function isNeonConfigured() {
  return !!(databaseUrl && databaseUrl !== '');
}

// Database type detection
export function getDatabaseType(): 'neon' | 'supabase' | 'none' {
  if (process.env.NEXT_PUBLIC_DATABASE_TYPE === 'neon' || databaseUrl.includes('neon.tech')) {
    return 'neon';
  }
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return 'supabase';
  }
  return 'none';
}

// Type definitions matching existing schema
export interface Business {
  id: string;
  name: string;
  category: string;
  description?: string;
  rating: number;
  reviews: number;
  phone: string;
  email?: string;
  website?: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  latitude?: number;
  longitude?: number;
  is_featured: boolean;
  is_verified: boolean;
  is_claimed: boolean;
  featured_until?: string;
  logo_url?: string;
  cover_image?: string;
  years_in_business?: number;
  license_number?: string;
  insurance?: boolean;
  price_range?: string;
  services?: any;
  service_areas?: string[];
  hours?: any;
  gallery_images?: string[];
  certifications?: string[];
  owner_name?: string;
  owner_email?: string;
  owner_phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  zipcode?: string;
  service_type: string;
  project_description?: string;
  timeline: string;
  budget?: string;
  business_ids?: string[];
  category?: string;
  status: string;
  source: string;
  created_at: string;
  updated_at: string;
}

// Query builder functions
export const db = {
  // Business queries
  businesses: {
    async findMany(filters?: any) {
      if (!sql) throw new Error('Neon database not configured');
      let query = 'SELECT * FROM businesses WHERE 1=1';
      const params: any[] = [];
      let paramIndex = 1;

      if (filters?.category) {
        query += ` AND category = $${paramIndex++}`;
        params.push(filters.category);
      }
      if (filters?.city) {
        query += ` AND city = $${paramIndex++}`;
        params.push(filters.city);
      }
      if (filters?.state) {
        query += ` AND state = $${paramIndex++}`;
        params.push(filters.state);
      }
      if (filters?.is_featured) {
        query += ` AND is_featured = $${paramIndex++}`;
        params.push(filters.is_featured);
      }
      if (filters?.is_verified) {
        query += ` AND is_verified = $${paramIndex++}`;
        params.push(filters.is_verified);
      }
      if (filters?.search) {
        query += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex} OR category ILIKE $${paramIndex})`;
        params.push(`%${filters.search}%`);
        paramIndex++;
      }

      query += ' ORDER BY is_featured DESC, rating DESC';

      if (filters?.limit) {
        query += ` LIMIT $${paramIndex++}`;
        params.push(filters.limit);
      }
      if (filters?.offset) {
        query += ` OFFSET $${paramIndex++}`;
        params.push(filters.offset);
      }

      const result = await sql(query, params);
      return result as Business[];
    },

    async findById(id: string) {
      const result = await sql('SELECT * FROM businesses WHERE id = $1', [id]);
      return result[0] as Business | undefined;
    },

    async create(data: Partial<Business>) {
      const columns = Object.keys(data);
      const values = Object.values(data);
      const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');

      const query = `
        INSERT INTO businesses (${columns.join(', ')})
        VALUES (${placeholders})
        RETURNING *
      `;

      const result = await sql(query, values);
      return result[0] as Business;
    },

    async update(id: string, data: Partial<Business>) {
      const columns = Object.keys(data);
      const values = Object.values(data);
      const setClause = columns.map((col, i) => `${col} = $${i + 2}`).join(', ');

      const query = `
        UPDATE businesses
        SET ${setClause}, updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `;

      const result = await sql(query, [id, ...values]);
      return result[0] as Business;
    }
  },

  // Lead queries
  leads: {
    async findMany(filters?: any) {
      if (!sql) throw new Error('Neon database not configured');
      let query = 'SELECT * FROM leads WHERE 1=1';
      const params: any[] = [];
      let paramIndex = 1;

      if (filters?.status) {
        query += ` AND status = $${paramIndex++}`;
        params.push(filters.status);
      }
      if (filters?.business_id) {
        query += ` AND $${paramIndex++} = ANY(business_ids)`;
        params.push(filters.business_id);
      }

      query += ' ORDER BY created_at DESC';

      if (filters?.limit) {
        query += ` LIMIT $${paramIndex++}`;
        params.push(filters.limit);
      }

      const result = await sql(query, params);
      return result as Lead[];
    },

    async create(data: Partial<Lead>) {
      const columns = Object.keys(data);
      const values = Object.values(data);
      const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');

      const query = `
        INSERT INTO leads (${columns.join(', ')})
        VALUES (${placeholders})
        RETURNING *
      `;

      const result = await sql(query, values);
      return result[0] as Lead;
    },

    async updateStatus(id: string, status: string) {
      const query = `
        UPDATE leads
        SET status = $2, updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `;

      const result = await sql(query, [id, status]);
      return result[0] as Lead;
    }
  },

  // Raw SQL execution
  async raw(query: string, params?: any[]) {
    return await sql(query, params || []);
  }
};

// Migration helper to switch from Supabase to Neon
export async function migrateFromSupabase() {
  try {
    // Check if tables exist
    const tablesExist = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'businesses'
      );
    `;

    if (!tablesExist[0].exists) {
      console.log('Running initial schema setup...');
      // Tables don't exist, run schema
      // This would be handled by running schema.sql
      return { success: false, message: 'Please run database/schema.sql first' };
    }

    return { success: true, message: 'Database ready' };
  } catch (error) {
    console.error('Migration error:', error);
    return { success: false, error };
  }
}

// Connection test
export async function testConnection() {
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
