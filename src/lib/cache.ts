import { sql } from '@/lib/neon';

interface Business {
  id: string;
  name: string;
  category: string;
  description: string;
  rating: number;
  reviews: number;
  phone: string;
  email: string;
  website: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  latitude: number;
  longitude: number;
  is_featured: boolean;
  is_verified: boolean;
  is_claimed: boolean;
  featured_until: Date | null;
  logo_url: string | null;
  cover_image: string | null;
  years_in_business: number | null;
  license_number: string | null;
  insurance: boolean;
  price_range: string | null;
  services: any;
  service_areas: any;
  hours: any;
  gallery_images: any;
  certifications: any;
  owner_name: string | null;
  owner_email: string | null;
  owner_phone: string | null;
  created_at: Date;
  updated_at: Date;
}

interface CacheData {
  businesses: Business[];
  categories: Array<{ category: string; count: number }>;
  states: Array<{ state: string; count: number; city_count: number }>;
  cities: Array<{ city: string; state: string; count: number }>;
  stats: {
    total_businesses: number;
    total_categories: number;
    total_states: number;
    total_cities: number;
    featured_count: number;
    verified_count: number;
    average_rating: number;
    total_reviews: number;
  };
  lastUpdated: Date;
}

class BusinessCache {
  private static instance: BusinessCache;
  private cache: CacheData | null = null;
  private cacheTimeout: number = 5 * 60 * 1000; // 5 minutes
  private isLoading: boolean = false;

  private constructor() {}

  public static getInstance(): BusinessCache {
    if (!BusinessCache.instance) {
      BusinessCache.instance = new BusinessCache();
    }
    return BusinessCache.instance;
  }

  public async initialize(): Promise<void> {
    console.log('Initializing business cache...');
    await this.refresh();
  }

  public async refresh(): Promise<void> {
    if (this.isLoading) {
      console.log('Cache is already being refreshed...');
      return;
    }

    this.isLoading = true;
    
    try {
      // Check if database is configured
      if (!sql) {
        console.log('Database not configured, using empty cache');
        this.cache = {
          businesses: [],
          categories: [],
          states: [],
          cities: [],
          stats: {
            total_businesses: 0,
            total_categories: 0,
            total_states: 0,
            total_cities: 0,
            featured_count: 0,
            verified_count: 0,
            average_rating: 0,
            total_reviews: 0
          },
          lastUpdated: new Date()
        };
        return;
      }

      console.log('Fetching all businesses from database...');
      
      // Fetch all businesses
      const businesses = await sql<Business[]>`
        SELECT * FROM businesses
        ORDER BY is_featured DESC, rating DESC, reviews DESC
      `;

      // Get categories with counts
      const categories = await sql<Array<{ category: string; count: number }>>`
        SELECT 
          category,
          COUNT(*)::int as count
        FROM businesses
        GROUP BY category
        ORDER BY count DESC
      `;

      // Get states with counts
      const states = await sql<Array<{ state: string; count: number; city_count: number }>>`
        SELECT 
          state,
          COUNT(*)::int as count,
          COUNT(DISTINCT city)::int as city_count
        FROM businesses
        GROUP BY state
        ORDER BY count DESC
      `;

      // Get cities with counts
      const cities = await sql<Array<{ city: string; state: string; count: number }>>`
        SELECT 
          city,
          state,
          COUNT(*)::int as count
        FROM businesses
        GROUP BY city, state
        ORDER BY count DESC
        LIMIT 100
      `;

      // Get total stats
      const statsResult = await sql`
        SELECT 
          COUNT(*)::int as total_businesses,
          COUNT(DISTINCT category)::int as total_categories,
          COUNT(DISTINCT state)::int as total_states,
          COUNT(DISTINCT city)::int as total_cities,
          COUNT(CASE WHEN is_featured = true THEN 1 END)::int as featured_count,
          COUNT(CASE WHEN is_verified = true THEN 1 END)::int as verified_count,
          COALESCE(AVG(rating), 0)::float as average_rating,
          COALESCE(SUM(reviews), 0)::int as total_reviews
        FROM businesses
      `;

      const stats = statsResult[0] || {
        total_businesses: 0,
        total_categories: 0,
        total_states: 0,
        total_cities: 0,
        featured_count: 0,
        verified_count: 0,
        average_rating: 0,
        total_reviews: 0
      };

      this.cache = {
        businesses,
        categories,
        states,
        cities,
        stats,
        lastUpdated: new Date()
      };

      console.log(`Cache loaded: ${businesses.length} businesses, ${categories.length} categories, ${states.length} states, ${cities.length} cities`);
      
      // Schedule next refresh
      setTimeout(() => this.refresh(), this.cacheTimeout);
      
    } catch (error) {
      console.error('Error refreshing cache:', error);
    } finally {
      this.isLoading = false;
    }
  }

