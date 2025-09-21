import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePersistedState } from '@/hooks/usePersistedState';
import { logger } from '@/lib/logger';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  actualTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = usePersistedState<Theme>('theme', 'system');
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const updateTheme = () => {
      let resolvedTheme: 'light' | 'dark';

      if (theme === 'system') {
        resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      } else {
        resolvedTheme = theme;
      }

      setActualTheme(resolvedTheme);
      
      // Apply theme to document
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(resolvedTheme);
      
      // Update meta theme-color for mobile browsers
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', resolvedTheme === 'dark' ? '#1a1a1a' : '#ffffff');
      }

      logger.info('🎨 Theme updated:', { theme, resolvedTheme });
    };

    updateTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        updateTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const value: ThemeContextType = {
    theme,
    setTheme,
    actualTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
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

// Theme validation with Zod
import { z } from 'zod';

export const ThemeSchema = z.enum(['light', 'dark', 'system']);

export const validateTheme = (theme: unknown): Theme => {
  try {
    return ThemeSchema.parse(theme);
  } catch {
    logger.warn('Invalid theme provided, falling back to system');
    return 'system';
  }
};

// Theme utilities
export const getThemeColors = (theme: 'light' | 'dark') => {
  return theme === 'dark' 
    ? {
        background: 'hsl(222.2 84% 4.9%)',
        foreground: 'hsl(210 40% 98%)',
        primary: 'hsl(210 40% 98%)',
        secondary: 'hsl(217.2 32.6% 17.5%)',
        muted: 'hsl(217.2 32.6% 17.5%)',
        accent: 'hsl(217.2 32.6% 17.5%)',
        border: 'hsl(217.2 32.6% 17.5%)',
      }
    : {
        background: 'hsl(0 0% 100%)',
        foreground: 'hsl(222.2 84% 4.9%)',
        primary: 'hsl(222.2 47.4% 11.2%)',
        secondary: 'hsl(210 40% 96%)',
        muted: 'hsl(210 40% 96%)',
        accent: 'hsl(210 40% 96%)',
        border: 'hsl(214.3 31.8% 91.4%)',
      };
};
