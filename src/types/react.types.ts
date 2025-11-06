/**
 * Tipos para React global en window
 * Usado para polyfills y fallbacks de React
 */

import * as React from 'react';

/**
 * Window con React disponible globalmente
 */
export interface WindowWithReact extends Window {
  React?: typeof React & {
    useLayoutEffect?: typeof React.useLayoutEffect;
    useEffect?: typeof React.useEffect;
    useState?: typeof React.useState;
    useMemo?: typeof React.useMemo;
    useCallback?: typeof React.useCallback;
    createElement?: typeof React.createElement;
    createContext?: typeof React.createContext;
    StrictMode?: typeof React.StrictMode;
  };
  ReactDOM?: {
    createRoot?: (container: HTMLElement) => {
      render: (element: React.ReactElement) => void;
    };
  };
  __REACT_POLYFILL__?: {
    createContext?: typeof React.createContext;
    useLayoutEffect?: typeof React.useLayoutEffect;
    useEffect?: typeof React.useEffect;
    useState?: typeof React.useState;
    useMemo?: typeof React.useMemo;
    useCallback?: typeof React.useCallback;
    createElement?: typeof React.createElement;
  };
  __LOADING_DEBUG__?: {
    log: (event: string, data?: unknown) => void;
    getReport: () => unknown;
  };
}

