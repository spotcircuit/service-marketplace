import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/neon';

// Default configuration that's always available
const defaultConfig = {
  businessName: "Hometown Dumpster Rental",
  tagline: "America's #1 Source for Dumpsters and Junk Removal",
  description: "Find the top dumpster rental companies serving your hometown",
  logo: "/logo.svg",
  niche: "dumpster-rental",
  mainService: {
    singular: "Dumpster",
    plural: "Dumpsters",
    action: "Rent",
  },
  hero: {
    headline: "Rent a Dumpster & Be Free of Your Debris",
    subheadline: "Find the top dumpster rental companies serving your hometown",
    ctaText: "Find Pros",
    placeholderText: "Enter Zip Code",
    backgroundImage: "https://ext.same-assets.com/1079325698/1819760783.webp",
  },
  serviceCategories: [
    {
      id: "temporary",
      title: "Temporary Dumpster Rental",
      description: "Short-term waste management solutions",
      image: "https://ext.same-assets.com/1079325698/3377177075.webp",
      icon: "🚚",
    },
    {
      id: "junk-removal",
      title: "Full Service Junk Removal",
      description: "We haul it all away for you",
      image: "https://ext.same-assets.com/1079325698/4115846507.webp",
      icon: "🏠",
    },
    {
      id: "commercial",
      title: "Permanent Commercial Dumpsters",
      description: "Long-term waste solutions for businesses",
      image: "https://ext.same-assets.com/1079325698/3414646618.webp",
      icon: "🏢",
    },
  ],
  theme: {
    primaryColor: "#FF8C00",
    secondaryColor: "#2C3E50",
    accentColor: "#8BC34A",
    backgroundColor: "#FFFFFF",
    foregroundColor: "#1A1A1A",
  },
};

// GET: Fetch current configuration
export async function GET() {
  try {
    // Load configuration from database
    const configs = await sql`
      SELECT key, value, category
      FROM site_configurations
      ORDER BY category, key
    `;

    // If no configs in database, return defaults
    if (!configs || configs.length === 0) {
      return NextResponse.json(defaultConfig);
    }

    // Build config object from database values
    const configFromDb: any = { ...defaultConfig };
    
    configs.forEach((config: any) => {
      let value = config.value;
      
      // Try to parse as JSON if it's a string and looks like JSON
      if (typeof config.value === 'string') {
        try {
          // Only parse if it starts with { or [ or is a boolean/number/null
          const trimmed = config.value.trim();
          if (trimmed.startsWith('{') || trimmed.startsWith('[') || 
              trimmed === 'true' || trimmed === 'false' || 
              trimmed === 'null' || !isNaN(Number(trimmed))) {
            value = JSON.parse(config.value);
          }
        } catch (e) {
          // If parsing fails, keep as string
          value = config.value;
        }
      }
      
      switch(config.key) {
        case 'site_name':
          configFromDb.siteName = value;
          configFromDb.businessName = value;
          break;
        case 'site_tagline':
          configFromDb.siteTagline = value;
          configFromDb.tagline = value;
          break;
        case 'contact_email':
          configFromDb.contactEmail = value;
          break;
        case 'contact_phone':
          configFromDb.contactPhone = value;
          break;
        case 'hero_title':
          configFromDb.heroTitle = value;
          if (!configFromDb.hero) configFromDb.hero = {};
          configFromDb.hero.headline = value;
          break;
        case 'hero_subtitle':
          configFromDb.heroSubtitle = value;
          if (!configFromDb.hero) configFromDb.hero = {};
          configFromDb.hero.subheadline = value;
          break;
        case 'primary_color':
          if (!configFromDb.theme || typeof configFromDb.theme === 'string') {
            configFromDb.theme = {};
          }
          configFromDb.theme.primaryColor = value;
          break;
        case 'secondary_color':
          if (!configFromDb.theme || typeof configFromDb.theme === 'string') {
            configFromDb.theme = {};
          }
          configFromDb.theme.secondaryColor = value;
          break;
        case 'accent_color':
          if (!configFromDb.theme || typeof configFromDb.theme === 'string') {
            configFromDb.theme = {};
          }
          configFromDb.theme.accentColor = value;
          break;
        case 'background_color':
          if (!configFromDb.theme || typeof configFromDb.theme === 'string') {
            configFromDb.theme = {};
          }
          configFromDb.theme.backgroundColor = value;
          break;
        case 'foreground_color':
          if (!configFromDb.theme || typeof configFromDb.theme === 'string') {
            configFromDb.theme = {};
          }
          configFromDb.theme.foregroundColor = value;
          break;
        case 'categories':
          configFromDb.categories = value;
          break;
      }
    });

    return NextResponse.json(configFromDb);
  } catch (error) {
    console.error('Error loading config from database:', error);
    // If database error, return default config
    return NextResponse.json(defaultConfig);
  }
}

