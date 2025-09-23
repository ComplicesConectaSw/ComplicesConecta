import { useEffect, useCallback } from 'react';
import { logger } from '@/lib/logger';

/**
 * Hook para protección contra capturas de pantalla en web
 * Implementa listeners para detectar y bloquear intentos de captura
 */

interface ScreenshotProtectionOptions {
  enabled?: boolean;
  showWarnings?: boolean;
  logAttempts?: boolean;
  onAttemptDetected?: (method: string) => void;
}

export const useScreenshotProtection = (options: ScreenshotProtectionOptions = {}) => {
  const {
    enabled = true,
    showWarnings = true,
    logAttempts = true,
    onAttemptDetected
  } = options;

  const showWarningModal = useCallback((method: string) => {
    if (!showWarnings) return;

    const warningDiv = document.createElement('div');
    warningDiv.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: Arial, sans-serif;
      ">
        <div style="
          background: white;
          padding: 30px;
          border-radius: 12px;
          text-align: center;
          max-width: 400px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        ">
          <div style="
            font-size: 48px;
            margin-bottom: 15px;
          ">🛡️</div>
          <h2 style="
            color: #dc2626;
            margin: 0 0 15px 0;
            font-size: 20px;
          ">CONTENIDO PROTEGIDO</h2>
          <p style="
            color: #374151;
            margin: 0 0 20px 0;
            line-height: 1.5;
          ">
            Las capturas de pantalla están restringidas en este contenido.<br>
            Método detectado: <strong>${method}</strong>
          </p>
          <button onclick="this.parentElement.parentElement.remove()" style="
            background: #dc2626;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
          ">Entendido</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(warningDiv);
    
    // Auto-remove después de 5 segundos
    setTimeout(() => {
      if (warningDiv.parentNode) {
        warningDiv.parentNode.removeChild(warningDiv);
      }
    }, 5000);
  }, [showWarnings]);

  const handleKeyboardAttempt = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    let detected = false;
    let method = '';

    // Detectar Print Screen
    if (event.key === 'PrintScreen') {
      detected = true;
      method = 'Print Screen';
    }
    
    // Detectar Ctrl+S (Guardar)
    if (event.ctrlKey && event.key === 's') {
      detected = true;
      method = 'Ctrl+S (Guardar)';
    }
    
    // Detectar Ctrl+Shift+I (DevTools)
    if (event.ctrlKey && event.shiftKey && event.key === 'I') {
      detected = true;
      method = 'DevTools (Ctrl+Shift+I)';
    }
    
    // Detectar F12 (DevTools)
    if (event.key === 'F12') {
      detected = true;
      method = 'DevTools (F12)';
    }
    
    // Detectar Ctrl+U (Ver código fuente)
    if (event.ctrlKey && event.key === 'u') {
      detected = true;
      method = 'Ver código fuente (Ctrl+U)';
    }

    if (detected) {
      event.preventDefault();
      event.stopPropagation();
      
      if (logAttempts) {
        logger.warn('Intento de captura detectado:', { method, timestamp: new Date().toISOString() });
      }
      
      showWarningModal(method);
      onAttemptDetected?.(method);
      
      return false;
    }
  }, [enabled, logAttempts, showWarningModal, onAttemptDetected]);

  const handleContextMenu = useCallback((event: MouseEvent) => {
    if (!enabled) return;

    event.preventDefault();
    
    if (logAttempts) {
      logger.warn('Intento de menú contextual bloqueado:', { timestamp: new Date().toISOString() });
    }
    
    showWarningModal('Clic derecho (Menú contextual)');
    onAttemptDetected?.('Clic derecho');
    
    return false;
  }, [enabled, logAttempts, showWarningModal, onAttemptDetected]);

  const handleDragStart = useCallback((event: DragEvent) => {
    if (!enabled) return;

    event.preventDefault();
    
    if (logAttempts) {
      logger.warn('Intento de arrastrar imagen bloqueado:', { timestamp: new Date().toISOString() });
    }
    
    return false;
  }, [enabled, logAttempts]);

  const handleSelectStart = useCallback((event: Event) => {
    if (!enabled) return;

    const target = event.target as HTMLElement;
    if (target.tagName === 'IMG' || target.tagName === 'VIDEO') {
      event.preventDefault();
      return false;
    }
  }, [enabled]);

  // Detectar DevTools abierto
  const detectDevTools = useCallback(() => {
    if (!enabled) return;

    const threshold = 160;
    
    setInterval(() => {
      if (window.outerHeight - window.innerHeight > threshold || 
          window.outerWidth - window.innerWidth > threshold) {
        
        if (logAttempts) {
          logger.warn('DevTools potencialmente abierto:', { 
            outerHeight: window.outerHeight,
            innerHeight: window.innerHeight,
            outerWidth: window.outerWidth,
            innerWidth: window.innerWidth,
            timestamp: new Date().toISOString()
          });
        }
        
        showWarningModal('DevTools detectado');
        onAttemptDetected?.('DevTools');
      }
    }, 1000);
  }, [enabled, logAttempts, showWarningModal, onAttemptDetected]);

  // Bloquear selección de texto en elementos multimedia
  const addMediaProtection = useCallback(() => {
    if (!enabled) return;

    const style = document.createElement('style');
    style.textContent = `
      img, video, audio {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-user-drag: none !important;
        -khtml-user-drag: none !important;
        -moz-user-drag: none !important;
        -o-user-drag: none !important;
        user-drag: none !important;
        pointer-events: auto !important;
      }
      
      .protected-content {
        -webkit-touch-callout: none !important;
        -webkit-user-select: none !important;
        -khtml-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
      }
      
      .protected-content::selection {
        background: transparent !important;
      }
      
      .protected-content::-moz-selection {
        background: transparent !important;
      }
    `;
    
    document.head.appendChild(style);
    
    return () => {
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    // Agregar event listeners
    document.addEventListener('keydown', handleKeyboardAttempt, true);
    document.addEventListener('contextmenu', handleContextMenu, true);
    document.addEventListener('dragstart', handleDragStart, true);
    document.addEventListener('selectstart', handleSelectStart, true);
    
    // Aplicar protección CSS
    const removeMediaProtection = addMediaProtection();
    
    // Iniciar detección de DevTools
    detectDevTools();
    
    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyboardAttempt, true);
      document.removeEventListener('contextmenu', handleContextMenu, true);
      document.removeEventListener('dragstart', handleDragStart, true);
      document.removeEventListener('selectstart', handleSelectStart, true);
      removeMediaProtection?.();
    };
  }, [enabled, handleKeyboardAttempt, handleContextMenu, handleDragStart, handleSelectStart, addMediaProtection, detectDevTools]);

  return {
    isProtectionEnabled: enabled,
    showWarning: showWarningModal
  };
};
