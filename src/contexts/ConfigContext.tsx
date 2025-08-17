"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface ConfigContextType {
  config: any;
  themes: any;
  loading: boolean;
  error: string | null;
  reloadConfig: () => Promise<void>;
  updateConfig: (newConfig: any) => Promise<void>;
  applyNicheTemplate: (niche: string) => Promise<void>;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<any>(null);
  const [themes, setThemes] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load configuration from API
  const loadConfig = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch configuration
      const configResponse = await fetch('/api/config');
      if (!configResponse.ok) throw new Error('Failed to load configuration');
      const configData = await configResponse.json();

      // Fetch themes
      const themesResponse = await fetch('/api/themes');
      if (!themesResponse.ok) throw new Error('Failed to load themes');
      const themesData = await themesResponse.json();

      setConfig(configData);
      setThemes(themesData);

      // Apply theme if specified: support preset key or custom colors
      const cfgTheme = (configData as any).theme;
      if (typeof cfgTheme === 'string' && themesData[cfgTheme]) {
        applyThemeColors(themesData[cfgTheme]);
      } else if (cfgTheme && typeof cfgTheme === 'object') {
        applyThemeColors(cfgTheme);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load configuration');
      // Set default values if API fails
      setConfig({
        businessName: "ServiceHub",
        tagline: "Find Trusted Local Service Providers",
        description: "Connect with top-rated professionals in your area",
        hero: {
          headline: "Find the Perfect Service Provider",
          subheadline: "Connect with verified professionals",
          ctaText: "Find Pros",
          placeholderText: "Enter your zip code",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  // Apply theme colors to CSS variables
  const applyThemeColors = (theme: any) => {
    const root = document.documentElement;

    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}`
        : '0 0 0';
    };

    const hexToRgbTuple = (hex: string): [number, number, number] => {
      const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      if (!m) return [0, 0, 0];
      return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
    };

    const pickFg = (hexBg: string) => {
      const [r, g, b] = hexToRgbTuple(hexBg);
      // Perceived brightness
      const brightness = (r * 299 + g * 587 + b * 114) / 1000; // 0-255
      // Choose dark text for light backgrounds, white for dark
      return brightness > 140 ? '0 0 0' : '255 255 255';
    };

    const primary = theme.primary ?? theme.primaryColor;
    const secondary = theme.secondary ?? theme.secondaryColor;
    const accent = theme.accent ?? theme.accentColor;
    const background = theme.background ?? theme.backgroundColor;
    const foreground = theme.foreground ?? theme.foregroundColor;

    if (primary) {
      root.style.setProperty('--primary', hexToRgb(primary));
      root.style.setProperty('--primary-foreground', pickFg(primary));
      root.style.setProperty('--ring', hexToRgb(primary));
    }
    if (secondary) {
      root.style.setProperty('--secondary', hexToRgb(secondary));
      root.style.setProperty('--secondary-foreground', pickFg(secondary));
    }
    if (accent) {
      root.style.setProperty('--accent', hexToRgb(accent));
      root.style.setProperty('--accent-foreground', pickFg(accent));
    }
    if (background) root.style.setProperty('--background', hexToRgb(background));
    if (foreground) {
      root.style.setProperty('--foreground', hexToRgb(foreground));
    } else if (background) {
      root.style.setProperty('--foreground', pickFg(background));
    }
  };

  // Update configuration
  const updateConfig = async (newConfig: any) => {
    try {
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig),
      });

      if (!response.ok) throw new Error('Failed to save configuration');

      const result = await response.json();
      setConfig(result.config);

      // Apply theme if changed (support preset key or custom object)
      if (result.config) {
        const cfgTheme = result.config.theme;
        if (typeof cfgTheme === 'string' && themes && themes[cfgTheme]) {
          applyThemeColors(themes[cfgTheme]);
        } else if (cfgTheme && typeof cfgTheme === 'object') {
          applyThemeColors(cfgTheme);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save configuration');
      throw err;
    }
  };

  // Apply a niche template
  const applyNicheTemplate = async (niche: string) => {
    try {
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loadTemplate: niche }),
      });

      if (!response.ok) throw new Error('Failed to apply template');

      const result = await response.json();
      setConfig(result.config);

      // Apply theme if specified
      if (result.config.theme && themes[result.config.theme]) {
        applyThemeColors(themes[result.config.theme]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply template');
      throw err;
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  return (
    <ConfigContext.Provider
      value={{
        config,
        themes,
        loading,
        error,
        reloadConfig: loadConfig,
        updateConfig,
        applyNicheTemplate,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}
