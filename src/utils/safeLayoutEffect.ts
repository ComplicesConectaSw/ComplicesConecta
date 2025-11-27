import { useEffect, useLayoutEffect } from "react";

/**
 * Hook seguro para evitar errores "useLayoutEffect undefined" en SSR/Vercel
 * Usa useLayoutEffect en cliente y useEffect en servidor
 */
export const useSafeLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default useSafeLayoutEffect;
