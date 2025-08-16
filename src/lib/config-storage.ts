import fs from 'fs/promises';
import path from 'path';

// In production, this would be replaced with a database
const CONFIG_DIR = path.join(process.cwd(), 'data');
const CONFIG_FILE = path.join(CONFIG_DIR, 'site-config.json');
const THEMES_FILE = path.join(CONFIG_DIR, 'themes.json');

// Default configuration that ships with the base code
export const defaultConfig = {
  businessName: "ServiceHub",
  tagline: "Find Trusted Local Service Providers",
  description: "Connect with top-rated professionals in your area",
  logo: "/logo.svg",
  niche: "general", // general, home-services, healthcare, education, etc.

  mainService: {
    singular: "Service",
    plural: "Services",
    action: "Book",
  },

  hero: {
    headline: "Find the Perfect Service Provider for Your Needs",
    subheadline: "Connect with verified professionals in your hometown",
    ctaText: "Find Pros",
    placeholderText: "Enter your zip code",
    backgroundImage: "https://ext.same-assets.com/1079325698/1819760783.webp",
  },

  serviceCategories: [
    {
      id: "category-1",
      title: "Category 1",
      description: "Description for category 1",
      image: "https://ext.same-assets.com/1079325698/3377177075.webp",
      icon: "📦",
    },
    {
      id: "category-2",
      title: "Category 2",
      description: "Description for category 2",
      image: "https://ext.same-assets.com/1079325698/4115846507.webp",
      icon: "⭐",
    },
    {
      id: "category-3",
      title: "Category 3",
      description: "Description for category 3",
      image: "https://ext.same-assets.com/1079325698/3414646618.webp",
      icon: "🏢",
    },
  ],

  theme: "default",
  customColors: null,
};

// Default themes that ship with the base code
export const defaultThemes = {
  default: {
    name: "Default",
    primary: "#FF8C00",
    secondary: "#2C3E50",
    accent: "#8BC34A",
    background: "#FFFFFF",
    foreground: "#1A1A1A",
  },
  professional: {
    name: "Professional",
    primary: "#2C3E50",
    secondary: "#34495E",
    accent: "#3498DB",
    background: "#FFFFFF",
    foreground: "#2C3E50",
  },
  modern: {
    name: "Modern",
    primary: "#6366F1",
    secondary: "#4F46E5",
    accent: "#EC4899",
    background: "#FFFFFF",
    foreground: "#111827",
  },
  custom: {
    name: "Custom",
    primary: "#000000",
    secondary: "#000000",
    accent: "#000000",
    background: "#FFFFFF",
    foreground: "#000000",
  },
};

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(CONFIG_DIR);
  } catch {
    await fs.mkdir(CONFIG_DIR, { recursive: true });
  }
}

