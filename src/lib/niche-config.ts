import fs from 'fs';
import path from 'path';

export interface NicheConfig {
  id: string;
  name: string;
  terminology: {
    service: {
      singular: string;
      plural: string;
      action: string;
      actionPast: string;
      provider: string;
      providers: string;
    };
    quote: {
      singular: string;
      plural: string;
      action: string;
      received: string;
    };
    project: {
      singular: string;
      plural: string;
    };
  };
  categories: Array<{
    slug: string;
    name: string;
    description: string;
    keywords: string[];
  }>;
  sizes?: Array<{
    id: string;
    name: string;
    dimensions: string;
    capacity: string;
    typical: string;
    weight: string;
  }>;
  resources: {
    guides: Array<{
      slug: string;
      title: string;
      description: string;
      enabled: boolean;
    }>;
    calculators: Array<{
      slug: string;
      title: string;
      description: string;
      enabled: boolean;
    }>;
  };
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  hero: {
    headline: string;
    subheadline: string;
    ctaText: string;
    searchPlaceholder: string;
  };
  meta: {
    titleTemplate: string;
    descriptionTemplate: string;
    keywords: string[];
  };
  pricing: {
    factors: string[];
    typical: Record<string, any>;
  };
}

class NicheConfigLoader {
  private static instance: NicheConfigLoader;
  private config: NicheConfig | null = null;
  private configPath: string;

  private constructor() {
    this.configPath = path.join(process.cwd(), 'config');
  }

  public static getInstance(): NicheConfigLoader {
    if (!NicheConfigLoader.instance) {
      NicheConfigLoader.instance = new NicheConfigLoader();
    }
    return NicheConfigLoader.instance;
  }

  public loadConfig(): NicheConfig {
    if (this.config) {
      return this.config;
    }

    try {
      // Read active niche file
      const activeNichePath = path.join(this.configPath, 'active-niche.json');
      const activeNicheContent = fs.readFileSync(activeNichePath, 'utf-8');
      const { activeNiche } = JSON.parse(activeNicheContent);

      // Load the niche configuration
      const nichePath = path.join(this.configPath, 'niches', `${activeNiche}.json`);
      const nicheContent = fs.readFileSync(nichePath, 'utf-8');
      this.config = JSON.parse(nicheContent);

      console.log(`Loaded niche configuration: ${activeNiche}`);
      return this.config!;
    } catch (error) {
      console.error('Error loading niche configuration:', error);
      // Return default dumpster rental config if error
      return this.getDefaultConfig();
    }
  }

  public reloadConfig(): void {
    this.config = null;
    this.loadConfig();
  }

  public getConfig(): NicheConfig {
    if (!this.config) {
      this.loadConfig();
    }
    return this.config!;
  }

  // Replace template variables in text
  public replaceVariables(text: string, variables: Record<string, string> = {}): string {
    let result = text;
    
    // Replace terminology variables
    if (this.config) {
      result = result.replace(/{terminology\.service\.singular}/gi, this.config.terminology.service.singular);
      result = result.replace(/{terminology\.service\.plural}/gi, this.config.terminology.service.plural);
      result = result.replace(/{terminology\.service\.action}/gi, this.config.terminology.service.action);
      result = result.replace(/{terminology\.service\.provider}/gi, this.config.terminology.service.provider);
      result = result.replace(/{terminology\.service\.providers}/gi, this.config.terminology.service.providers);
      result = result.replace(/{terminology\.quote\.action}/gi, this.config.terminology.quote.action);
      result = result.replace(/{terminology\.project\.singular}/gi, this.config.terminology.project.singular);
    }
    
    // Replace custom variables
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{${key}}`, 'gi');
      result = result.replace(regex, value);
    });
    
    return result;
  }

  private getDefaultConfig(): NicheConfig {
    return {
      id: 'dumpster-rental',
      name: 'Dumpster Rental Services',
      terminology: {
        service: {
          singular: 'Dumpster',
          plural: 'Dumpsters',
          action: 'Rent',
          actionPast: 'Rented',
          provider: 'Rental Company',
          providers: 'Rental Companies'
        },
        quote: {
          singular: 'Rental Quote',
          plural: 'Rental Quotes',
          action: 'Get Quote',
          received: 'Quote Request Received'
        },
        project: {
          singular: 'Cleanup Project',
          plural: 'Cleanup Projects'
        }
      },
      categories: [],
      resources: { guides: [], calculators: [] },
      faqs: [],
      hero: {
        headline: 'Find Service Providers Near You',
        subheadline: 'Connect with trusted professionals',
        ctaText: 'Get Quotes',
        searchPlaceholder: 'Enter ZIP code'
      },
      meta: {
        titleTemplate: '{location} Services | {businessName}',
        descriptionTemplate: 'Find services in {location}',
        keywords: []
      },
      pricing: {
        factors: [],
        typical: {}
      }
    };
  }
}

// Export singleton instance
export const nicheConfig = NicheConfigLoader.getInstance();

// Helper function for components
export function getNicheConfig(): NicheConfig {
  return nicheConfig.getConfig();
}

// Helper function to replace variables
export function replaceNicheVariables(text: string, variables: Record<string, string> = {}): string {
  return nicheConfig.replaceVariables(text, variables);
}