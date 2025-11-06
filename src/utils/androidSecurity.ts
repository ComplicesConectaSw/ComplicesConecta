/**
 * Utilidades de seguridad para Android APK
 * Detecta root, modo desarrollador y otras amenazas de seguridad
 */

import { logger } from '@/lib/logger';

// Extender la interfaz Window para incluir Capacitor
declare global {
  interface Window {
    Capacitor?: {
      Plugins: Record<string, unknown>;
      isNativePlatform(): boolean;
      getPlatform(): string;
    };
  }
}

export interface SecurityCheck {
  isRooted: boolean;
  isDeveloperMode: boolean;
  isDebuggable: boolean;
  isEmulator: boolean;
  threats: string[];
}

export class AndroidSecurityManager {
  private static instance: AndroidSecurityManager;
  private securityChecks: SecurityCheck = {
    isRooted: false,
    isDeveloperMode: false,
    isDebuggable: false,
    isEmulator: false,
    threats: []
  };

  public static getInstance(): AndroidSecurityManager {
    if (!AndroidSecurityManager.instance) {
      AndroidSecurityManager.instance = new AndroidSecurityManager();
    }
    return AndroidSecurityManager.instance;
  }

  /**
   * Ejecuta todas las verificaciones de seguridad
   */
  public async performSecurityCheck(): Promise<SecurityCheck> {
    this.securityChecks = {
      isRooted: await this.checkRootAccess(),
      isDeveloperMode: await this.checkDeveloperMode(),
      isDebuggable: await this.checkDebuggableApp(),
      isEmulator: await this.checkEmulator(),
      threats: []
    };

    // Agregar amenazas detectadas
    if (this.securityChecks.isRooted) {
      this.securityChecks.threats.push('ROOT_DETECTED');
    }
    if (this.securityChecks.isDeveloperMode) {
      this.securityChecks.threats.push('DEVELOPER_MODE_ENABLED');
    }
    if (this.securityChecks.isDebuggable) {
      this.securityChecks.threats.push('DEBUG_MODE_ENABLED');
    }
    if (this.securityChecks.isEmulator) {
      this.securityChecks.threats.push('EMULATOR_DETECTED');
    }

    return this.securityChecks;
  }

  /**
   * Verifica si el dispositivo tiene acceso root
   */
  private async checkRootAccess(): Promise<boolean> {
    try {
      // Verificar archivos comunes de root
      const rootFiles = [
        '/system/app/Superuser.apk',
        '/sbin/su',
        '/system/bin/su',
        '/system/xbin/su',
        '/data/local/xbin/su',
        '/data/local/bin/su',
        '/system/sd/xbin/su',
        '/system/bin/failsafe/su',
        '/data/local/su',
        '/su/bin/su'
      ];

      // En Capacitor, verificar si está disponible sin imports dinámicos
      if (typeof window !== 'undefined' && window.Capacitor) {
        // Intentar verificar archivos usando métodos disponibles en Capacitor
        try {
          // Usar fetch para intentar acceder a archivos del sistema
          for (const file of rootFiles) {
            try {
              const response = await fetch(`file://${file}`);
              if (response.ok) {
                return true; // Archivo de root encontrado
              }
            } catch {
              // Archivo no accesible, continuar
            }
          }
        } catch {
          // Método no disponible, continuar con otras verificaciones
        }
      }

      // Verificar propiedades del sistema que indican root
      const userAgent = navigator.userAgent.toLowerCase();
      if (userAgent.includes('rooted') || userAgent.includes('superuser')) {
        return true;
      }

      // Verificar comandos de root disponibles
      if (await this.canExecuteRootCommand()) {
        return true;
      }

      return false;
    } catch (error) {
      logger.warn('Error checking root access', { error });
      return false;
    }
  }

  /**
   * Verifica si el modo desarrollador está habilitado
   */
  private async checkDeveloperMode(): Promise<boolean> {
    try {
      if (typeof window !== 'undefined' && window.Capacitor) {
        // Verificar propiedades específicas del dispositivo en Capacitor
        try {
          // Usar métodos nativos disponibles en Capacitor para detectar modo dev
          const isNative = window.Capacitor.isNativePlatform();
          if (isNative) {
            // En modo desarrollador, el rendimiento es típicamente más lento
            const start = performance.now();
            for (let i = 0; i < 10000; i++) {
              Math.random();
            }
            const end = performance.now();
            
            // Si toma más de 50ms, posible modo desarrollador
            if (end - start > 50) {
              return true;
            }
          }
        } catch {
          // Método no disponible, continuar
        }
      }

      // Verificar si WebView permite debugging
      const windowWithChrome = window as Window & { chrome?: { runtime?: unknown } };
      if (windowWithChrome.chrome && windowWithChrome.chrome.runtime) {
        return true;
      }

      // Verificar timing attacks (los dispositivos con modo dev son más lentos)
      const start = performance.now();
      for (let i = 0; i < 1000; i++) {
        Math.random();
      }
      const end = performance.now();
      
      // Si toma más de 10ms, posible modo desarrollador
      if (end - start > 10) {
        return true;
      }

      return false;
    } catch (error) {
      logger.warn('Error checking developer mode', { error });
      return false;
    }
  }