  public getBusinesses(filters?: {
    category?: string;
    state?: string;
    city?: string;
    featured?: boolean;
    verified?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
  }): Business[] {
    if (!this.cache) {
      console.warn('Cache not initialized, returning empty array');
      return [];
    }

    let filtered = [...this.cache.businesses];

    if (filters) {
      if (filters.category) {
        filtered = filtered.filter(b => b.category.toLowerCase() === filters.category!.toLowerCase());
      }
      if (filters.state) {
        filtered = filtered.filter(b => b.state.toLowerCase() === filters.state!.toLowerCase());
      }
      if (filters.city) {
        filtered = filtered.filter(b => b.city.toLowerCase() === filters.city!.toLowerCase());
      }
      if (filters.featured !== undefined) {
        filtered = filtered.filter(b => b.is_featured === filters.featured);
      }
      if (filters.verified !== undefined) {
        filtered = filtered.filter(b => b.is_verified === filters.verified);
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(b => 
          b.name.toLowerCase().includes(searchLower) ||
          b.description?.toLowerCase().includes(searchLower) ||
          b.category.toLowerCase().includes(searchLower) ||
          b.city.toLowerCase().includes(searchLower) ||
          b.state.toLowerCase().includes(searchLower)
        );
      }

      // Apply pagination
      const offset = filters.offset || 0;
      const limit = filters.limit || 50;
      filtered = filtered.slice(offset, offset + limit);
    }

    return filtered;
  }

  public getBusinessById(id: string): Business | undefined {
    if (!this.cache) return undefined;
    return this.cache.businesses.find(b => b.id === id);
  }

  public getCategories(): Array<{ category: string; count: number }> {
    if (!this.cache) return [];
    return this.cache.categories;
  }

  public getStates(): Array<{ state: string; count: number; city_count: number }> {
    if (!this.cache) return [];
    return this.cache.states;
  }

  public getCities(): Array<{ city: string; state: string; count: number }> {
    if (!this.cache) return [];
    return this.cache.cities;
  }

  public getCitiesByState(state: string): Array<{ city: string; state: string; count: number }> {
    if (!this.cache) return [];
    return this.cache.cities.filter(c => c.state.toLowerCase() === state.toLowerCase());
  }

  public getStats() {
    if (!this.cache) {
      return {
        total_businesses: 0,
        total_categories: 0,
        total_states: 0,
        total_cities: 0,
        featured_count: 0,
        verified_count: 0,
        average_rating: 0,
        total_reviews: 0
      };
    }
    return this.cache.stats;
  }

  public isInitialized(): boolean {
    return this.cache !== null;
  }

  public getLastUpdated(): Date | null {
    return this.cache?.lastUpdated || null;
  }

  // Invalidate cache and trigger refresh
  public async invalidate(): Promise<void> {
    console.log('Invalidating cache and refreshing...');
    this.cache = null;
    await this.refresh();
  }

