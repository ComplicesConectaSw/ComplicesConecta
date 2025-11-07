/**
 * Utilidad para capturar y mostrar errores de consola
 * Versión: 3.5.1
 * 
 * Uso: Importar y llamar captureConsoleErrors() en la consola del navegador
 */

interface ConsoleError {
  type: 'error' | 'warning' | 'log';
  message: string;
  timestamp: string;
  stack?: string;
  source?: string;
  line?: number;
  column?: number;
}

class ConsoleErrorCapture {
  private errors: ConsoleError[] = [];
  private originalError: typeof console.error;
  private originalWarn: typeof console.warn;
  private originalLog: typeof console.log;
  private errorHandler: ((event: ErrorEvent) => void) | null = null;
  private rejectionHandler: ((event: PromiseRejectionEvent) => void) | null = null;

  constructor() {
    this.originalError = console.error;
    this.originalWarn = console.warn;
    this.originalLog = console.log;
  }

  startCapture(): void {
    // Capturar console.error
    console.error = (...args: any[]) => {
      const message = args.map(arg => {
        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg, null, 2);
          } catch {
            return String(arg);
          }
        }
        return String(arg);
      }).join(' ');

      this.errors.push({
        type: 'error',
        message,
        timestamp: new Date().toISOString(),
        stack: args.find(arg => arg?.stack)?.stack
      });

      this.originalError.apply(console, args);
    };

    // Capturar console.warn
    console.warn = (...args: any[]) => {
      const message = args.map(arg => String(arg)).join(' ');

      this.errors.push({
        type: 'warning',
        message,
        timestamp: new Date().toISOString()
      });

      this.originalWarn.apply(console, args);
    };

    // Capturar errores globales
    this.errorHandler = (event: ErrorEvent) => {
      this.errors.push({
        type: 'error',
        message: event.message || 'Unknown error',
        timestamp: new Date().toISOString(),
        source: event.filename || 'unknown',
        line: event.lineno || 0,
        column: event.colno || 0,
        stack: event.error?.stack
      });
    };

    window.addEventListener('error', this.errorHandler, true);

    // Capturar promise rejections
    this.rejectionHandler = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const message = reason?.message || reason?.toString() || 'Unhandled promise rejection';

      this.errors.push({
        type: 'error',
        message: `Unhandled Promise Rejection: ${message}`,
        timestamp: new Date().toISOString(),
        stack: reason?.stack
      });
    };

    window.addEventListener('unhandledrejection', this.rejectionHandler);

    console.log('✅ Captura de errores de consola iniciada');
    console.log('💡 Comandos disponibles en la consola:');
    console.log('   - showErrorReport() - Ver reporte completo de errores');
    console.log('   - getConsoleErrors() - Obtener array de errores');
    console.log('   - exportConsoleErrors() - Exportar errores como JSON (se copia al portapapeles)');
    console.log('   - clearConsoleErrors() - Limpiar errores capturados');
    console.log('   - stopErrorCapture() - Detener captura');
    console.log('   - startErrorCapture() - Reiniciar captura');
    
    // Detectar si se accede vía túnel
    if (window.location.hostname.includes('.loca.lt') || 
        window.location.hostname.includes('.ngrok-free.app') ||
        window.location.hostname.includes('.trycloudflare.com')) {
      console.log('🌐 Acceso detectado vía túnel:', window.location.href);
      console.log('📊 Los errores se capturan automáticamente. Usa showErrorReport() para ver el resumen.');
      console.log('💾 Usa exportConsoleErrors() para exportar todos los errores como JSON.');
      
      // Mostrar errores automáticamente después de 3 segundos si hay errores
      setTimeout(() => {
        const errors = this.getErrorsByType('error');
        if (errors.length > 0) {
          console.warn(`⚠️ Se detectaron ${errors.length} error(es). Ejecuta showErrorReport() para ver detalles.`);
        }
      }, 3000);
    }
  }

  stopCapture(): void {
    console.error = this.originalError;
    console.warn = this.originalWarn;
    console.log = this.originalLog;

    if (this.errorHandler) {
      window.removeEventListener('error', this.errorHandler, true);
    }

    if (this.rejectionHandler) {
      window.removeEventListener('unhandledrejection', this.rejectionHandler);
    }

    console.log('🛑 Captura de errores de consola detenida');
  }

  getErrors(): ConsoleError[] {
    return [...this.errors];
  }

  getErrorsByType(type: 'error' | 'warning' | 'log'): ConsoleError[] {
    return this.errors.filter(e => e.type === type);
  }

  clearErrors(): void {
    this.errors = [];
    console.log('🗑️ Errores de consola limpiados');
  }

  exportErrors(): string {
    const report = {
      errors: this.getErrorsByType('error'),
      warnings: this.getErrorsByType('warning'),
      logs: this.getErrorsByType('log'),
      total: this.errors.length,
      url: window.location.href,
      isTunnel: window.location.hostname.includes('.loca.lt') || 
                window.location.hostname.includes('.ngrok-free.app') ||
                window.location.hostname.includes('.trycloudflare.com'),
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    };
    
    const json = JSON.stringify(report, null, 2);
    
    // Copiar al portapapeles si es posible
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(json).then(() => {
        console.log('✅ Errores exportados y copiados al portapapeles');
      }).catch(() => {
        console.log('⚠️ No se pudo copiar al portapapeles, pero los errores están en la consola');
      });
    }
    
    return json;
  }

  showReport(): {
    errors: ConsoleError[];
    warnings: ConsoleError[];
    logs: ConsoleError[];
    total: number;
    url: string;
    isTunnel: boolean;
    timestamp: string;
  } {
    console.group('📊 Reporte de Errores de Consola');
    
    // Información del entorno
    const isTunnel = window.location.hostname.includes('.loca.lt') || 
                     window.location.hostname.includes('.ngrok-free.app') ||
                     window.location.hostname.includes('.trycloudflare.com');
    
    if (isTunnel) {
      console.log('🌐 Acceso vía túnel:', window.location.href);
    }
    console.log('📍 URL actual:', window.location.href);
    console.log('⏰ Reporte generado:', new Date().toISOString());
    
    const errors = this.getErrorsByType('error');
    const warnings = this.getErrorsByType('warning');
    const logs = this.getErrorsByType('log');

    console.log(`\n🔴 Errores: ${errors.length}`);
    if (errors.length > 0) {
      console.table(errors);
      errors.forEach((error, index) => {
        console.log(`\n${index + 1}. ${error.message}`);
        if (error.stack) {
          console.log(`   Stack: ${error.stack.substring(0, 200)}...`);
        }
        if (error.source) {
          console.log(`   Source: ${error.source}:${error.line}:${error.column}`);
        }
        if (error.timestamp) {
          console.log(`   Timestamp: ${error.timestamp}`);
        }
      });
    } else {
      console.log('✅ No se encontraron errores');
    }

    console.log(`\n⚠️ Warnings: ${warnings.length}`);
    if (warnings.length > 0) {
      console.table(warnings);
    } else {
      console.log('✅ No se encontraron warnings');
    }

    console.log(`\n📝 Logs capturados: ${logs.length}`);
    if (logs.length > 0 && logs.length <= 50) {
      console.table(logs);
    } else if (logs.length > 50) {
      console.log(`⚠️ Hay ${logs.length} logs (mostrando solo los primeros 50)`);
      console.table(logs.slice(0, 50));
    }

    console.log(`\n📊 Total de eventos capturados: ${this.errors.length}`);
    console.groupEnd();

    return {
      errors,
      warnings,
      logs,
      total: this.errors.length,
      url: window.location.href,
      isTunnel,
      timestamp: new Date().toISOString()
    };
  }
}

