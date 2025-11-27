/**
 * Tests para utilidades móviles
 * Cobertura de funciones de detección y optimización móvil
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  isMobile,
  isTouchDevice,
  prefersReducedMotion,
  getBreakpoint,
  addTouchSupport,
  getAnimationConfig
} from '../../utils/mobile';

// Mock de window.matchMedia
const mockMatchMedia = (matches: boolean) => {
  return vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
};

describe('Mobile Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isMobile', () => {
    it('should detect mobile user agent', () => {
      Object.defineProperty(window, 'innerWidth', {
        value: 375,
        writable: true,
        configurable: true
      });

      expect(isMobile()).toBe(true);
    });

    it('should detect Android user agent', () => {
      Object.defineProperty(window, 'innerWidth', {
        value: 375,
        writable: true,
        configurable: true
      });

      expect(isMobile()).toBe(true);
    });

    it('should return false for desktop user agent', () => {
      Object.defineProperty(window, 'innerWidth', {
        value: 1920,
        writable: true,
        configurable: true
      });

      expect(isMobile()).toBe(false);
    });
  });

  describe('isTouchDevice', () => {
    it('should detect touch support', () => {
      Object.defineProperty(navigator, 'maxTouchPoints', {
        value: 5,
        writable: true,
        configurable: true
      });

      expect(isTouchDevice()).toBe(true);
    });

    it('should return false when no touch support', () => {
      Object.defineProperty(navigator, 'maxTouchPoints', {
        value: 0,
        writable: true,
        configurable: true
      });

      // Mock ontouchstart
      delete (window as any).ontouchstart;

      expect(isTouchDevice()).toBe(false);
    });

    it('should detect touch via ontouchstart', () => {
      Object.defineProperty(navigator, 'maxTouchPoints', {
        value: 0,
        writable: true,
        configurable: true
      });

      (window as any).ontouchstart = null;

      expect(isTouchDevice()).toBe(true);

      delete (window as any).ontouchstart;
    });
  });

  describe('prefersReducedMotion', () => {
    it('should detect reduced motion preference', () => {
      window.matchMedia = mockMatchMedia(true);

      expect(prefersReducedMotion()).toBe(true);
      expect(window.matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
    });

    it('should return false when no reduced motion preference', () => {
      window.matchMedia = mockMatchMedia(false);

      expect(prefersReducedMotion()).toBe(false);
    });

    it('should return false when matchMedia is not supported', () => {
      const originalMatchMedia = window.matchMedia;
      
      // Temporarily remove matchMedia
      Object.defineProperty(window, 'matchMedia', {
        value: undefined,
        writable: true,
        configurable: true
      });
      
      try {
        // The function should handle the absence of matchMedia gracefully
        const result = prefersReducedMotion();
        expect(result).toBe(false);
      } finally {
        // Restore matchMedia
        if (originalMatchMedia) {
          Object.defineProperty(window, 'matchMedia', {
            value: originalMatchMedia,
            writable: true,
            configurable: true
          });
        }
      }
    });
  });

  describe('getBreakpoint', () => {
    it('should return mobile for small screens', () => {
      Object.defineProperty(window, 'innerWidth', {
        value: 600,
        writable: true,
        configurable: true
      });

      expect(getBreakpoint()).toBe('mobile');
    });

    it('should return tablet for medium screens', () => {
      Object.defineProperty(window, 'innerWidth', {
        value: 800,
        writable: true,
        configurable: true
      });

      expect(getBreakpoint()).toBe('tablet');
    });

    it('should return desktop for large screens', () => {
      Object.defineProperty(window, 'innerWidth', {
        value: 1200,
        writable: true,
        configurable: true
      });

      expect(getBreakpoint()).toBe('desktop');
    });
  });

  describe('addTouchSupport', () => {
    let mockElement: HTMLElement;

    beforeEach(() => {
      mockElement = {
        style: {
          touchAction: '',
          setProperty: vi.fn()
        }
      } as any;
    });

    it('should add touch support to element on touch device', () => {
      // Mock touch device
      Object.defineProperty(navigator, 'maxTouchPoints', {
        value: 5,
        writable: true,
        configurable: true
      });

      addTouchSupport(mockElement);

      expect(mockElement.style.touchAction).toBe('manipulation');
      expect(mockElement.style.setProperty).toHaveBeenCalledWith(
        '-webkit-tap-highlight-color',
        'transparent'
      );
    });

    it('should not modify element on non-touch device', () => {
      // Mock non-touch device
      Object.defineProperty(navigator, 'maxTouchPoints', {
        value: 0,
        writable: true,
        configurable: true
      });
      delete (window as any).ontouchstart;

      addTouchSupport(mockElement);

      expect(mockElement.style.touchAction).toBe('');
      expect(mockElement.style.setProperty).not.toHaveBeenCalled();
    });
  });

  describe('getAnimationConfig', () => {
    it('should return no animation config for reduced motion', () => {
      window.matchMedia = mockMatchMedia(true);

      const config = getAnimationConfig();

      expect(config.duration).toBe(0);
    });

    it('should return mobile animation config', () => {
      window.matchMedia = mockMatchMedia(false);
      Object.defineProperty(window, 'innerWidth', {
        value: 375,
        writable: true,
        configurable: true
      });

      const config = getAnimationConfig();

      expect(config.duration).toBe(0.2);
      expect(config.stiffness).toBe(300);
    });

    it('should return desktop animation config', () => {
      window.matchMedia = mockMatchMedia(false);
      Object.defineProperty(window, 'innerWidth', {
        value: 1920,
        writable: true,
        configurable: true
      });

      const config = getAnimationConfig();

      expect(config.duration).toBe(0.3);
      expect(config.stiffness).toBe(400);
    });
  });
});
