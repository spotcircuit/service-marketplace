"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { themes } from '@/config/site-config';

type ThemeName = keyof typeof themes;

interface ThemeContextType {
  currentTheme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  themeConfig: typeof themes[ThemeName];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>('default');

  useEffect(() => {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('selectedTheme') as ThemeName;
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      applyTheme('default');
    }
  }, []);

  const applyTheme = (themeName: ThemeName) => {
    const theme = themes[themeName];
    const root = document.documentElement;

    // Convert hex to RGB for CSS variables
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}`
        : '0 0 0';
    };

    // Apply theme colors as CSS variables
    root.style.setProperty('--primary', hexToRgb(theme.primary));
    root.style.setProperty('--secondary', hexToRgb(theme.secondary));
    root.style.setProperty('--accent', hexToRgb(theme.accent));
    root.style.setProperty('--background', hexToRgb(theme.background));
    root.style.setProperty('--foreground', hexToRgb(theme.foreground));
  };

  const setTheme = (theme: ThemeName) => {
    setCurrentTheme(theme);
    applyTheme(theme);
    localStorage.setItem('selectedTheme', theme);
  };

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        setTheme,
        themeConfig: themes[currentTheme],
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
