/**
 * React Fallbacks for SSR/Production Issues
 * Fixes useLayoutEffect and other React hooks in SSR environments
 */

import { useEffect, useLayoutEffect as originalUseLayoutEffect } from 'react';

// Safe useLayoutEffect that falls back to useEffect in SSR
export const useIsomorphicLayoutEffect = 
  typeof window !== 'undefined' ? originalUseLayoutEffect : useEffect;

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
      // Import React dynamically to avoid UMD global reference
      import('react').then((ReactModule) => {
        (window as any).React = ReactModule;
      }).catch(() => {
        // Ignore if React module not found
      });
    } catch {
      // Ignore errors
    }
  }
};