  // Add a new business to cache without full refresh
  public addBusiness(business: Business): void {
    if (!this.cache) return;
    
    this.cache.businesses.push(business);
    
    // Update category count
    const existingCategory = this.cache.categories.find(c => c.category === business.category);
    if (existingCategory) {
      existingCategory.count++;
    } else {
      this.cache.categories.push({ category: business.category, count: 1 });
    }
    
    // Update state count
    const existingState = this.cache.states.find(s => s.state === business.state);
    if (existingState) {
      existingState.count++;
      // Check if this is a new city for this state
      const cityExists = this.cache.cities.some(c => c.city === business.city && c.state === business.state);
      if (!cityExists) {
        existingState.city_count++;
      }
    } else {
      this.cache.states.push({ state: business.state, count: 1, city_count: 1 });
    }
    
    // Update city count
    const existingCity = this.cache.cities.find(c => c.city === business.city && c.state === business.state);
    if (existingCity) {
      existingCity.count++;
    } else {
      this.cache.cities.push({ city: business.city, state: business.state, count: 1 });
    }
    
    // Update stats
    this.cache.stats.total_businesses++;
    if (business.is_featured) this.cache.stats.featured_count++;
    if (business.is_verified) this.cache.stats.verified_count++;
    if (business.rating && business.reviews) {
      // Recalculate average (simplified - in production, track sum separately)
      this.cache.stats.total_reviews += business.reviews;
    }
    
    this.cache.lastUpdated = new Date();
  }

  // Update a business in cache
  public updateBusiness(id: string, updates: Partial<Business>): void {
    if (!this.cache) return;
    
    const index = this.cache.businesses.findIndex(b => b.id === id);
    if (index === -1) return;
    
    const oldBusiness = this.cache.businesses[index];
    const newBusiness = { ...oldBusiness, ...updates, updated_at: new Date() };
    this.cache.businesses[index] = newBusiness;
    
    // If category changed, update counts
    if (updates.category && updates.category !== oldBusiness.category) {
      // Decrease old category count
      const oldCategory = this.cache.categories.find(c => c.category === oldBusiness.category);
      if (oldCategory && oldCategory.count > 0) {
        oldCategory.count--;
        if (oldCategory.count === 0) {
          this.cache.categories = this.cache.categories.filter(c => c.category !== oldBusiness.category);
        }
      }
      
      // Increase new category count
      const newCategory = this.cache.categories.find(c => c.category === updates.category);
      if (newCategory) {
        newCategory.count++;
      } else {
        this.cache.categories.push({ category: updates.category, count: 1 });
      }
    }
    
    // Update featured/verified counts if changed
    if (updates.is_featured !== undefined && updates.is_featured !== oldBusiness.is_featured) {
      this.cache.stats.featured_count += updates.is_featured ? 1 : -1;
    }
    if (updates.is_verified !== undefined && updates.is_verified !== oldBusiness.is_verified) {
      this.cache.stats.verified_count += updates.is_verified ? 1 : -1;
    }
    
    this.cache.lastUpdated = new Date();
  }

  // Remove a business from cache
  public removeBusiness(id: string): void {
    if (!this.cache) return;
    
    const index = this.cache.businesses.findIndex(b => b.id === id);
    if (index === -1) return;
    
    const business = this.cache.businesses[index];
    this.cache.businesses.splice(index, 1);
    
    // Update category count
    const category = this.cache.categories.find(c => c.category === business.category);
    if (category && category.count > 0) {
      category.count--;
      if (category.count === 0) {
        this.cache.categories = this.cache.categories.filter(c => c.category !== business.category);
      }
    }
    
    // Update state count
    const state = this.cache.states.find(s => s.state === business.state);
    if (state && state.count > 0) {
      state.count--;
      // Check if this was the last business in this city
      const cityBusinessCount = this.cache.businesses.filter(b => b.city === business.city && b.state === business.state).length;
      if (cityBusinessCount === 0) {
        state.city_count--;
      }
    }
    
    // Update city count
    const city = this.cache.cities.find(c => c.city === business.city && c.state === business.state);
    if (city && city.count > 0) {
      city.count--;
      if (city.count === 0) {
        this.cache.cities = this.cache.cities.filter(c => !(c.city === business.city && c.state === business.state));
      }
    }
    
    // Update stats
    this.cache.stats.total_businesses--;
    if (business.is_featured) this.cache.stats.featured_count--;
    if (business.is_verified) this.cache.stats.verified_count--;
    if (business.reviews) {
      this.cache.stats.total_reviews -= business.reviews;
    }
    
    this.cache.lastUpdated = new Date();
  }
}

// Export singleton instance
export const businessCache = BusinessCache.getInstance();

// Initialize cache on module load
if (typeof window === 'undefined') {
  // Server-side only
  businessCache.initialize().catch(console.error);
}