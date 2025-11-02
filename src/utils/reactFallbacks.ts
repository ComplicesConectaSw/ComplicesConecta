/**
 * React Fallbacks for SSR/Production Issues
 * Fixes useLayoutEffect and other React hooks in SSR environments
 */

import * as React from 'react';
import { useEffect, useLayoutEffect as originalUseLayoutEffect } from 'react';

// Safe useLayoutEffect that falls back to useEffect in SSR
export const useIsomorphicLayoutEffect = 
  typeof window !== 'undefined' ? originalUseLayoutEffect : useEffect;

// Initialize React fallbacks for production builds - ULTRA SEGURO
export const initializeReactFallbacks = () => {
  if (typeof window !== 'undefined') {
    // Asegurar que React esté disponible globalmente para chunks lazy
    if (!(window as any).React) {
      (window as any).React = React;
    }
    
    // Asegurar que todos los hooks de React estén disponibles
    if ((window as any).React && !(window as any).React.useLayoutEffect) {
      (window as any).React.useLayoutEffect = React.useLayoutEffect;
    }
    
    // Asegurar useEffect también
    if ((window as any).React && !(window as any).React.useEffect) {
      (window as any).React.useEffect = React.useEffect;
    }
    
    // Asegurar useState
    if ((window as any).React && !(window as any).React.useState) {
      (window as any).React.useState = React.useState;
    }
    
    // Asegurar useCallback
    if ((window as any).React && !(window as any).React.useCallback) {
      (window as any).React.useCallback = React.useCallback;
    }
    
    // Asegurar useMemo
    if ((window as any).React && !(window as any).React.useMemo) {
      (window as any).React.useMemo = React.useMemo;
    }
    
    // Asegurar createElement
    if ((window as any).React && !(window as any).React.createElement) {
      (window as any).React.createElement = React.createElement;
    }
    
    // Fallback para useLayoutEffect si por alguna razón no está disponible
    if (!React.useLayoutEffect && React.useEffect) {
      (window as any).React.useLayoutEffect = React.useEffect;
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

// Polyfill for missing React features in vendor chunks - ULTRA SEGURO
export const ensureReactPolyfills = () => {
  if (typeof window !== 'undefined') {
    // React ya está importado, simplemente exponerlo globalmente
    if (!(window as any).React) {
      (window as any).React = React;
    }
    
    // Asegurar que todos los métodos esenciales estén disponibles
    const windowReact = (window as any).React;
    if (windowReact) {
      // Asegurar useLayoutEffect
      if (!windowReact.useLayoutEffect && React.useLayoutEffect) {
        windowReact.useLayoutEffect = React.useLayoutEffect;
      } else if (!windowReact.useLayoutEffect && React.useEffect) {
        // Fallback a useEffect si useLayoutEffect no está disponible
        windowReact.useLayoutEffect = React.useEffect;
      }
      
      // Asegurar otros hooks críticos
      if (!windowReact.useEffect && React.useEffect) {
        windowReact.useEffect = React.useEffect;
      }
      if (!windowReact.useState && React.useState) {
        windowReact.useState = React.useState;
      }
      if (!windowReact.useMemo && React.useMemo) {
        windowReact.useMemo = React.useMemo;
      }
      if (!windowReact.useCallback && React.useCallback) {
        windowReact.useCallback = React.useCallback;
      }
      if (!windowReact.createElement && React.createElement) {
        windowReact.createElement = React.createElement;
      }
    }
    
    // Import React dynamically as fallback (solo si no está ya disponible)
    try {
      import('react').then((ReactModule: any) => {
        if (!(window as any).React) {
          (window as any).React = ReactModule;
        } else {
          // Asegurar hooks en módulo dinámico también
          const winReact = (window as any).React;
          if (ReactModule.useLayoutEffect && !winReact.useLayoutEffect) {
            winReact.useLayoutEffect = ReactModule.useLayoutEffect;
          } else if (ReactModule.useEffect && !winReact.useLayoutEffect) {
            winReact.useLayoutEffect = ReactModule.useEffect;
          }
        }
      }).catch(() => {
        // Ignore if React module not found
      });
    } catch {
      // Ignore errors
    }
  }
};
