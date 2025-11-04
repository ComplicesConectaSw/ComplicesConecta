import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { logger } from '@/lib/logger';

// CRÍTICO: Asegurar createContext disponible antes de usar
const safeCreateContext = <T,>(defaultValue: T | undefined): React.Context<T | undefined> => {
  if (typeof window !== 'undefined' && (window as any).React?.createContext) {
    return (window as any).React.createContext(defaultValue);
  }
  return createContext<T | undefined>(defaultValue);
};

// Animation configuration interface
interface AnimationConfig {
  reducedMotion: boolean;
  animationSpeed: 'slow' | 'normal' | 'fast';
  enableParticles: boolean;
  enableBackgroundAnimations: boolean;
}

// Animation context interface
interface AnimationContextType {
  config: AnimationConfig;
  updateConfig: (newConfig: Partial<AnimationConfig>) => void;
  triggerGlobalAnimation: (type: string, data?: Record<string, unknown>) => void;
  globalAnimations: Record<string, Record<string, unknown>>;
}

// Default configuration
const defaultConfig: AnimationConfig = {
  reducedMotion: false,
  animationSpeed: 'normal',
  enableParticles: true,
  enableBackgroundAnimations: true,
};

// Create context
const AnimationContext = safeCreateContext<AnimationContextType | undefined>(undefined);

// Animation speed multipliers
const speedMultipliers = {
  slow: 1.5,
  normal: 1,
  fast: 0.7,
};

// Provider component
interface AnimationProviderProps {
  children: React.ReactNode;
}

export const AnimationProvider: React.FC<AnimationProviderProps> = ({ children }) => {
  const [config, setConfig] = useState<AnimationConfig>(() => {
    // Check for user's reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Load saved config from localStorage
    const savedConfig = localStorage.getItem('animation-config');
    const parsedConfig = savedConfig ? JSON.parse(savedConfig) : {};
    
    return {
      ...defaultConfig,
      reducedMotion: prefersReducedMotion,
      ...parsedConfig,
    };
  });

  const [globalAnimations, setGlobalAnimations] = useState<Record<string, Record<string, unknown>>>({});

  const updateConfig = useCallback((newConfig: Partial<AnimationConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    localStorage.setItem('animation-config', JSON.stringify(updatedConfig));
  }, [config]);

  const triggerGlobalAnimation = useCallback((type: string, data?: Record<string, unknown>) => {
    setGlobalAnimations(prev => ({
      ...prev,
      [type]: { ...data, timestamp: Date.now() }
    }));
    
    // Clear animation after a delay
    setTimeout(() => {
      setGlobalAnimations(prev => {
        const newAnimations = { ...prev };
        delete newAnimations[type];
        return newAnimations;
      });
    }, 3000);
  }, []);

  const contextValue: AnimationContextType = {
    config,
    updateConfig,
    triggerGlobalAnimation,
    globalAnimations,
  };

  return (
    <AnimationContext.Provider value={contextValue}>
      <AnimatePresence mode="wait">
        <>{children}</>
      </AnimatePresence>
    </AnimationContext.Provider>
  );
};

// Hook to use animation context
export const useAnimation = () => {
  const context = useContext(AnimationContext);
  if (context === undefined) {
    throw new Error('useAnimation must be used within an AnimationProvider');
  }
  return context;
};

// Hook to get animation duration based on config
export const useAnimationDuration = (baseDuration: number = 1) => {
  const { config } = useAnimation();
  
  if (config.reducedMotion) {
    return 0.01; // Nearly instant for reduced motion
  }
  
  return baseDuration * speedMultipliers[config.animationSpeed];
};

// Hook to get animation variants with config applied
export const useAnimationVariants = (baseVariants: Record<string, unknown>) => {
  const { config } = useAnimation();
  const duration = useAnimationDuration();
  
  if (config.reducedMotion) {
    // Return simplified variants for reduced motion
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1, transition: { duration: 0.01 } },
      exit: { opacity: 0, transition: { duration: 0.01 } },
    };
  }
  
  // Apply duration multiplier to all transitions
  const applyDuration = (variants: Record<string, unknown>): Record<string, unknown> => {
    if (typeof variants !== 'object' || variants === null) {
      return variants;
    }
    
    const result = { ...variants };
    
    if (result.transition && typeof result.transition === 'object') {
      const transition = result.transition as Record<string, unknown>;
      result.transition = {
        ...transition,
        duration: (typeof transition.duration === 'number' ? transition.duration : 1) * duration,
      };
    }
    
    // Recursively apply to nested objects
    Object.keys(result).forEach(key => {
      if (typeof result[key] === 'object' && result[key] !== null) {
        result[key] = applyDuration(result[key] as Record<string, unknown>);
      }
    });
    
    return result;
  };
  
  return applyDuration(baseVariants);
};

// Global animation triggers
export const useGlobalAnimationTriggers = () => {
  const { triggerGlobalAnimation } = useAnimation();
  
  return {
    // Success animations
    triggerSuccess: (message?: string) => 
      triggerGlobalAnimation('success', { message }),
    
    // Error animations
    triggerError: (message?: string) => 
      triggerGlobalAnimation('error', { message }),
    
    // Loading animations
    triggerLoading: (isLoading: boolean) => 
      triggerGlobalAnimation('loading', { isLoading }),
    
    // Notification animations
    triggerNotification: (type: 'info' | 'warning' | 'success' | 'error', message: string) => 
      triggerGlobalAnimation('notification', { type, message }),
    
    // Match animations
    triggerMatch: (user: Record<string, unknown>) => 
      triggerGlobalAnimation('match', { user }),
    
    // Like animations
    triggerLike: (direction: 'left' | 'right') => 
      triggerGlobalAnimation('like', { direction }),
    
    // Message animations
    triggerMessage: (message: Record<string, unknown>) => 
      triggerGlobalAnimation('message', { message }),
    
    // Achievement animations
    triggerAchievement: (achievement: Record<string, unknown>) => 
      triggerGlobalAnimation('achievement', { achievement }),
  };
};

// Performance monitoring hook
export const useAnimationPerformance = () => {
  const { config, updateConfig } = useAnimation();
  
  React.useEffect(() => {
    // Monitor frame rate and adjust animations if needed
    let frameCount = 0;
    let lastTime = performance.now();
    
    const checkPerformance = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        
        // If FPS is low, suggest reducing animations
        if (fps < 30 && config.animationSpeed !== 'fast') {
          logger.warn('Low FPS detected, consider reducing animations');
          // Optionally auto-adjust
          // updateConfig({ animationSpeed: 'fast' });
        }
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(checkPerformance);
    };
    
    const rafId = requestAnimationFrame(checkPerformance);
    
    return () => cancelAnimationFrame(rafId);
  }, [config.animationSpeed, updateConfig]);
};

// Intersection observer hook for scroll animations
export const useScrollAnimation = (threshold: number = 0.1) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef<HTMLElement>(null);
  
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold }
    );
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold]);
  
  return { ref, isVisible };
};
