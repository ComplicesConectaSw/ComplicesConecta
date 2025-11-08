import React, { useEffect, useState } from 'react';
import { cn } from '@/shared/lib/cn';

interface AccessibilityEnhancerProps {
  children: React.ReactNode;
  className?: string;
  focusVisible?: boolean;
  reducedMotion?: boolean;
  highContrast?: boolean;
  largeText?: boolean;
}

export const AccessibilityEnhancer: React.FC<AccessibilityEnhancerProps> = ({
  children,
  className,
  focusVisible = true,
  reducedMotion = true,
  highContrast = true,
  largeText = true,
}) => {
  const [preferences, setPreferences] = useState({
    reducedMotion: false,
    highContrast: false,
    largeText: false,
  });

  useEffect(() => {
    // Detectar preferencias del sistema
    const mediaQueries = {
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)'),
      highContrast: window.matchMedia('(prefers-contrast: high)'),
      largeText: window.matchMedia('(prefers-reduced-motion: no-preference)'),
    };

    const updatePreferences = () => {
      setPreferences({
        reducedMotion: mediaQueries.reducedMotion.matches,
        highContrast: mediaQueries.highContrast.matches,
        largeText: mediaQueries.largeText.matches,
      });
    };

    // Configurar listeners
    Object.values(mediaQueries).forEach(mq => {
      mq.addEventListener('change', updatePreferences);
    });

    // Configuración inicial
    updatePreferences();

    // Cleanup
    return () => {
      Object.values(mediaQueries).forEach(mq => {
        mq.removeEventListener('change', updatePreferences);
      });
    };
  }, []);

  const accessibilityClasses = cn(
    // Focus visible mejorado
    focusVisible && [
      'focus-visible:outline-none',
      'focus-visible:ring-2',
      'focus-visible:ring-primary',
      'focus-visible:ring-offset-2',
      'focus-visible:ring-offset-background',
    ],
    
    // Reducir movimiento si está habilitado
    reducedMotion && preferences.reducedMotion && [
      'motion-reduce:transition-none',
      'motion-reduce:transform-none',
      'motion-reduce:animate-none',
    ],
    
    // Alto contraste
    highContrast && preferences.highContrast && [
      'border-2',
      'border-foreground',
      'bg-background',
      'text-foreground',
    ],
    
    // Texto grande
    largeText && preferences.largeText && [
      'text-lg',
      'leading-relaxed',
    ],
    
    className
  );

  return (
    <div className={accessibilityClasses}>
      {children}
    </div>
  );
};

interface FocusTrapProps {
  children: React.ReactNode;
  isActive: boolean;
  className?: string;
}

export const FocusTrap: React.FC<FocusTrapProps> = ({
  children,
  isActive,
  className,
}) => {
  useEffect(() => {
    if (!isActive) return;

    const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const firstFocusableElement = document.querySelector(focusableElements) as HTMLElement;
    const focusableContent = document.querySelectorAll(focusableElements);
    const lastFocusableElement = focusableContent[focusableContent.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusableElement) {
          lastFocusableElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusableElement) {
          firstFocusableElement.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    firstFocusableElement?.focus();

    return () => {
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [isActive]);

  return (
    <div className={className}>
      {children}
    </div>
  );
};

interface ScreenReaderOnlyProps {
  children: React.ReactNode;
  className?: string;
}

export const ScreenReaderOnly: React.FC<ScreenReaderOnlyProps> = ({
  children,
  className,
}) => {
  return (
    <span
      className={cn(
        'sr-only',
        className
      )}
    >
      {children}
    </span>
  );
};

interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export const SkipLink: React.FC<SkipLinkProps> = ({
  href,
  children,
  className,
}) => {
  return (
    <a
      href={href}
      className={cn(
        'sr-only focus:not-sr-only',
        'absolute top-4 left-4 z-50',
        'px-4 py-2',
        'bg-primary text-primary-foreground',
        'rounded-md font-medium',
        'transition-all duration-200',
        className
      )}
    >
      {children}
    </a>
  );
};