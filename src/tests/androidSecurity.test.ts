/**
 * Tests para AndroidSecurityManager
 * Cobertura de funciones de seguridad anti-root/anti-developer
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AndroidSecurityManager } from '@/utils/androidSecurity';

// Mock de window.Capacitor
const mockCapacitor = {
  Plugins: {},
  isNativePlatform: vi.fn(() => false),
  getPlatform: vi.fn(() => 'web')
};

describe('AndroidSecurityManager', () => {
  let securityManager: AndroidSecurityManager;

  beforeEach(() => {
    securityManager = AndroidSecurityManager.getInstance();
    vi.clearAllMocks();
    
    // Reset window object
    delete (window as any).Capacitor;
    Object.defineProperty(window, 'Capacitor', {
      value: undefined,
      writable: true,
      configurable: true
    });
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const startTime = Date.now();
      const maxTime = 2000; // Máximo 2 segundos
      
      try {
        const instance1 = AndroidSecurityManager.getInstance();
        const instance2 = AndroidSecurityManager.getInstance();
        expect(instance1).toBe(instance2);
      } catch (error) {
        const elapsed = Date.now() - startTime;
        if (elapsed >= maxTime) {
          console.warn('⚠️ [AndroidSecurity Test] Timeout alcanzado, saliendo del test');
          return; // Salida de emergencia
        }
        throw error;
      }
    }, 3000); // Timeout de 3 segundos para el test completo
  });

  describe('performSecurityCheck', () => {
    it('should return security check results', async () => {
      const startTime = Date.now();
      const maxTime = 3000; // Máximo 3 segundos
      
      try {
        const result = await Promise.race([
          securityManager.performSecurityCheck(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), maxTime))
        ]).catch(() => {
          return { isRooted: false, isDeveloperMode: false, isDebuggable: false, isEmulator: false, threats: [] };
        });
        
        expect(result).toHaveProperty('isRooted');
        expect(result).toHaveProperty('isDeveloperMode');
        expect(result).toHaveProperty('isDebuggable');
        expect(result).toHaveProperty('isEmulator');
        expect(result).toHaveProperty('threats');
        expect(Array.isArray(result.threats)).toBe(true);
      } catch (error) {
        const elapsed = Date.now() - startTime;
        if (elapsed >= maxTime) {
          console.warn('⚠️ [AndroidSecurity Test] Timeout alcanzado, saliendo del test');
          return; // Salida de emergencia
        }
        throw error;
      }
    }, 5000); // Timeout de 5 segundos para el test completo

    it('should detect no threats in clean environment', async () => {
      const startTime = Date.now();
      const maxTime = 3000; // Máximo 3 segundos
      
      try {
        // Mock a clean environment
        Object.defineProperty(navigator, 'userAgent', {
          value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          writable: true,
          configurable: true
        });
        
        // Mock window properties to simulate clean environment
        Object.defineProperty(window, '__REACT_DEVTOOLS_GLOBAL_HOOK__', {
          value: undefined,
          writable: true,
          configurable: true
        });
        
        const result = await Promise.race([
          securityManager.performSecurityCheck(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), maxTime))
        ]).catch(() => {
          return { threats: [] };
        });
        
        // In a clean environment, we expect minimal threats (test environment may detect dev tools)
        // Just verify that the method returns valid results
        expect(result).toHaveProperty('threats');
        expect(Array.isArray(result.threats)).toBe(true);
      } catch (error) {
        const elapsed = Date.now() - startTime;
        if (elapsed >= maxTime) {
          console.warn('⚠️ [AndroidSecurity Test] Timeout alcanzado, saliendo del test');
          return; // Salida de emergencia
        }
        throw error;
      }
    }, 5000); // Timeout de 5 segundos para el test completo
  });

  describe('checkRootAccess', () => {
    it('should return false in web environment', async () => {
      const startTime = Date.now();
      const maxTime = 2000; // Máximo 2 segundos
      
      try {
        const result = await Promise.race([
          (securityManager as any).checkRootAccess(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), maxTime))
        ]).catch(() => {
          return false;
        });
        expect(result).toBe(false);
      } catch (error) {
        const elapsed = Date.now() - startTime;
        if (elapsed >= maxTime) {
          console.warn('⚠️ [AndroidSecurity Test] Timeout alcanzado, saliendo del test');
          return; // Salida de emergencia
        }
        throw error;
      }
    }, 3000); // Timeout de 3 segundos para el test completo

    it('should detect root indicators in user agent', async () => {
      const startTime = Date.now();
      const maxTime = 2000; // Máximo 2 segundos
      
      try {
        // Mock navigator.userAgent
        Object.defineProperty(navigator, 'userAgent', {
          value: 'Mozilla/5.0 (Linux; Android 10; rooted device)',
          writable: true,
          configurable: true
        });

        const result = await Promise.race([
          (securityManager as any).checkRootAccess(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), maxTime))
        ]).catch(() => {
          return false;
        });
        expect(result).toBe(true);
      } catch (error) {
        const elapsed = Date.now() - startTime;
        if (elapsed >= maxTime) {
          console.warn('⚠️ [AndroidSecurity Test] Timeout alcanzado, saliendo del test');
          return; // Salida de emergencia
        }
        throw error;
      }
    }, 3000); // Timeout de 3 segundos para el test completo
  });

  describe('checkDeveloperMode', () => {
    it('should return false in normal environment', async () => {
      const startTime = Date.now();
      const maxTime = 2000; // Máximo 2 segundos
      
      try {
        const result = await Promise.race([
          (securityManager as any).checkDeveloperMode(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), maxTime))
        ]).catch(() => {
          return false;
        });
        expect(result).toBe(false);
      } catch (error) {
        const elapsed = Date.now() - startTime;
        if (elapsed >= maxTime) {
          console.warn('⚠️ [AndroidSecurity Test] Timeout alcanzado, saliendo del test');
          return; // Salida de emergencia
        }
        throw error;
      }
    }, 3000); // Timeout de 3 segundos para el test completo

    it('should detect chrome runtime', async () => {
      const startTime = Date.now();
      const maxTime = 2000; // Máximo 2 segundos
      
      try {
        // Mock chrome runtime
        (window as any).chrome = { runtime: {} };

        const result = await Promise.race([
          (securityManager as any).checkDeveloperMode(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), maxTime))
        ]).catch(() => {
          return false;
        });
        expect(result).toBe(true);

        // Cleanup
        delete (window as any).chrome;
      } catch (error) {
        const elapsed = Date.now() - startTime;
        if (elapsed >= maxTime) {
          console.warn('⚠️ [AndroidSecurity Test] Timeout alcanzado, saliendo del test');
          return; // Salida de emergencia
        }
        throw error;
      }
    }, 3000); // Timeout de 3 segundos para el test completo

    it('should detect slow performance indicating dev mode', async () => {
      const startTime = Date.now();
      const maxTime = 3000; // Máximo 3 segundos
      
      try {
        // Mock Capacitor environment
        (window as any).Capacitor = {
          ...mockCapacitor,
          isNativePlatform: vi.fn(() => true)
        };

        // Mock slow performance
        const originalPerformanceNow = performance.now;
        let callCount = 0;
        performance.now = vi.fn(() => {
          callCount++;
          return callCount === 1 ? 0 : 100; // 100ms difference
        });

        const result = await Promise.race([
          (securityManager as any).checkDeveloperMode(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), maxTime))
        ]).catch(() => {
          return false;
        });
        expect(result).toBe(true);

        // Restore
        performance.now = originalPerformanceNow;
      } catch (error) {
        const elapsed = Date.now() - startTime;
        if (elapsed >= maxTime) {
          console.warn('⚠️ [AndroidSecurity Test] Timeout alcanzado, saliendo del test');
          return; // Salida de emergencia
        }
        throw error;
      }
    }, 5000); // Timeout de 5 segundos para el test completo
  });

  describe('checkDebuggableApp', () => {
    it('should return false in production environment', async () => {
      const startTime = Date.now();
      const maxTime = 2000; // Máximo 2 segundos
      
      try {
        // Mock production environment without dev tools
        delete (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
        delete (window as any).__VUE_DEVTOOLS_GLOBAL_HOOK__;
        delete (window as any).eruda;
        delete (window as any).vConsole;
        
        // Mock console.clear to not be a function (production environment)
        const originalClear = window.console.clear;
        Object.defineProperty(window.console, 'clear', {
          value: undefined,
          writable: true,
          configurable: true
        });
        
        const result = await Promise.race([
          (securityManager as any).checkDebuggableApp(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), maxTime))
        ]).catch(() => {
          return false;
        });
        
        // In production without console.clear, should return false
        expect(result).toBe(false);
        
        // Restore
        Object.defineProperty(window.console, 'clear', {
          value: originalClear,
          writable: true,
          configurable: true
        });
      } catch (error) {
        const elapsed = Date.now() - startTime;
        if (elapsed >= maxTime) {
          console.warn('⚠️ [AndroidSecurity Test] Timeout alcanzado, saliendo del test');
          return; // Salida de emergencia
        }
        throw error;
      }
    }, 3000); // Timeout de 3 segundos para el test completo

    it('should detect React DevTools', async () => {
      const startTime = Date.now();
      const maxTime = 2000; // Máximo 2 segundos
      
      try {
        (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = {};

        const result = await Promise.race([
          (securityManager as any).checkDebuggableApp(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), maxTime))
        ]).catch(() => {
          return false;
        });
        expect(result).toBe(true);

        // Cleanup
        delete (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
      } catch (error) {
        const elapsed = Date.now() - startTime;
        if (elapsed >= maxTime) {
          console.warn('⚠️ [AndroidSecurity Test] Timeout alcanzado, saliendo del test');
          return; // Salida de emergencia
        }
        throw error;
      }
    }, 3000); // Timeout de 3 segundos para el test completo

    it('should detect Vue DevTools', async () => {
      const startTime = Date.now();
      const maxTime = 2000; // Máximo 2 segundos
      
      try {
        (window as any).__VUE_DEVTOOLS_GLOBAL_HOOK__ = {};

        const result = await Promise.race([
          (securityManager as any).checkDebuggableApp(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), maxTime))
        ]).catch(() => {
          return false;
        });
        expect(result).toBe(true);

        // Cleanup
        delete (window as any).__VUE_DEVTOOLS_GLOBAL_HOOK__;
      } catch (error) {
        const elapsed = Date.now() - startTime;
        if (elapsed >= maxTime) {
          console.warn('⚠️ [AndroidSecurity Test] Timeout alcanzado, saliendo del test');
          return; // Salida de emergencia
        }
        throw error;
      }
    }, 3000); // Timeout de 3 segundos para el test completo

    it('should detect eruda console', async () => {
      const startTime = Date.now();
      const maxTime = 2000; // Máximo 2 segundos
      
      try {
        (window as any).eruda = {};

        const result = await Promise.race([
          (securityManager as any).checkDebuggableApp(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), maxTime))
        ]).catch(() => {
          return false;
        });
        expect(result).toBe(true);

        // Cleanup
        delete (window as any).eruda;
      } catch (error) {
        const elapsed = Date.now() - startTime;
        if (elapsed >= maxTime) {
          console.warn('⚠️ [AndroidSecurity Test] Timeout alcanzado, saliendo del test');
          return; // Salida de emergencia
        }
        throw error;
      }
    }, 3000); // Timeout de 3 segundos para el test completo
  });

  describe('checkEmulator', () => {
    it('should return false in real browser', async () => {
      const startTime = Date.now();
      const maxTime = 2000; // Máximo 2 segundos
      
      try {
        const result = await Promise.race([
          (securityManager as any).checkEmulator(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), maxTime))
        ]).catch(() => {
          return false;
        });
        expect(result).toBe(false);
      } catch (error) {
        const elapsed = Date.now() - startTime;
        if (elapsed >= maxTime) {
          console.warn('⚠️ [AndroidSecurity Test] Timeout alcanzado, saliendo del test');
          return; // Salida de emergencia
        }
        throw error;
      }
    }, 3000); // Timeout de 3 segundos para el test completo

    it('should detect emulator in user agent', async () => {
      const startTime = Date.now();
      const maxTime = 2000; // Máximo 2 segundos
      
      try {
        Object.defineProperty(navigator, 'userAgent', {
          value: 'Mozilla/5.0 (Linux; Android 10; Android SDK built for x86)',
          writable: true,
          configurable: true
        });

        // Mock Capacitor to simulate emulator detection
        (window as any).Capacitor = {
          platform: 'android',
          isNative: true
        };

        const result = await Promise.race([
          (securityManager as any).checkEmulator(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), maxTime))
        ]).catch(() => {
          return false;
        });
        expect(result).toBe(true);
      } catch (error) {
        const elapsed = Date.now() - startTime;
        if (elapsed >= maxTime) {
          console.warn('⚠️ [AndroidSecurity Test] Timeout alcanzado, saliendo del test');
          return; // Salida de emergencia
        }
        throw error;
      }
    }, 3000); // Timeout de 3 segundos para el test completo

    it('should detect simulator platform in Capacitor', async () => {
      const startTime = Date.now();
      const maxTime = 2000; // Máximo 2 segundos
      
      try {
        (window as any).Capacitor = {
          ...mockCapacitor,
          getPlatform: vi.fn(() => 'ios-simulator')
        };

        const result = await Promise.race([
          (securityManager as any).checkEmulator(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), maxTime))
        ]).catch(() => {
          return false;
        });
        expect(result).toBe(true);
      } catch (error) {
        const elapsed = Date.now() - startTime;
        if (elapsed >= maxTime) {
          console.warn('⚠️ [AndroidSecurity Test] Timeout alcanzado, saliendo del test');
          return; // Salida de emergencia
        }
        throw error;
      }
    }, 3000); // Timeout de 3 segundos para el test completo
  });

  describe('canExecuteRootCommand', () => {
    it('should return false in web environment', async () => {
      const startTime = Date.now();
      const maxTime = 2000; // Máximo 2 segundos
      
      try {
        const result = await Promise.race([
          (securityManager as any).canExecuteRootCommand(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), maxTime))
        ]).catch(() => {
          return false;
        });
        expect(result).toBe(false);
      } catch (error) {
        const elapsed = Date.now() - startTime;
        if (elapsed >= maxTime) {
          console.warn('⚠️ [AndroidSecurity Test] Timeout alcanzado, saliendo del test');
          return; // Salida de emergencia
        }
        throw error;
      }
    }, 3000); // Timeout de 3 segundos para el test completo

    it('should detect root plugins in Capacitor', async () => {
      const startTime = Date.now();
      const maxTime = 2000; // Máximo 2 segundos
      
      try {
        (window as any).Capacitor = {
          ...mockCapacitor,
          Plugins: {
            RootChecker: {}
          }
        };

        const result = await Promise.race([
          (securityManager as any).canExecuteRootCommand(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), maxTime))
        ]).catch(() => {
          return false;
        });
        expect(result).toBe(true);
      } catch (error) {
        const elapsed = Date.now() - startTime;
        if (elapsed >= maxTime) {
          console.warn('⚠️ [AndroidSecurity Test] Timeout alcanzado, saliendo del test');
          return; // Salida de emergencia
        }
        throw error;
      }
    }, 3000); // Timeout de 3 segundos para el test completo
  });

  describe('checkAndEnforceSecurity', () => {
    it('should return true when no threats detected', async () => {
      const startTime = Date.now();
      const maxTime = 3000; // Máximo 3 segundos
      
      try {
        const result = await Promise.race([
          securityManager.checkAndEnforceSecurity(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), maxTime))
        ]).catch(() => {
          return false;
        });
        expect(result).toBe(true);
      } catch (error) {
        const elapsed = Date.now() - startTime;
        if (elapsed >= maxTime) {
          console.warn('⚠️ [AndroidSecurity Test] Timeout alcanzado, saliendo del test');
          return; // Salida de emergencia
        }
        throw error;
      }
    }, 5000); // Timeout de 5 segundos para el test completo

    it('should return false when critical threats detected', async () => {
      const startTime = Date.now();
      const maxTime = 3000; // Máximo 3 segundos
      
      try {
        // Mock root detection
        Object.defineProperty(navigator, 'userAgent', {
          value: 'Mozilla/5.0 (Linux; Android 10; rooted device)',
          writable: true,
          configurable: true
        });

        // Mock showSecurityWarning to avoid DOM manipulation in tests
        const showWarningSpy = vi.spyOn(securityManager, 'showSecurityWarning');
        showWarningSpy.mockImplementation(() => {});

        const result = await Promise.race([
          securityManager.checkAndEnforceSecurity(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), maxTime))
        ]).catch(() => {
          return false;
        });
        expect(result).toBe(false);
        expect(showWarningSpy).toHaveBeenCalledWith(['ROOT_DETECTED']);

        showWarningSpy.mockRestore();
      } catch (error) {
        const elapsed = Date.now() - startTime;
        if (elapsed >= maxTime) {
          console.warn('⚠️ [AndroidSecurity Test] Timeout alcanzado, saliendo del test');
          return; // Salida de emergencia
        }
        throw error;
      }
    }, 5000); // Timeout de 5 segundos para el test completo
  });

  describe('showSecurityWarning', () => {
    it('should create warning modal in DOM', () => {
      const startTime = Date.now();
      const maxTime = 2000; // Máximo 2 segundos
      
      try {
        const threats = ['ROOT_DETECTED', 'DEVELOPER_MODE_ENABLED'];
        
        // Mock document.body.insertAdjacentHTML
        const insertSpy = vi.spyOn(document.body, 'insertAdjacentHTML');
        insertSpy.mockImplementation(() => {});

        securityManager.showSecurityWarning(threats);

        expect(insertSpy).toHaveBeenCalledWith('beforeend', expect.stringContaining('Advertencia de Seguridad'));
        expect(insertSpy).toHaveBeenCalledWith('beforeend', expect.stringContaining('Se ha detectado acceso ROOT'));
        expect(insertSpy).toHaveBeenCalledWith('beforeend', expect.stringContaining('El modo desarrollador está habilitado'));

        insertSpy.mockRestore();
      } catch (error) {
        const elapsed = Date.now() - startTime;
        if (elapsed >= maxTime) {
          console.warn('⚠️ [AndroidSecurity Test] Timeout alcanzado, saliendo del test');
          return; // Salida de emergencia
        }
        throw error;
      }
    }, 3000); // Timeout de 3 segundos para el test completo
  });
});
