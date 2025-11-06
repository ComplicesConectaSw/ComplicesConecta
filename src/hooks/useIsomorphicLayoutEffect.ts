/**
 * Hook isomórfico seguro para useLayoutEffect
 * 
 * Usa useLayoutEffect en entornos con DOM (web) y useEffect en entornos sin DOM (SSR, Android/iOS)
 * 
 * Este hook resuelve el error "Cannot read properties of undefined (reading 'useLayoutEffect')"
 * que ocurre cuando se intenta usar useLayoutEffect en entornos sin DOM o cuando React
 * no está disponible aún.
 * 
 * @example
 * ```tsx
 * import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect';
 * 
 * function MyComponent() {
 *   useIsomorphicLayoutEffect(() => {
 *     // Este código solo se ejecuta en el cliente (web)
 *     // En Android/iOS se ejecuta como useEffect
 *   }, []);
 * }
 * ```
 */

import { useEffect, useLayoutEffect } from 'react';

/**
 * Hook isomórfico que usa useLayoutEffect en cliente y useEffect en servidor/React Native
 * 
 * useLayoutEffect solo está disponible en entornos con DOM (web).
 * En Android/iOS (React Native) o SSR, se usa useEffect como fallback.
 */
export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export default useIsomorphicLayoutEffect;

