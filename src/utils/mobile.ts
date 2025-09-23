/**
 * Mobile and touch utilities for responsive design
 */

export const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
};

export const isTablet = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= 768 && window.innerWidth < 1024;
};

export const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export const supportsHover = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(hover: hover)').matches;
};

export const getViewportSize = () => {
  if (typeof window === 'undefined') return { width: 0, height: 0 };
  return {
    width: window.innerWidth,
    height: window.innerHeight
  };
};

export const getBreakpoint = (): 'mobile' | 'tablet' | 'desktop' => {
  if (typeof window === 'undefined') return 'desktop';
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

// Touch gesture helpers
export const addTouchSupport = (element: HTMLElement) => {
  if (!isTouchDevice()) return;
  
  element.style.touchAction = 'manipulation';
  
  // Usar setProperty para propiedades webkit específicas
  element.style.setProperty('-webkit-tap-highlight-color', 'transparent');
};

// Animation configuration based on device capabilities
export const getAnimationConfig = () => {
  const reduced = prefersReducedMotion();
  const mobile = isMobile();
  
  return {
    duration: reduced ? 0 : mobile ? 0.2 : 0.3,
    stiffness: mobile ? 300 : 400,
    damping: mobile ? 30 : 25,
    scale: mobile ? 1.01 : 1.02,
    enabled: !reduced
  };
};