// Load configuration from storage
export async function loadConfig() {
  await ensureDataDir();

  try {
    const data = await fs.readFile(CONFIG_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    // If no config exists, return default
    return defaultConfig;
  }
}

// Save configuration to storage
export async function saveConfig(config: any) {
  await ensureDataDir();
  await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
  return config;
}

// Load themes from storage
export async function loadThemes() {
  await ensureDataDir();

  try {
    const data = await fs.readFile(THEMES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    // If no themes exist, return defaults
    return defaultThemes;
  }
}

// Save themes to storage
export async function saveThemes(themes: any) {
  await ensureDataDir();
  await fs.writeFile(THEMES_FILE, JSON.stringify(themes, null, 2));
  return themes;
}

// Get niche templates (pre-configured settings for different industries)
export const nicheTemplates = {
  general: {
    name: "General Services",
    config: defaultConfig,
  },
  "home-services": {
    name: "Home Services",
    config: {
      ...defaultConfig,
      businessName: "HomePro Services",
      tagline: "Your Trusted Home Service Experts",
      description: "Find reliable professionals for all your home maintenance and repair needs",
      niche: "home-services",
      mainService: {
        singular: "Home Service",
        plural: "Home Services",
        action: "Book",
      },
      hero: {
        ...defaultConfig.hero,
        headline: "Find Trusted Home Service Professionals",
        subheadline: "From plumbing to electrical, we connect you with verified experts",
      },
      serviceCategories: [
        {
          id: "plumbing",
          title: "Plumbing Services",
          description: "Expert plumbers for all your needs",
          image: "https://ext.same-assets.com/1079325698/3377177075.webp",
          icon: "🔧",
        },
        {
          id: "electrical",
          title: "Electrical Services",
          description: "Licensed electricians you can trust",
          image: "https://ext.same-assets.com/1079325698/4115846507.webp",
          icon: "⚡",
        },
        {
          id: "hvac",
          title: "HVAC Services",
          description: "Heating and cooling specialists",
          image: "https://ext.same-assets.com/1079325698/3414646618.webp",
          icon: "❄️",
        },
      ],
    },
  },
  healthcare: {
    name: "Healthcare Services",
    config: {
      ...defaultConfig,
      businessName: "HealthConnect",
      tagline: "Your Health, Our Priority",
      description: "Connect with healthcare professionals in your area",
      niche: "healthcare",
      mainService: {
        singular: "Healthcare Service",
        plural: "Healthcare Services",
        action: "Schedule",
      },
      hero: {
        ...defaultConfig.hero,
        headline: "Find Healthcare Providers Near You",
        subheadline: "Book appointments with trusted medical professionals",
        ctaText: "Find Doctors",
        placeholderText: "Enter your location or specialty",
      },
      serviceCategories: [
        {
          id: "primary-care",
          title: "Primary Care",
          description: "General practitioners and family doctors",
          image: "https://ext.same-assets.com/1079325698/3377177075.webp",
          icon: "👨‍⚕️",
        },
        {
          id: "specialists",
          title: "Specialists",
          description: "Expert care for specific conditions",
          image: "https://ext.same-assets.com/1079325698/4115846507.webp",
          icon: "🏥",
        },
        {
          id: "urgent-care",
          title: "Urgent Care",
          description: "Immediate medical attention",
          image: "https://ext.same-assets.com/1079325698/3414646618.webp",
          icon: "🚑",
        },
      ],
    },
  },
  education: {
    name: "Education & Tutoring",
    config: {
      ...defaultConfig,
      businessName: "EduConnect",
      tagline: "Learn from the Best",
      description: "Find qualified tutors and educators in your area",
      niche: "education",
      mainService: {
        singular: "Tutor",
        plural: "Tutors",
        action: "Find",
      },
      hero: {
        ...defaultConfig.hero,
        headline: "Find Expert Tutors for Every Subject",
        subheadline: "Personalized learning with qualified educators",
        ctaText: "Find Tutors",
        placeholderText: "Enter subject or grade level",
      },
      serviceCategories: [
        {
          id: "academic",
          title: "Academic Tutoring",
          description: "Math, Science, English, and more",
          image: "https://ext.same-assets.com/1079325698/3377177075.webp",
          icon: "📚",
        },
        {
          id: "test-prep",
          title: "Test Preparation",
          description: "SAT, ACT, GRE, and other exams",
          image: "https://ext.same-assets.com/1079325698/4115846507.webp",
          icon: "📝",
        },
        {
          id: "skills",
          title: "Skill Development",
          description: "Music, arts, coding, and languages",
          image: "https://ext.same-assets.com/1079325698/3414646618.webp",
          icon: "🎨",
        },
      ],
    },
  },
  "dumpster-rental": {
    name: "Dumpster & Equipment Rental",
    config: {
      ...defaultConfig,
      businessName: "Hometown Dumpster Rental",
      tagline: "America's #1 Source for Dumpsters and Junk Removal",
      description: "Find the top dumpster rental companies serving your hometown",
      niche: "dumpster-rental",
      mainService: {
        singular: "Dumpster",
        plural: "Dumpsters",
        action: "Rent",
      },
      hero: {
        ...defaultConfig.hero,
        headline: "Rent a Dumpster & Be Free of Your Debris",
        subheadline: "Find the top dumpster rental companies serving your hometown",
        ctaText: "Find Pros",
        placeholderText: "Enter Zip Code",
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
    },
  },
};
