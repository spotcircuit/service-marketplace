'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, 
  ArrowRight, 
  Building2,
  MapPin,
  Star,
  Filter,
  Grid,
  List
} from 'lucide-react';
import { useNiche } from '@/hooks/useNiche';

interface ServiceCategory {
  name: string;
  slug: string;
  description: string;
  providerCount?: number;
  icon?: string;
}

export default function ServicesPage() {
  const { niche, terminology, categories } = useNiche();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCategories, setFilteredCategories] = useState<ServiceCategory[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchServiceStats();
  }, []);

  useEffect(() => {
    // Filter categories based on search
    if (searchQuery) {
      const filtered = categories.filter(cat => 
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(categories);
    }
  }, [searchQuery, categories]);

  const fetchServiceStats = async () => {
    try {
      const response = await fetch('/api/businesses/stats');
      const data = await response.json();
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-muted border-b">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-2">All Services</h1>
          <p className="text-muted-foreground">
            Browse our complete list of {terminology?.service.plural.toLowerCase() || 'services'}
          </p>
        </div>
      </div>

      {/* Search and Controls */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
              title="Grid view"
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
              title="List view"
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-4 text-sm text-muted-foreground">
          Showing {filteredCategories.length} of {categories.length} services
        </div>
      </div>

      {/* Services Grid/List */}
      <div className="container mx-auto px-4 pb-12">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCategories.map((category) => (
              <Link
                key={category.slug}
                href={`/services/${category.slug}`}
                className="bg-card rounded-lg border hover:border-primary hover:shadow-lg transition-all p-6 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                
                <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
                
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {category.description || `Find trusted ${category.name.toLowerCase()} providers in your area`}
                </p>
                
                <div className="text-xs text-muted-foreground">
                  Click to browse providers →
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCategories.map((category) => (
              <Link
                key={category.slug}
                href={`/services/${category.slug}`}
                className="bg-card rounded-lg border hover:border-primary hover:shadow-md transition-all p-6 flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {category.description || `Find trusted ${category.name.toLowerCase()} providers`}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            ))}
          </div>
        )}

        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No services found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or browse all services
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>

      {/* Stats Section */}
      {stats && (
        <div className="bg-muted border-t">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold">{categories.length}</div>
                <div className="text-sm text-muted-foreground">Service Categories</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.total_businesses || 0}</div>
                <div className="text-sm text-muted-foreground">Total Providers</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.total_cities || 0}</div>
                <div className="text-sm text-muted-foreground">Cities Served</div>
              </div>
              <div>
                <div className="text-2xl font-bold flex items-center justify-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  {stats.average_rating ? Number(stats.average_rating).toFixed(1) : '4.8'}
                </div>
                <div className="text-sm text-muted-foreground">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}