/**
 * React Fallbacks for SSR/Production Issues
 * Fixes useLayoutEffect and other React hooks in SSR environments
 */

import * as React from 'react';
import { useEffect, useLayoutEffect as originalUseLayoutEffect } from 'react';
import type { WindowWithReact } from '@/types/react.types';

// Safe useLayoutEffect that falls back to useEffect in SSR
export const useIsomorphicLayoutEffect = 
  typeof window !== 'undefined' ? originalUseLayoutEffect : useEffect;

// Initialize React fallbacks for production builds - ULTRA SEGURO
export const initializeReactFallbacks = () => {
  if (typeof window !== 'undefined') {
    const win = window as WindowWithReact;
    
    // Asegurar que React esté disponible globalmente para chunks lazy
    if (!win.React) {
      win.React = React;
    }
    
    // Asegurar que todos los hooks de React estén disponibles
    if (win.React && !win.React.useLayoutEffect) {
      win.React.useLayoutEffect = React.useLayoutEffect;
    }
    
    // Asegurar useEffect también
    if (win.React && !win.React.useEffect) {
      win.React.useEffect = React.useEffect;
    }
    
    // Asegurar useState
    if (win.React && !win.React.useState) {
      win.React.useState = React.useState;
    }
    
    // Asegurar useCallback
    if (win.React && !win.React.useCallback) {
      win.React.useCallback = React.useCallback;
    }
    
    // Asegurar useMemo
    if (win.React && !win.React.useMemo) {
      win.React.useMemo = React.useMemo;
    }
    
    // Asegurar createElement
    if (win.React && !win.React.createElement) {
      win.React.createElement = React.createElement;
    }
    
    // Fallback para useLayoutEffect si por alguna razón no está disponible
    if (!React.useLayoutEffect && React.useEffect) {
      if (win.React) {
        win.React.useLayoutEffect = React.useEffect;
      }
    }
  } else {
    // In SSR environment, replace useLayoutEffect with useEffect
    // Note: In SSR, React is already imported at the top, so we use it directly
    // If React is not available, the import would have failed already
    // In SSR, useLayoutEffect should use useEffect as fallback
    // This is handled by useIsomorphicLayoutEffect export
  }
};

// Polyfill for missing React features in vendor chunks - ULTRA SEGURO
export const ensureReactPolyfills = () => {
  if (typeof window !== 'undefined') {
    const win = window as WindowWithReact;
    
    // React ya está importado, simplemente exponerlo globalmente
    if (!win.React) {
      win.React = React;
    }
    
    // Asegurar que todos los métodos esenciales estén disponibles
    const windowReact = win.React;
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
      import('react').then((ReactModule) => {
        if (!win.React) {
          win.React = ReactModule as typeof React;
        } else {
          // Asegurar hooks en módulo dinámico también
          const winReact = win.React;
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
