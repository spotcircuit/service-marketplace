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

      // Apply theme if specified
      if (configData.theme && themesData[configData.theme]) {
        applyThemeColors(themesData[configData.theme]);
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

    if (theme.primary) root.style.setProperty('--primary', hexToRgb(theme.primary));
    if (theme.secondary) root.style.setProperty('--secondary', hexToRgb(theme.secondary));
    if (theme.accent) root.style.setProperty('--accent', hexToRgb(theme.accent));
    if (theme.background) root.style.setProperty('--background', hexToRgb(theme.background));
    if (theme.foreground) root.style.setProperty('--foreground', hexToRgb(theme.foreground));
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

      // Apply theme if changed
      if (result.config.theme && themes[result.config.theme]) {
        applyThemeColors(themes[result.config.theme]);
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
