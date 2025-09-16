/**
 * Optimizador Cross-Browser para ComplicesConecta v2.8.2
 * Asegura compatibilidad en Chrome, Firefox, Brave, Edge, Safari
 */

import React, { useEffect } from 'react';

interface CrossBrowserOptimizerProps {
  children: React.ReactNode;
}

export function CrossBrowserOptimizer({ children }: CrossBrowserOptimizerProps) {
  useEffect(() => {
    // Detectar navegador y aplicar optimizaciones específicas
    const userAgent = navigator.userAgent.toLowerCase();
    const isFirefox = userAgent.includes('firefox');
    const isSafari = userAgent.includes('safari') && !userAgent.includes('chrome');
    const isEdge = userAgent.includes('edge') || userAgent.includes('edg/');
    const isBrave = (navigator as any).brave !== undefined;
    
    // Aplicar clases CSS específicas del navegador
    const browserClass = isFirefox ? 'browser-firefox' :
                        isSafari ? 'browser-safari' :
                        isEdge ? 'browser-edge' :
                        isBrave ? 'browser-brave' : 'browser-chrome';
    
    document.documentElement.classList.add(browserClass);
    
    // Optimizaciones específicas para Safari
    if (isSafari) {
      // Fix para backdrop-filter en Safari
      const style = document.createElement('style');
      style.textContent = `
        .backdrop-blur-md {
          -webkit-backdrop-filter: blur(12px);
          backdrop-filter: blur(12px);
        }
        .backdrop-blur-sm {
          -webkit-backdrop-filter: blur(4px);
          backdrop-filter: blur(4px);
        }
      `;
      document.head.appendChild(style);
    }
    
    // Optimizaciones para Firefox
    if (isFirefox) {
      // Mejorar rendering de gradientes
      const style = document.createElement('style');
      style.textContent = `
        .hero-gradient {
          background-attachment: fixed;
        }
      `;
      document.head.appendChild(style);
    }
    
    // Cleanup al desmontar
    return () => {
      document.documentElement.classList.remove(browserClass);
    };
  }, []);

  return <>{children}</>;
}

export default CrossBrowserOptimizer;