// POST: Update configuration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Handle niche template loading
    if (body.loadTemplate) {
      const { nicheTemplates } = await import('@/lib/config-storage');
      if (nicheTemplates[body.loadTemplate as keyof typeof nicheTemplates]) {
        const template = nicheTemplates[body.loadTemplate as keyof typeof nicheTemplates];
        // Save template config to database
        const configItems = [
          { key: 'site_name', value: template.config.businessName },
          { key: 'site_tagline', value: template.config.tagline },
          { key: 'hero_title', value: template.config.hero?.headline },
          { key: 'hero_subtitle', value: template.config.hero?.subheadline },
        ];

        for (const item of configItems) {
          if (item.value) {
            await sql`
              INSERT INTO site_configurations (key, value, category)
              VALUES (${item.key}, ${JSON.stringify(item.value)}, 'general')
              ON CONFLICT (key)
              DO UPDATE SET value = ${JSON.stringify(item.value)}, updated_at = NOW()
            `;
          }
        }

        return NextResponse.json({
          success: true,
          config: template.config,
          message: `Loaded ${template.name} template`
        });
      }
    }

    // Save individual configuration updates to database
    const configMappings = [
      { field: 'siteName', key: 'site_name', category: 'general' },
      { field: 'businessName', key: 'site_name', category: 'general' },
      { field: 'siteTagline', key: 'site_tagline', category: 'general' },
      { field: 'tagline', key: 'site_tagline', category: 'general' },
      { field: 'contactEmail', key: 'contact_email', category: 'general' },
      { field: 'contactPhone', key: 'contact_phone', category: 'general' },
      { field: 'heroTitle', key: 'hero_title', category: 'hero' },
      { field: 'heroSubtitle', key: 'hero_subtitle', category: 'hero' },
      { field: 'categories', key: 'categories', category: 'general' },
    ];

    // Handle nested hero object
    if (body.hero) {
      if (body.hero.headline) {
        await sql`
          INSERT INTO site_configurations (key, value, category)
          VALUES ('hero_title', ${JSON.stringify(body.hero.headline)}, 'hero')
          ON CONFLICT (key)
          DO UPDATE SET value = ${JSON.stringify(body.hero.headline)}, updated_at = NOW()
        `;
      }
      if (body.hero.subheadline) {
        await sql`
          INSERT INTO site_configurations (key, value, category)
          VALUES ('hero_subtitle', ${JSON.stringify(body.hero.subheadline)}, 'hero')
          ON CONFLICT (key)
          DO UPDATE SET value = ${JSON.stringify(body.hero.subheadline)}, updated_at = NOW()
        `;
      }
    }

    // Handle theme colors
    if (body.theme) {
      if (body.theme.primaryColor) {
        await sql`
          INSERT INTO site_configurations (key, value, category)
          VALUES ('primary_color', ${JSON.stringify(body.theme.primaryColor)}, 'theme')
          ON CONFLICT (key)
          DO UPDATE SET value = ${JSON.stringify(body.theme.primaryColor)}, updated_at = NOW()
        `;
      }
      if (body.theme.secondaryColor) {
        await sql`
          INSERT INTO site_configurations (key, value, category)
          VALUES ('secondary_color', ${JSON.stringify(body.theme.secondaryColor)}, 'theme')
          ON CONFLICT (key)
          DO UPDATE SET value = ${JSON.stringify(body.theme.secondaryColor)}, updated_at = NOW()
        `;
      }
      if (body.theme.accentColor) {
        await sql`
          INSERT INTO site_configurations (key, value, category)
          VALUES ('accent_color', ${JSON.stringify(body.theme.accentColor)}, 'theme')
          ON CONFLICT (key)
          DO UPDATE SET value = ${JSON.stringify(body.theme.accentColor)}, updated_at = NOW()
        `;
      }
      if (body.theme.backgroundColor) {
        await sql`
          INSERT INTO site_configurations (key, value, category)
          VALUES ('background_color', ${JSON.stringify(body.theme.backgroundColor)}, 'theme')
          ON CONFLICT (key)
          DO UPDATE SET value = ${JSON.stringify(body.theme.backgroundColor)}, updated_at = NOW()
        `;
      }
      if (body.theme.foregroundColor) {
        await sql`
          INSERT INTO site_configurations (key, value, category)
          VALUES ('foreground_color', ${JSON.stringify(body.theme.foregroundColor)}, 'theme')
          ON CONFLICT (key)
          DO UPDATE SET value = ${JSON.stringify(body.theme.foregroundColor)}, updated_at = NOW()
        `;
      }
    }

    // Save other fields
    for (const mapping of configMappings) {
      if (body[mapping.field] !== undefined) {
        await sql`
          INSERT INTO site_configurations (key, value, category)
          VALUES (${mapping.key}, ${JSON.stringify(body[mapping.field])}, ${mapping.category})
          ON CONFLICT (key)
          DO UPDATE SET value = ${JSON.stringify(body[mapping.field])}, updated_at = NOW()
        `;
      }
    }

    // Return the updated configuration
    const getResponse = await GET();
    const updatedConfig = await getResponse.json();
    
    return NextResponse.json({ 
      success: true, 
      config: updatedConfig,
      message: 'Configuration saved to database'
    });
  } catch (error) {
    console.error('Error saving configuration:', error);
    return NextResponse.json(
      { error: 'Failed to save configuration' },
      { status: 500 }
    );
  }
}

// PUT: Reset to default configuration
export async function PUT() {
  return NextResponse.json({
    success: true,
    config: defaultConfig,
    message: 'Configuration reset to defaults'
  });
}
