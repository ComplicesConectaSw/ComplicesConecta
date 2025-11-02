/**
 * React Fallbacks for SSR/Production Issues
 * Fixes useLayoutEffect and other React hooks in SSR environments
 */

import * as React from 'react';
import { useEffect, useLayoutEffect as originalUseLayoutEffect } from 'react';

// Safe useLayoutEffect that falls back to useEffect in SSR
export const useIsomorphicLayoutEffect = 
  typeof window !== 'undefined' ? originalUseLayoutEffect : useEffect;

// Initialize React fallbacks for production builds
export const initializeReactFallbacks = () => {
  if (typeof window !== 'undefined') {
    // Asegurar que React esté disponible globalmente para chunks lazy
    if (!(window as any).React) {
      (window as any).React = React;
    }
    
    // Asegurar que useLayoutEffect esté disponible en el objeto global
    if (!(window as any).React?.useLayoutEffect) {
      (window as any).React.useLayoutEffect = React.useLayoutEffect;
    }
  } else {
    // In SSR environment, replace useLayoutEffect with useEffect
    try {
      const ReactModule = require('react');
      if (ReactModule && ReactModule.useLayoutEffect) {
        ReactModule.useLayoutEffect = ReactModule.useEffect;
      }
    } catch {
      // Ignore if React module not available
    }
  }
};

// Polyfill for missing React features in vendor chunks
export const ensureReactPolyfills = () => {
  if (typeof window !== 'undefined') {
    // React ya está importado, simplemente exponerlo globalmente
    if (!(window as any).React) {
      (window as any).React = React;
    }
    
    // Import React dynamically as fallback (solo si no está ya disponible)
    try {
      import('react').then((ReactModule) => {
        if (!(window as any).React) {
          (window as any).React = ReactModule;
        }
      }).catch(() => {
        // Ignore if React module not found
      });
    } catch {
      // Ignore errors
    }
  }
};
