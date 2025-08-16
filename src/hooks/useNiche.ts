'use client';

import { useState, useEffect } from 'react';
import type { NicheConfig } from '@/lib/niche-config';

export function useNiche() {
  const [niche, setNiche] = useState<NicheConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNicheConfig();
  }, []);

  const fetchNicheConfig = async () => {
    try {
      const response = await fetch('/api/niche');
      if (response.ok) {
        const data = await response.json();
        setNiche(data);
      }
    } catch (error) {
      console.error('Error fetching niche config:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to replace variables in text
  const replaceVariables = (text: string, variables: Record<string, string> = {}): string => {
    if (!niche) return text;
    
    let result = text;
    
    // Replace terminology variables
    result = result.replace(/{terminology\.service\.singular}/gi, niche.terminology.service.singular);
    result = result.replace(/{terminology\.service\.plural}/gi, niche.terminology.service.plural);
    result = result.replace(/{terminology\.service\.action}/gi, niche.terminology.service.action);
    result = result.replace(/{terminology\.service\.provider}/gi, niche.terminology.service.provider);
    result = result.replace(/{terminology\.service\.providers}/gi, niche.terminology.service.providers);
    result = result.replace(/{terminology\.quote\.action}/gi, niche.terminology.quote.action);
    result = result.replace(/{terminology\.project\.singular}/gi, niche.terminology.project.singular);
    
    // Replace custom variables
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{${key}}`, 'gi');
      result = result.replace(regex, value);
    });
    
    return result;
  };

  // Check if a resource is enabled for current niche
  const isResourceEnabled = (slug: string): boolean => {
    if (!niche) return false;
    
    const guides = niche.resources.guides.find(g => g.slug === slug);
    if (guides) return guides.enabled;
    
    const calculators = niche.resources.calculators.find(c => c.slug === slug);
    if (calculators) return calculators.enabled;
    
    return false;
  };

  // Get category by slug
  const getCategory = (slug: string) => {
    if (!niche) return null;
    return niche.categories.find(c => c.slug === slug);
  };

  return {
    niche,
    loading,
    terminology: niche?.terminology,
    categories: niche?.categories || [],
    resources: niche?.resources,
    faqs: niche?.faqs || [],
    hero: niche?.hero,
    meta: niche?.meta,
    pricing: niche?.pricing,
    sizes: niche?.sizes || [],
    replaceVariables,
    isResourceEnabled,
    getCategory
  };
}