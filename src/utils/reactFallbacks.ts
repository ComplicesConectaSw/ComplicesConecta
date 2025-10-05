/**
 * React Fallbacks for SSR/Production Issues
 * Fixes useLayoutEffect and other React hooks in SSR environments
 */

import { useSafeLayoutEffect } from './safeLayoutEffect';

// Safe useLayoutEffect that falls back to useEffect in SSR
export const useIsomorphicLayoutEffect = useSafeLayoutEffect;

// Initialize React fallbacks for production builds
export const initializeReactFallbacks = () => {
  if (typeof window === 'undefined') {
    // In SSR environment, replace useLayoutEffect with useEffect
    try {
      const React = require('react');
      if (React && React.useLayoutEffect) {
        React.useLayoutEffect = React.useEffect;
      }
    } catch {
      // Ignore if React module not available
    }
  }
};

// Polyfill for missing React features in vendor chunks
export const ensureReactPolyfills = () => {
  if (typeof window !== 'undefined') {
    try {
      // Use static import to avoid dynamic import warning
      const React = require('react');
      if (React) {
        (window as any).React = React;
      }
    } catch {
      // Ignore errors
    }
  }
};
