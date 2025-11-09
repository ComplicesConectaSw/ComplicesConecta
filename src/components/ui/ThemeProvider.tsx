import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePersistedState } from '@/hooks/usePersistedState';
import { logger } from '@/lib/logger';

// CRÍTICO: Asegurar createContext disponible antes de usar
const safeCreateContext = <T,>(defaultValue: T | undefined): React.Context<T | undefined> => {
  const debugLog = (event: string, data?: Record<string, unknown> | unknown) => {
    if (typeof window !== 'undefined' && (window as Record<string, unknown>).__LOADING_DEBUG__) {
      const debugWindow = (window as Record<string, unknown>).__LOADING_DEBUG__ as { log?: (event: string, data?: unknown) => void };
      debugWindow.log?.(event, data);
    }
  };
  
  if (typeof window !== 'undefined' && (window as any).React?.createContext) {
    debugLog('SAFE_CREATE_CONTEXT_GLOBAL', { provider: 'ThemeProvider', hasGlobal: true });
    return (window as any).React.createContext(defaultValue);
  }
  
  debugLog('SAFE_CREATE_CONTEXT_FALLBACK', { provider: 'ThemeProvider', hasGlobal: false, hasLocal: !!createContext });
  return createContext<T | undefined>(defaultValue);
};

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  actualTheme: 'light' | 'dark';
}

const ThemeContext = safeCreateContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = usePersistedState<Theme>('theme', 'system');
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Flag para evitar recursión infinita
    let isUpdating = false;
    let lastResolvedTheme: 'light' | 'dark' | null = null;
    
    const updateTheme = () => {
      // CRÍTICO: Prevenir recursión infinita
      if (isUpdating) {
        return;
      }
      
      isUpdating = true;
      
      try {
        let resolvedTheme: 'light' | 'dark';

        if (theme === 'system') {
          // Detectar preferencia del sistema automáticamente
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          resolvedTheme = prefersDark ? 'dark' : 'light';
          
          // Dark mode automático por hora del día (siempre activo)
          const hour = new Date().getHours();
          if (hour >= 20 || hour < 6) {
            // Forzar dark mode entre 8 PM y 6 AM automáticamente
            resolvedTheme = 'dark';
          }
        } else {
          resolvedTheme = theme;
        }

        // CRÍTICO: Solo actualizar si el tema realmente cambió
        if (lastResolvedTheme === resolvedTheme) {
          isUpdating = false;
          return;
        }
        
        lastResolvedTheme = resolvedTheme;

        setActualTheme(resolvedTheme);
        
        // Apply theme to document - forzar actualización inmediata
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(resolvedTheme);
        
        // CRÍTICO: NO guardar en localStorage aquí - usePersistedState ya lo hace
        // Guardar aquí causa que usePersistedState detecte el cambio y dispare el useEffect nuevamente
        // Solo guardar si realmente es necesario (cuando el usuario cambia el tema manualmente)
        
        // Update meta theme-color for mobile browsers
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
          metaThemeColor.setAttribute('content', resolvedTheme === 'dark' ? '#1a1a1a' : '#ffffff');
        }

        // CRÍTICO: NO disparar evento theme-change aquí para evitar recursión
        // El evento theme-change solo debe dispararse desde fuera del componente
        // Si otros componentes necesitan saber del cambio, pueden usar el contexto

        // CRÍTICO: NO usar logger.info aquí - puede causar efectos secundarios
        // Solo loggear en desarrollo y de forma condicional
        if (process.env.NODE_ENV === 'development') {
          // Usar console.debug aquí es aceptable para debugging en desarrollo
          console.debug('🎨 Theme updated:', { theme, resolvedTheme });
        }
      } finally {
        isUpdating = false;
      }
    };

    // Ejecutar inmediatamente
    updateTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system' && !isUpdating) {
        updateTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    
    // ELIMINADO: Listener de theme-change que causaba recursión infinita
    // Los componentes deben usar el contexto useTheme() en lugar de escuchar eventos
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
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
