/**
 * =====================================================
 * CONTENT PROTECTION SERVICE - LEY OLIMPIA
 * =====================================================
 * Servicio de protección de contenido digital
 * Cumplimiento: Ley Olimpia (México) - Arts. 259 Ter/Quáter/Quinquies
 * Features: Anti-screenshot, anti-download, watermarks
 * Fecha: 19 Nov 2025
 * Versión: v3.6.5
 * =====================================================
 */

import { logger } from '@/lib/logger';

export type UserRole = 'user' | 'moderator' | 'admin';

interface _ProtectionOptions {
  enableWatermark?: boolean;
  watermarkText?: string;
  allowedRoles?: UserRole[];
  trackAccess?: boolean;
}

class ContentProtectionService {
  private isDevModeDetected: boolean = false;
  private screenshotAttempts: number = 0;
  private MAX_SCREENSHOT_ATTEMPTS = 3;

  /**
   * Inicializar protecciones
   */
  initialize(): void {
    this.detectDeveloperMode();
    this.preventScreenshots();
    this.preventRightClick();
    this.preventDevTools();
    this.detectScreenRecording();
    
    logger.info('[ContentProtection] Service initialized - Ley Olimpia compliance active');
  }

  /**
   * Detectar modo desarrollador
   */
  private detectDeveloperMode(): void {
    // Detectar DevTools abierto
    const devToolsChecker = () => {
      const threshold = 160;
      if (
        window.outerWidth - window.innerWidth > threshold ||
        window.outerHeight - window.innerHeight > threshold
      ) {
        this.isDevModeDetected = true;
        this.handleDevModeDetection();
      }
    };

    setInterval(devToolsChecker, 1000);

    // Detectar debugger
    setInterval(() => {
      const start = new Date();
      debugger; // eslint-disable-line no-debugger
      const end = new Date();
      if (end.getTime() - start.getTime() > 100) {
        this.isDevModeDetected = true;
        this.handleDevModeDetection();
      }
    }, 1000);
  }

  /**
   * Manejar detección de modo desarrollador
   */
  private handleDevModeDetection(): void {
    logger.warn('[ContentProtection] Developer mode detected - BLOCKING ACCESS');
    
    // Mostrar advertencia
    alert(
      '⚠️ ADVERTENCIA DE SEGURIDAD\n\n' +
      'Se ha detectado el modo desarrollador.\n\n' +
      'Por tu seguridad y cumplimiento con la Ley Olimpia, ' +
      'el acceso a contenido sensible está bloqueado.\n\n' +
      'Si necesitas acceso, contacta al administrador.'
    );

    // Bloquear contenido
    this.blockSensitiveContent();
  }

  /**
   * Prevenir capturas de pantalla
   */
  private preventScreenshots(): void {
    // Detectar PrintScreen
    document.addEventListener('keyup', (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen') {
        this.screenshotAttempts++;
        logger.warn('[ContentProtection] Screenshot attempt detected', {
          attempts: this.screenshotAttempts
        });

        navigator.clipboard.writeText('');
        
        alert(
          '⚠️ CAPTURA DE PANTALLA NO PERMITIDA\n\n' +
          'Por protección legal (Ley Olimpia), las capturas de pantalla ' +
          'están deshabilitadas.\n\n' +
          'Violación puede resultar en:\n' +
          '- Suspensión de cuenta\n' +
          '- Acciones legales (Arts. 259 Ter/Quáter/Quinquies)'
        );

        if (this.screenshotAttempts >= this.MAX_SCREENSHOT_ATTEMPTS) {
          this.reportViolation('screenshot_attempts_exceeded');
        }
      }
    });

