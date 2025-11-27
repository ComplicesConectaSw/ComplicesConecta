import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { safeGetItem, safeSetItem } from '@/utils/safeLocalStorage';

// CRÍTICO: Asegurar createContext disponible antes de usar
const safeCreateContext = <T,>(defaultValue: T | undefined): React.Context<T | undefined> => {
  const debugLog = (event: string, data?: any) => {
    if (typeof window !== 'undefined' && (window as any).__LOADING_DEBUG__) {
      (window as any).__LOADING_DEBUG__.log(event, data);
    }
  };
  
  if (typeof window !== 'undefined' && (window as any).React?.createContext) {
    debugLog('SAFE_CREATE_CONTEXT_GLOBAL', { provider: 'AccessibilityProvider', hasGlobal: true });
    return (window as any).React.createContext(defaultValue);
  }
  
  debugLog('SAFE_CREATE_CONTEXT_FALLBACK', { provider: 'AccessibilityProvider', hasGlobal: false, hasLocal: !!createContext });
  return createContext<T | undefined>(defaultValue);
};

interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  screenReaderMode: boolean;
  keyboardNavigation: boolean;
  focusVisible: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSetting: (key: keyof AccessibilitySettings, value: boolean) => void;
  announceToScreenReader: (message: string) => void;
  focusElement: (elementId: string) => void;
}

const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  largeText: false,
  reducedMotion: false,
  screenReaderMode: false,
  keyboardNavigation: true,
  focusVisible: true,
};

const AccessibilityContext = safeCreateContext<AccessibilityContextType | undefined>(undefined);

interface AccessibilityProviderProps {
  children: ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);

  // Cargar configuraciones guardadas
  useEffect(() => {
    const savedSettings = safeGetItem<AccessibilitySettings>('accessibility-settings', { validate: false, defaultValue: null });
    if (savedSettings && typeof savedSettings === 'object') {
      setSettings({ ...defaultSettings, ...savedSettings });
    }

    // Detectar preferencias del sistema
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    
    if (prefersReducedMotion || prefersHighContrast) {
      setSettings(prev => ({
        ...prev,
        reducedMotion: prefersReducedMotion,
        highContrast: prefersHighContrast,
      }));
    }
  }, []);

  // Aplicar configuraciones al DOM
  useEffect(() => {
    const root = document.documentElement;
    
    // High contrast
    if (settings.highContrast) {
      root.classList.add('accessibility-high-contrast');
    } else {
      root.classList.remove('accessibility-high-contrast');
    }

    // Large text
    if (settings.largeText) {
      root.classList.add('accessibility-large-text');
    } else {
      root.classList.remove('accessibility-large-text');
    }

    // Reduced motion
    if (settings.reducedMotion) {
      root.classList.add('accessibility-reduced-motion');
    } else {
      root.classList.remove('accessibility-reduced-motion');
    }

    // Screen reader mode
    if (settings.screenReaderMode) {
      root.classList.add('accessibility-screen-reader');
    } else {
      root.classList.remove('accessibility-screen-reader');
    }

    // Focus visible
    if (settings.focusVisible) {
      root.classList.add('accessibility-focus-visible');
    } else {
      root.classList.remove('accessibility-focus-visible');
    }

    // Guardar configuraciones
    safeSetItem('accessibility-settings', settings, { validate: false, sanitize: true });
  }, [settings]);

  const updateSetting = (key: keyof AccessibilitySettings, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const announceToScreenReader = (message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement as Node);
    
    setTimeout(() => {
      document.body.removeChild(announcement as Node);
    }, 1000);
  };

  const focusElement = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.focus();
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const value: AccessibilityContextType = {
    settings,
    updateSetting,
    announceToScreenReader,
    focusElement,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
      
      {/* Screen reader announcements container */}
      <div 
        id="accessibility-announcements" 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
      />
      
      {/* Skip links */}
      <div className="skip-links">
        <a 
          href="#main-content" 
          className="skip-link"
          onFocus={() => announceToScreenReader('Enlace para saltar al contenido principal')}
        >
          Saltar al contenido principal
        </a>
        <a 
          href="#navigation" 
          className="skip-link"
          onFocus={() => announceToScreenReader('Enlace para saltar a la navegación')}
        >
          Saltar a la navegación
        </a>
      </div>
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

// Hook para detectar navegación por teclado
export const useKeyboardNavigation = () => {
  const [isKeyboardUser, setIsKeyboardUser] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setIsKeyboardUser(true);
      }
    };

    const handleMouseDown = () => {
      setIsKeyboardUser(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  return isKeyboardUser;
};

export default AccessibilityProvider;