  /**
   * Verifica si la aplicación es debuggeable
   */
  private async checkDebuggableApp(): Promise<boolean> {
    try {
      // En producción, estas propiedades no deberían estar disponibles
      if (typeof window !== 'undefined') {
        // Verificar si hay herramientas de desarrollo disponibles
        const windowWithDevTools = window as Window & {
          __REACT_DEVTOOLS_GLOBAL_HOOK__?: unknown;
          __VUE_DEVTOOLS_GLOBAL_HOOK__?: unknown;
          eruda?: unknown;
          vConsole?: unknown;
        };
        
        if (windowWithDevTools.__REACT_DEVTOOLS_GLOBAL_HOOK__ ||
            windowWithDevTools.__VUE_DEVTOOLS_GLOBAL_HOOK__ ||
            windowWithDevTools.eruda ||
            windowWithDevTools.vConsole) {
          return true;
        }

        // Verificar si console está disponible y modificado
        if (window.console && typeof window.console.clear === 'function') {
          const originalClear = window.console.clear;
          let isDebuggable = false;
          
          window.console.clear = function() {
            isDebuggable = true;
            return originalClear.call(this);
          };
          
          try {
            window.console.clear();
          } catch {
            // Ignorar errores
          }
          
          window.console.clear = originalClear;
          return isDebuggable;
        }
      }

      return false;
    } catch (error) {
      logger.warn('Error checking debuggable app', { error });
      return false;
    }
  }

  /**
   * Verifica si se está ejecutando en un emulador
   */
  private async checkEmulator(): Promise<boolean> {
    try {
      if (typeof window !== 'undefined' && window.Capacitor) {
        // Verificar propiedades típicas de emuladores usando user agent
        const userAgent = navigator.userAgent.toLowerCase();
        const emulatorIndicators = [
          'generic', 'unknown', 'emulator', 'simulator',
          'genymotion', 'bluestacks', 'android sdk'
        ];
        
        for (const indicator of emulatorIndicators) {
          if (userAgent.includes(indicator)) {
            return true;
          }
        }

        // Verificar características del navegador en Capacitor
        try {
          const platform = window.Capacitor.getPlatform();
          if (platform.toLowerCase().includes('simulator') || 
              platform.toLowerCase().includes('emulator')) {
            return true;
          }
        } catch {
          // Método no disponible, continuar
        }
      }

      // Verificar características del navegador que indican emulador
      const userAgent = navigator.userAgent.toLowerCase();
      if (userAgent.includes('emulator') || 
          userAgent.includes('simulator') ||
          userAgent.includes('genymotion')) {
        return true;
      }

      return false;
    } catch (error) {
      logger.warn('Error checking emulator', { error });
      return false;
    }
  }

  /**
   * Intenta ejecutar un comando que requiere root
   */
  private async canExecuteRootCommand(): Promise<boolean> {
    try {
      // En un entorno web/Capacitor, esto es limitado
      // Pero podemos verificar si ciertas APIs están disponibles
      if (typeof window !== 'undefined' && window.Capacitor) {
        // Verificar si hay plugins no estándar que requieren root
        const plugins = window.Capacitor.Plugins;
        
        // Plugins que típicamente requieren root
        const rootRequiredPlugins = [
          'RootChecker', 'SuperUser', 'SystemSettings', 'DeviceAdmin'
        ];
        
        for (const plugin of rootRequiredPlugins) {
          if (plugins[plugin]) {
            return true;
          }
        }
      }

      return false;
    } catch {
      return false;
    }
  }

  /**
   * Muestra el modal de advertencia de seguridad
   */
  public showSecurityWarning(threats: string[]): void {
    const threatMessages: Record<string, string> = {
      ROOT_DETECTED: 'Se ha detectado acceso ROOT en el dispositivo',
      DEVELOPER_MODE_ENABLED: 'El modo desarrollador está habilitado',
      DEBUG_MODE_ENABLED: 'El modo debug está activo',
      EMULATOR_DETECTED: 'Se detectó que la app se ejecuta en un emulador'
    };

    const messages = threats.map(threat => threatMessages[threat] || threat);
    
    const warningHtml = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">
        <div style="
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 2rem;
          border-radius: 20px;
          max-width: 400px;
          text-align: center;
          color: white;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        ">
          <div style="font-size: 3rem; margin-bottom: 1rem;">🔒</div>
          <h2 style="margin-bottom: 1rem; font-size: 1.5rem;">Advertencia de Seguridad</h2>
          <p style="margin-bottom: 1.5rem; line-height: 1.6;">
            Por motivos de seguridad, ComplicesConecta no puede ejecutarse en este dispositivo:
          </p>
          <ul style="text-align: left; margin-bottom: 1.5rem; padding-left: 1rem;">
            ${messages.map(msg => `<li style="margin-bottom: 0.5rem;">• ${msg}</li>`).join('')}
          </ul>
          <p style="margin-bottom: 1.5rem; font-size: 0.9rem; opacity: 0.9;">
            Para utilizar la aplicación, desactive el modo desarrollador y/o root en su dispositivo.
          </p>
          <button onclick="window.close()" style="
            background: rgba(255, 255, 255, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.3);
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 25px;
            cursor: pointer;
            font-size: 1rem;
          ">
            Cerrar Aplicación
          </button>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', warningHtml);
  }

  /**
   * Verifica la seguridad y bloquea la app si es necesario
   */
  public async checkAndEnforceSecurity(): Promise<boolean> {
    const securityCheck = await this.performSecurityCheck();
    
    // Si hay amenazas críticas, bloquear la aplicación
    const criticalThreats = securityCheck.threats.filter(threat => 
      threat === 'ROOT_DETECTED' || threat === 'DEVELOPER_MODE_ENABLED'
    );

    if (criticalThreats.length > 0) {
      this.showSecurityWarning(criticalThreats);
      return false; // Bloquear aplicación
    }

    return true; // Permitir acceso
  }
}

// Instancia singleton
export const androidSecurity = AndroidSecurityManager.getInstance();