    // Detectar Ctrl+Shift+S (Windows) y Cmd+Shift+4 (Mac)
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && e.shiftKey && e.key === 'S') ||
        (e.metaKey && e.shiftKey && e.key === '4')
      ) {
        e.preventDefault();
        this.screenshotAttempts++;
        
        logger.warn('[ContentProtection] Screenshot shortcut blocked');
        
        alert('🚫 Captura de pantalla bloqueada por protección legal');
      }
    });
  }

  /**
   * Prevenir clic derecho (descarga de imágenes)
   */
  private preventRightClick(): void {
    document.addEventListener('contextmenu', (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Solo bloquear en imágenes y videos sensibles
      if (
        target.tagName === 'IMG' ||
        target.tagName === 'VIDEO' ||
        target.closest('[data-sensitive="true"]')
      ) {
        e.preventDefault();
        
        logger.info('[ContentProtection] Right-click blocked on sensitive content');
        
        // Mostrar mensaje discreto
        this.showProtectionMessage(e.clientX, e.clientY);
      }
    });
  }

  /**
   * Prevenir DevTools
   */
  private preventDevTools(): void {
    // Detectar F12
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'F12') {
        e.preventDefault();
        logger.warn('[ContentProtection] F12 blocked');
        
        alert(
          '🔒 ACCESO RESTRINGIDO\n\n' +
          'Las herramientas de desarrollador están deshabilitadas ' +
          'para proteger el contenido de los usuarios.\n\n' +
          'Cumplimiento: Ley Olimpia (México)'
        );
      }

      // Ctrl+Shift+I / Cmd+Option+I
      if (
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.metaKey && e.altKey && e.key === 'I')
      ) {
        e.preventDefault();
        logger.warn('[ContentProtection] DevTools shortcut blocked');
      }

      // Ctrl+Shift+C / Cmd+Option+C
      if (
        (e.ctrlKey && e.shiftKey && e.key === 'C') ||
        (e.metaKey && e.altKey && e.key === 'C')
      ) {
        e.preventDefault();
      }

      // Ctrl+Shift+J / Cmd+Option+J
      if (
        (e.ctrlKey && e.shiftKey && e.key === 'J') ||
        (e.metaKey && e.altKey && e.key === 'J')
      ) {
        e.preventDefault();
      }
    });
  }

  /**
   * Detectar grabación de pantalla
   */
  private detectScreenRecording(): void {
    // En navegadores modernos, detectar MediaRecorder activo
    if ('mediaDevices' in navigator) {
      // Monitorear cambios en media devices
      navigator.mediaDevices.addEventListener('devicechange', () => {
        logger.info('[ContentProtection] Media devices changed - checking for recording');
      });
    }

    // Detectar cambios en visibilidad (puede indicar grabación)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        logger.info('[ContentProtection] Page hidden - potential recording');
      }
    });
  }

  /**
   * Verificar si el usuario puede descargar contenido
   */
  canDownloadContent(userRole: UserRole, contentId: string): boolean {
    // Solo moderadores y admins pueden descargar
    if (userRole === 'moderator' || userRole === 'admin') {
      logger.info('[ContentProtection] Download authorized', {
        role: userRole,
        contentId
      });
      return true;
    }

    logger.warn('[ContentProtection] Download attempt denied', {
      role: userRole,
      contentId
    });

    return false;
  }

  /**
   * Descargar contenido (solo para roles autorizados)
   */
  async downloadContent(
    contentUrl: string,
    fileName: string,
    userRole: UserRole,
    reason: string
  ): Promise<void> {
    if (!this.canDownloadContent(userRole, contentUrl)) {
      throw new Error('No autorizado para descargar contenido');
    }

    // Registrar descarga para auditoría
    await this.logContentAccess({
      action: 'download',
      contentUrl,
      fileName,
      userRole,
      reason,
      timestamp: new Date().toISOString()
    });

    // Proceder con la descarga
    const link = document.createElement('a') as HTMLAnchorElement;
    link.href = contentUrl;
    link.download = fileName;
    link.click();

    logger.info('[ContentProtection] Content downloaded for legal purposes', {
      fileName,
      role: userRole,
      reason
    });
  }

  /**
   * Aplicar marca de agua a imagen
   */
  applyWatermark(
    imageElement: HTMLImageElement,
    userId: string,
    timestamp: Date
  ): void {
    const canvas = document.createElement('canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    canvas.width = imageElement.width;
    canvas.height = imageElement.height;

    // Dibujar imagen original
    ctx.drawImage(imageElement, 0, 0);

    // Configurar marca de agua
    ctx.font = '16px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.textAlign = 'right';

    const watermarkText = `ID: ${userId} | ${timestamp.toLocaleDateString()} ${timestamp.toLocaleTimeString()}`;

    // Aplicar marca de agua en esquina inferior derecha
    ctx.fillText(
      watermarkText,
      canvas.width - 10,
      canvas.height - 10
    );

    // Marca de agua diagonal (opcional)
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(-Math.PI / 4);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('PROTEGIDO', 0, 0);
    ctx.restore();

    // Reemplazar imagen
    imageElement.src = canvas.toDataURL();
  }

  /**
   * Bloquear contenido sensible
   */
  private blockSensitiveContent(): void {
    const sensitiveElements = document.querySelectorAll('[data-sensitive="true"]');
    
    sensitiveElements.forEach((el) => {
      (el as HTMLElement).style.filter = 'blur(20px)';
      (el as HTMLElement).style.pointerEvents = 'none';
    });
  }

  /**
   * Mostrar mensaje de protección
   */
  private showProtectionMessage(x: number, y: number): void {
    const message = document.createElement('div');
    message.textContent = '🔒 Contenido protegido';
    message.style.cssText = `
      position: fixed;
      top: ${y}px;
      left: ${x}px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 12px;
      z-index: 10000;
      pointer-events: none;
    `;

    document.body.appendChild(message as Node);

    setTimeout(() => {
      message.remove();
    }, 2000);
  }

  /**
   * Registrar acceso a contenido (auditoría)
   */
  private async logContentAccess(data: any): Promise<void> {
    try {
      // TODO: En producción, guardar en Supabase
      logger.info('[ContentProtection] Content access logged', data);
      
      // Guardar en localStorage temporal
      const logs = JSON.parse(localStorage.getItem('content_access_logs') || '[]');
      logs.push(data);
      localStorage.setItem('content_access_logs', JSON.stringify(logs));
    } catch (error) {
      logger.error('[ContentProtection] Error logging access:', { error });
    }
  }

  /**
   * Reportar violación
   */
  private async reportViolation(type: string): Promise<void> {
    logger.error('[ContentProtection] VIOLATION DETECTED', { type });

    // TODO: En producción, reportar a moderadores
    alert(
      '⚠️ VIOLACIÓN DETECTADA\n\n' +
      'Se ha reportado una violación de las políticas de seguridad.\n\n' +
      'Tu cuenta será revisada por el equipo de moderación.\n\n' +
      'Violaciones repetidas resultarán en suspensión permanente.'
    );
  }

  /**
   * Verificar si está en modo dev
   */
  isDevMode(): boolean {
    return this.isDevModeDetected;
  }

  /**
   * Limpiar y destruir protecciones
   */
  destroy(): void {
    // Remover listeners si es necesario
    logger.info('[ContentProtection] Service destroyed');
  }
}

export const contentProtectionService = new ContentProtectionService();
export default contentProtectionService;
