/**
 * Optimizador Móvil para ComplicesConecta v2.8.2
 * Asegura experiencia perfecta en dispositivos móviles y tabletas
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface MobileOptimizerProps {
  children: React.ReactNode;
}

export function MobileOptimizer({ children }: MobileOptimizerProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      setOrientation(width > height ? 'landscape' : 'portrait');
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    window.addEventListener('orientationchange', checkDevice);

    // Optimizaciones específicas para móviles
    if (isMobile) {
      // Prevenir zoom en inputs
      const metaViewport = document.querySelector('meta[name="viewport"]');
      if (metaViewport) {
        metaViewport.setAttribute('content', 
          'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
        );
      }

      // Optimizar scroll en iOS
      (document.body.style as any).webkitOverflowScrolling = 'touch';
      
      // Prevenir bounce scroll en iOS
      document.addEventListener('touchmove', (e) => {
        if (e.target === document.body) {
          e.preventDefault();
        }
      }, { passive: false });
    }

    // Aplicar clases CSS específicas del dispositivo
    document.documentElement.classList.toggle('is-mobile', isMobile);
    document.documentElement.classList.toggle('is-tablet', isTablet);
    document.documentElement.classList.toggle('is-landscape', orientation === 'landscape');
    document.documentElement.classList.toggle('is-portrait', orientation === 'portrait');

    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('orientationchange', checkDevice);
    };
  }, [isMobile, isTablet, orientation]);

  useEffect(() => {
    // Estilos CSS dinámicos para optimización móvil
    const style = document.createElement('style');
    style.textContent = `
      /* Optimizaciones móviles */
      .is-mobile {
        --mobile-padding: 1rem;
        --mobile-margin: 0.5rem;
        --mobile-font-size: 14px;
        --mobile-line-height: 1.4;
      }
      
      .is-tablet {
        --tablet-padding: 1.5rem;
        --tablet-margin: 1rem;
        --tablet-font-size: 16px;
        --tablet-line-height: 1.5;
      }
      
      /* Navegación móvil optimizada */
      .is-mobile .nav-accessible {
        padding: 0.75rem 1rem;
        font-size: 14px;
      }
      
      .is-mobile .nav-item-accessible {
        padding: 0.5rem;
        min-height: 44px;
        min-width: 44px;
      }
      
      /* Botones táctiles optimizados */
      .is-mobile .btn-accessible {
        min-height: 44px;
        min-width: 44px;
        padding: 0.75rem 1rem;
        font-size: 16px;
      }
      
      /* Inputs táctiles */
      .is-mobile .input-accessible {
        min-height: 44px;
        font-size: 16px;
        padding: 0.75rem;
      }
      
      /* Cards responsivas */
      .is-mobile .card-accessible {
        margin: 0.5rem;
        padding: 1rem;
        border-radius: 12px;
      }
      
      .is-tablet .card-accessible {
        margin: 1rem;
        padding: 1.5rem;
        border-radius: 16px;
      }
      
      /* Modales móviles */
      .is-mobile .modal-accessible {
        margin: 1rem;
        max-height: calc(100vh - 2rem);
        border-radius: 16px;
      }
      
      .is-tablet .modal-accessible {
        margin: 2rem;
        max-height: calc(100vh - 4rem);
        border-radius: 20px;
      }
      
      /* Texto responsivo */
      .is-mobile .text-responsive {
        font-size: 14px;
        line-height: 1.4;
      }
      
      .is-tablet .text-responsive {
        font-size: 16px;
        line-height: 1.5;
      }
      
      /* Grids responsivos */
      .is-mobile .grid-responsive {
        grid-template-columns: 1fr;
        gap: 0.5rem;
      }
      
      .is-tablet .grid-responsive {
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
      }
      
      /* Orientación landscape en móviles */
      .is-mobile.is-landscape {
        --mobile-padding: 0.5rem;
        --mobile-margin: 0.25rem;
      }
      
      .is-mobile.is-landscape .nav-accessible {
        padding: 0.5rem 1rem;
      }
      
      /* Optimizaciones para pantallas pequeñas */
      @media (max-width: 375px) {
        .btn-accessible {
          font-size: 14px;
          padding: 0.5rem 0.75rem;
        }
        
        .text-truncate-mobile {
          max-width: 120px;
        }
      }
      
      /* Optimizaciones para pantallas grandes de móvil */
      @media (min-width: 375px) and (max-width: 767px) {
        .text-truncate-mobile {
          max-width: 200px;
        }
      }
      
      /* Safe area para dispositivos con notch */
      .safe-area-top {
        padding-top: env(safe-area-inset-top);
      }
      
      .safe-area-bottom {
        padding-bottom: env(safe-area-inset-bottom);
      }
      
      .safe-area-left {
        padding-left: env(safe-area-inset-left);
      }
      
      .safe-area-right {
        padding-right: env(safe-area-inset-right);
      }
      
      /* Scroll suave en móviles */
      .smooth-scroll {
        -webkit-overflow-scrolling: touch;
        scroll-behavior: smooth;
      }
      
      /* Prevenir selección de texto en elementos interactivos */
      .no-select {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }
      
      /* Optimizar tap highlights */
      .tap-highlight-none {
        -webkit-tap-highlight-color: transparent;
      }
    `;
    
    document.head.appendChild(style);
    
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  return (
    <motion.div
      className="mobile-optimized-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

export default MobileOptimizer;