// Instancia global
let errorCapture: ConsoleErrorCapture | null = null;

export function startErrorCapture(): void {
  if (!errorCapture) {
    errorCapture = new ConsoleErrorCapture();
  }
  errorCapture.startCapture();
}

export function stopErrorCapture(): void {
  if (errorCapture) {
    errorCapture.stopCapture();
  }
}

export function getConsoleErrors(): ConsoleError[] {
  return errorCapture?.getErrors() || [];
}

export function showErrorReport(): {
  errors: ConsoleError[];
  warnings: ConsoleError[];
  logs: ConsoleError[];
  total: number;
  url: string;
  isTunnel: boolean;
  timestamp: string;
} | null {
  return errorCapture?.showReport() || null;
}

export function clearConsoleErrors(): void {
  errorCapture?.clearErrors();
}

export function exportConsoleErrors(): string | null {
  return errorCapture?.exportErrors() || null;
}

// Hacer disponible globalmente para uso en consola
// CRÍTICO: Asegurar que las funciones estén disponibles inmediatamente
// Exponer ANTES de cualquier otra cosa para que estén disponibles desde el inicio
if (typeof window !== 'undefined') {
  // Exponer funciones inmediatamente usando Object.defineProperty para asegurar que se asignen
  try {
    Object.defineProperty(window, 'startErrorCapture', {
      value: startErrorCapture,
      writable: true,
      configurable: true,
      enumerable: true
    });
    Object.defineProperty(window, 'stopErrorCapture', {
      value: stopErrorCapture,
      writable: true,
      configurable: true,
      enumerable: true
    });
    Object.defineProperty(window, 'getConsoleErrors', {
      value: getConsoleErrors,
      writable: true,
      configurable: true,
      enumerable: true
    });
    Object.defineProperty(window, 'showErrorReport', {
      value: showErrorReport,
      writable: true,
      configurable: true,
      enumerable: true
    });
    Object.defineProperty(window, 'clearConsoleErrors', {
      value: clearConsoleErrors,
      writable: true,
      configurable: true,
      enumerable: true
    });
    Object.defineProperty(window, 'exportConsoleErrors', {
      value: exportConsoleErrors,
      writable: true,
      configurable: true,
      enumerable: true
    });
    
    // También asignar directamente como fallback
    (window as any).startErrorCapture = startErrorCapture;
    (window as any).stopErrorCapture = stopErrorCapture;
    (window as any).getConsoleErrors = getConsoleErrors;
    (window as any).showErrorReport = showErrorReport;
    (window as any).clearConsoleErrors = clearConsoleErrors;
    (window as any).exportConsoleErrors = exportConsoleErrors;
    
    // Verificar que las funciones se expusieron correctamente
    if ((window as any).showErrorReport) {
      console.log('✅ Funciones de captura de errores disponibles en consola');
    }
  } catch {
    // Fallback: asignar directamente si Object.defineProperty falla
    (window as any).startErrorCapture = startErrorCapture;
    (window as any).stopErrorCapture = stopErrorCapture;
    (window as any).getConsoleErrors = getConsoleErrors;
    (window as any).showErrorReport = showErrorReport;
    (window as any).clearConsoleErrors = clearConsoleErrors;
    (window as any).exportConsoleErrors = exportConsoleErrors;
    console.warn('⚠️ Error exponiendo funciones con Object.defineProperty, usando asignación directa');
  }
  
  // Iniciar captura automáticamente en desarrollo
  // Verificar de forma segura si estamos en desarrollo
  try {
    const isDev = import.meta.env?.DEV ?? false;
    
    if (isDev) {
      startErrorCapture();
      console.log('✅ Captura de errores de consola iniciada automáticamente');
      console.log('💡 Usa showErrorReport() en la consola para ver el reporte completo');
      
      // Verificar que las funciones estén disponibles después de un breve delay
      setTimeout(() => {
        if (!(window as any).showErrorReport) {
          console.warn('⚠️ showErrorReport no está disponible, reintentando...');
          (window as any).showErrorReport = showErrorReport;
          (window as any).getConsoleErrors = getConsoleErrors;
          (window as any).exportConsoleErrors = exportConsoleErrors;
        }
      }, 100);
    }
  } catch {
    // Si import.meta no está disponible, no iniciar captura automática
    // Las funciones seguirán disponibles manualmente
  }
}
