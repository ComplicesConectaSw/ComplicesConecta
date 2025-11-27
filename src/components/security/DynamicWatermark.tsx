import React, { useEffect, useRef } from 'react';
import { useAuth } from '@/features/auth/useAuth';

/**
 * Componente de watermark dinámico para contenido sensible
 * Superpone información de identificación sobre media protegida
 */

interface DynamicWatermarkProps {
  children: React.ReactNode;
  intensity?: 'light' | 'medium' | 'heavy';
  showUserId?: boolean;
  showTimestamp?: boolean;
  customText?: string;
  className?: string;
}

export const DynamicWatermark: React.FC<DynamicWatermarkProps> = ({
  children,
  intensity = 'medium',
  showUserId = true,
  showTimestamp = true,
  customText,
  className = ''
}) => {
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);

  const generateWatermarkText = (): string => {
    const parts: string[] = [];
    
    if (customText) {
      parts.push(customText);
    }
    
    if (showUserId && user?.id) {
      parts.push(`ID: ${user.id.slice(-8)}`);
    }
    
    if (showTimestamp) {
      const now = new Date();
      parts.push(now.toLocaleString('es-MX', { 
        timeZone: 'America/Mexico_City',
        hour12: false,
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }));
    }
    
    return parts.join(' • ');
  };

  const getIntensitySettings = () => {
    switch (intensity) {
      case 'light':
        return {
          opacity: 0.1,
          fontSize: '10px',
          spacing: '150px',
          angle: 15
        };
      case 'heavy':
        return {
          opacity: 0.3,
          fontSize: '14px',
          spacing: '80px',
          angle: 45
        };
      default: // medium
        return {
          opacity: 0.2,
          fontSize: '12px',
          spacing: '120px',
          angle: 30
        };
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const settings = getIntensitySettings();
    const watermarkText = generateWatermarkText();
    
    // Crear patrón de watermark repetido
    const createWatermarkPattern = () => {
      const canvas = document.createElement('canvas') as HTMLCanvasElement;
      const ctx = canvas.getContext('2d');
      if (!ctx) return '';

      canvas.width = 300;
      canvas.height = 150;

      ctx.font = `${settings.fontSize} Arial`;
      ctx.fillStyle = `rgba(255, 255, 255, ${settings.opacity})`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Rotar el texto
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((settings.angle * Math.PI) / 180);
      
      // Dibujar texto con sombra para mejor visibilidad
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 2;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      
      ctx.fillText(watermarkText, 0, 0);

      return canvas.toDataURL();
    };

    const watermarkDataUrl = createWatermarkPattern();
    
    // Aplicar watermark como background
    const container = containerRef.current;
    const watermarkOverlay = document.createElement('div');
    
    watermarkOverlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1000;
      background-image: url(${watermarkDataUrl});
      background-repeat: repeat;
      background-size: ${settings.spacing} auto;
      mix-blend-mode: overlay;
      user-select: none;
      -webkit-user-select: none;
    `;
    
    watermarkOverlay.setAttribute('data-watermark', 'true');
    container.appendChild(watermarkOverlay as Node);

    return () => {
      const existingWatermark = container.querySelector('[data-watermark="true"]');
      if (existingWatermark) {
        container.removeChild(existingWatermark);
      }
    };
  }, [user?.id, intensity, showUserId, showTimestamp, customText]);

  // Protección adicional contra manipulación del DOM
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.removedNodes.forEach((node) => {
            if (node instanceof Element && node.getAttribute('data-watermark') === 'true') {
              // Re-crear watermark si es removido
              setTimeout(() => {
                if (containerRef.current) {
                  const event = new Event('watermark-refresh');
                  containerRef.current.dispatchEvent(event);
                }
              }, 100);
            }
          });
        }
      });
    });

    observer.observe(containerRef.current as Element, {
      childList: true,
      subtree: true
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{ 
        position: 'relative',
        isolation: 'isolate' // Crear contexto de apilamiento
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {children}
      
      {/* Watermark de esquina visible */}
      <div 
        className="absolute bottom-2 right-2 text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded pointer-events-none select-none"
        style={{ 
          fontSize: '10px',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          zIndex: 1001
        }}
      >
        🛡️ Protegido
      </div>
      
      {/* Watermark invisible para detección */}
      <div 
        className="absolute inset-0 pointer-events-none select-none"
        style={{
          background: 'transparent',
          zIndex: 999,
          userSelect: 'none',
          WebkitUserSelect: 'none'
        }}
        data-security-layer="true"
        data-user-id={user?.id?.slice(-8)}
        data-timestamp={Date.now()}
      />
    </div>
  );
};

/**
 * Hook para aplicar watermark a elementos específicos
 */
export const useWatermark = (
  elementRef: React.RefObject<HTMLElement>,
  options: Omit<DynamicWatermarkProps, 'children'> = {}
) => {
  const { user } = useAuth();

  useEffect(() => {
    if (!elementRef.current || !user?.id) return;

    const element = elementRef.current;
    const settings = options.intensity === 'light' ? 
      { opacity: 0.1, fontSize: '10px' } :
      options.intensity === 'heavy' ?
      { opacity: 0.3, fontSize: '14px' } :
      { opacity: 0.2, fontSize: '12px' };

    // Aplicar watermark como pseudo-elemento
    const style = document.createElement('style');
    const watermarkId = `watermark-${Date.now()}`;
    
    style.textContent = `
      .${watermarkId}::before {
        content: "ID: ${user.id.slice(-8)} • ${new Date().toLocaleString('es-MX')}";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        opacity: ${settings.opacity};
        font-size: ${settings.fontSize};
        color: white;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
        pointer-events: none;
        user-select: none;
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        transform: rotate(30deg);
        white-space: nowrap;
        overflow: hidden;
      }
    `;
    
    document.head.appendChild(style as Node);
    element.classList.add(watermarkId);

    return () => {
      element.classList.remove(watermarkId);
      if (style.parentNode) {
        style.parentNode.removeChild(style as Node);
      }
    };
  }, [elementRef, user?.id, options.intensity]);
};

export default DynamicWatermark;
