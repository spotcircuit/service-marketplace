import { NextRequest, NextResponse } from 'next/server';

// Default themes that are always available
const defaultThemes = {
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

// GET: Fetch all themes
export async function GET() {
  try {
    // Try to load from file system if available (development)
    if (process.env.NODE_ENV === 'development') {
      try {
        const { loadThemes } = await import('@/lib/config-storage');
        const themes = await loadThemes();
        return NextResponse.json(themes);
      } catch {
        // Fall through to default themes
      }
    }

    // In production, return default themes
    return NextResponse.json(defaultThemes);
  } catch (error) {
    // If any error, return default themes
    return NextResponse.json(defaultThemes);
  }
}

// POST: Save or update themes
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Only save to file system in development
    if (process.env.NODE_ENV === 'development') {
      try {
        const { saveThemes } = await import('@/lib/config-storage');
        const themes = await saveThemes(body);
        return NextResponse.json({ success: true, themes });
      } catch {
        // Fall through to return without saving
      }
    }

    // In production, just return the themes without saving
    return NextResponse.json({
      success: true,
      themes: body,
      message: 'Themes updated (session only in production)'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save themes' },
      { status: 500 }
    );
  }
}

// PUT: Reset to default themes
export async function PUT() {
  return NextResponse.json({
    success: true,
    themes: defaultThemes,
    message: 'Themes reset to defaults'
  });
}
