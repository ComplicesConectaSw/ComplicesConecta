import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// CRÍTICO: Asegurar createContext disponible antes de usar
const safeCreateContext = <T,>(defaultValue: T | undefined): React.Context<T | undefined> => {
  const debugLog = (event: string, data?: any) => {
    if (typeof window !== 'undefined' && (window as any).__LOADING_DEBUG__) {
      (window as any).__LOADING_DEBUG__.log(event, data);
    }
  };
  
  if (typeof window !== 'undefined' && (window as any).React?.createContext) {
    debugLog('SAFE_CREATE_CONTEXT_GLOBAL', { provider: 'AndroidThemeProvider', hasGlobal: true });
    return (window as any).React.createContext(defaultValue);
  }
  
  debugLog('SAFE_CREATE_CONTEXT_FALLBACK', { provider: 'AndroidThemeProvider', hasGlobal: false, hasLocal: !!createContext });
  return createContext<T | undefined>(defaultValue);
};

type ThemeMode = 'light' | 'dark' | 'system';

interface AndroidThemeContextType {
  theme: ThemeMode;
  isDark: boolean;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const AndroidThemeContext = safeCreateContext<AndroidThemeContextType | undefined>(undefined);

interface AndroidThemeProviderProps {
  children: ReactNode;
}

export const AndroidThemeProvider: React.FC<AndroidThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeMode>('system');
  const [isDark, setIsDark] = useState(false);

  // Detectar preferencia del sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const updateSystemTheme = () => {
      if (theme === 'system') {
        setIsDark(mediaQuery.matches);
      }
    };

    // Configurar listener inicial
    updateSystemTheme();
    mediaQuery.addEventListener('change', updateSystemTheme);

    return () => mediaQuery.removeEventListener('change', updateSystemTheme);
  }, [theme]);

  // Cargar tema guardado
  useEffect(() => {
    const savedTheme = localStorage.getItem('android-theme') as ThemeMode;
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      setTheme(savedTheme);
    }
  }, []);

  // Aplicar tema al DOM
  useEffect(() => {
    const root = document.documentElement;
    
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setIsDark(mediaQuery.matches);
    } else {
      setIsDark(theme === 'dark');
    }

    // Aplicar clases CSS
    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
      
      // Variables CSS para modo oscuro Android
      root.style.setProperty('--android-bg', '#121212');
      root.style.setProperty('--android-surface', '#1e1e1e');
      root.style.setProperty('--android-surface-variant', '#2d2d2d');
      root.style.setProperty('--android-text', '#ffffff');
      root.style.setProperty('--android-text-secondary', '#b3b3b3');
      root.style.setProperty('--android-primary', '#bb86fc');
      root.style.setProperty('--android-primary-variant', '#985eff');
      root.style.setProperty('--android-secondary', '#03dac6');
      root.style.setProperty('--android-error', '#cf6679');
      root.style.setProperty('--android-border', '#404040');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      
      // Variables CSS para modo claro Android
      root.style.setProperty('--android-bg', '#ffffff');
      root.style.setProperty('--android-surface', '#ffffff');
      root.style.setProperty('--android-surface-variant', '#f5f5f5');
      root.style.setProperty('--android-text', '#212121');
      root.style.setProperty('--android-text-secondary', '#757575');
      root.style.setProperty('--android-primary', '#6200ea');
      root.style.setProperty('--android-primary-variant', '#3700b3');
      root.style.setProperty('--android-secondary', '#018786');
      root.style.setProperty('--android-error', '#b00020');
      root.style.setProperty('--android-border', '#e0e0e0');
    }

    // Guardar preferencia
    localStorage.setItem('android-theme', theme);
  }, [theme, isDark]);

  const handleSetTheme = (newTheme: ThemeMode) => {
    setTheme(newTheme);
  };

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const value: AndroidThemeContextType = {
    theme,
    isDark,
    setTheme: handleSetTheme,
    toggleTheme,
  };

  return (
    <AndroidThemeContext.Provider value={value}>
      <div className={`android-theme-root ${isDark ? 'dark' : 'light'}`}>
        {children}
      </div>
    </AndroidThemeContext.Provider>
  );
};

export const useAndroidTheme = (): AndroidThemeContextType => {
  const context = useContext(AndroidThemeContext);
  if (!context) {
    throw new Error('useAndroidTheme must be used within an AndroidThemeProvider');
  }
  return context;
};

export default AndroidThemeProvider;
