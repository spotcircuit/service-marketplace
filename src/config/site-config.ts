// Site Configuration - Customize this file to match your business
export const siteConfig = {
  // Basic Information
  businessName: "ServiceHub",
  tagline: "Find Trusted Local Service Providers",
  description: "Connect with top-rated professionals in your area",
  logo: "/logo.svg", // You can replace with your logo

  // Service Configuration
  mainService: {
    singular: "Service",
    plural: "Services",
    action: "Book", // e.g., Book, Rent, Hire
  },

  // Hero Section
  hero: {
    headline: "Find the Perfect Service Provider for Your Needs",
    subheadline: "Connect with verified professionals in your hometown",
    ctaText: "Find Pros",
    placeholderText: "Enter your zip code",
    backgroundImage: "https://ext.same-assets.com/1079325698/1819760783.webp",
  },

  // Service Categories
  serviceCategories: [
    {
      id: "temporary",
      title: "On-Demand Services",
      description: "Quick and flexible solutions",
      image: "https://ext.same-assets.com/1079325698/3377177075.webp",
      icon: "🚚",
    },
    {
      id: "full-service",
      title: "Full Service Solutions",
      description: "Complete end-to-end service",
      image: "https://ext.same-assets.com/1079325698/4115846507.webp",
      icon: "🏠",
    },
    {
      id: "commercial",
      title: "Business Solutions",
      description: "Tailored for commercial needs",
      image: "https://ext.same-assets.com/1079325698/3414646618.webp",
      icon: "🏢",
    },
  ],

  // Popular Services
  popularServices: [
    { id: "s1", name: "Standard Package", icon: "📦", category: "basic" },
    { id: "s2", name: "Premium Service", icon: "⭐", category: "premium" },
    { id: "s3", name: "Express Delivery", icon: "⚡", category: "express" },
    { id: "s4", name: "Custom Solutions", icon: "🎯", category: "custom" },
    { id: "s5", name: "Emergency Service", icon: "🚨", category: "emergency" },
    { id: "s6", name: "Consultation", icon: "💬", category: "consultation" },
    { id: "s7", name: "Maintenance", icon: "🔧", category: "maintenance" },
    { id: "s8", name: "Installation", icon: "🔨", category: "installation" },
    { id: "s9", name: "Removal Service", icon: "🚛", category: "removal" },
    { id: "s10", name: "Cleaning Service", icon: "🧹", category: "cleaning" },
    { id: "s11", name: "Repair Service", icon: "🔩", category: "repair" },
    { id: "s12", name: "Assessment", icon: "📋", category: "assessment" },
  ],

  // How It Works
  howItWorks: [
    {
      step: 1,
      title: "Describe Your Needs",
      description: "Tell us what service you're looking for",
      icon: "📝",
    },
    {
      step: 2,
      title: "Get Matched",
      description: "We connect you with qualified professionals",
      icon: "🤝",
    },
    {
      step: 3,
      title: "Choose & Book",
      description: "Compare options and book the right pro",
      icon: "✅",
    },
  ],

  // Navigation
  navigation: {
    main: [
      { name: "Find Services", href: "/services" },
      { name: "How It Works", href: "/how-it-works" },
      { name: "Resources", href: "/resources" },
      { name: "For Professionals", href: "/professionals" },
    ],
    footer: {
      customers: [
        { name: "How It Works", href: "/how-it-works" },
        { name: "Tips & Resources", href: "/resources" },
      ],
      professionals: [
        { name: "Join Our Network", href: "/join" },
        { name: "Success Stories", href: "/success-stories" },
        { name: "Partner Portal", href: "/portal" },
      ],
      company: [
        { name: "About Us", href: "/about" },
        { name: "Contact", href: "/contact" },
        { name: "Careers", href: "/careers" },
      ],
    },
  },

  // Social Media
  social: {
    facebook: "https://facebook.com",
    twitter: "https://twitter.com",
    linkedin: "https://linkedin.com",
    instagram: "https://instagram.com",
  },

  // SEO
  seo: {
    keywords: ["local services", "professional services", "trusted providers"],
    author: "ServiceHub Team",
  },
};

// Theme Configuration
export const themes = {
  default: {
    name: "Default",
    primary: "#FF8C00", // Orange
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
  eco: {
    name: "Eco Friendly",
    primary: "#10B981",
    secondary: "#059669",
    accent: "#84CC16",
    background: "#FFFFFF",
    foreground: "#064E3B",
  },
  luxury: {
    name: "Luxury",
    primary: "#D97706",
    secondary: "#92400E",
    accent: "#FCD34D",
    background: "#FFFBEB",
    foreground: "#451A03",
  },
  tech: {
    name: "Tech",
    primary: "#8B5CF6",
    secondary: "#7C3AED",
    accent: "#06B6D4",
    background: "#FFFFFF",
    foreground: "#1E1B4B",
  },
  health: {
    name: "Healthcare",
    primary: "#0EA5E9",
    secondary: "#0284C7",
    accent: "#10B981",
    background: "#F0F9FF",
    foreground: "#0C4A6E",
  },
  construction: {
    name: "Construction",
    primary: "#EA580C",
    secondary: "#DC2626",
    accent: "#FCD34D",
    background: "#FFFFFF",
    foreground: "#18181B",
  },
};

// Location Data
export const popularCities = [
  "New York", "Los Angeles", "Chicago", "Houston", "Phoenix",
  "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose",
  "Austin", "Jacksonville", "Fort Worth", "Columbus", "San Francisco",
  "Charlotte", "Indianapolis", "Seattle", "Denver", "Boston",
  "El Paso", "Detroit", "Washington", "Nashville", "Memphis",
  "Portland", "Oklahoma City", "Las Vegas", "Louisville", "Baltimore",
  "Milwaukee", "Albuquerque", "Tucson", "Fresno", "Mesa",
  "Sacramento", "Atlanta", "Kansas City", "Colorado Springs", "Miami",
  "Raleigh", "Omaha", "Long Beach", "Virginia Beach", "Oakland",
];

// States for dropdown
export const states = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California",
  "Colorado", "Connecticut", "Delaware", "Florida", "Georgia",
  "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland",
  "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri",
  "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey",
  "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
  "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina",
  "South Dakota", "Tennessee", "Texas", "Utah", "Vermont",
  "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming",
];
