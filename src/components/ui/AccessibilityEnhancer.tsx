/**
 * Componente de Mejoras de Accesibilidad WCAG AA
 * Asegura contraste adecuado y legibilidad de textos
 */

import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';

interface AccessibilityEnhancerProps {
  children: React.ReactNode;
  className?: string;
}

export function AccessibilityEnhancer({ children, className }: AccessibilityEnhancerProps) {
  useEffect(() => {
    // Aplicar mejoras de accesibilidad globales
    const style = document.createElement('style');
    style.textContent = `
      /* Mejoras de contraste WCAG AA */
      .text-low-contrast {
        color: #ffffff !important;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
      }
      
      .text-medium-contrast {
        color: #f8fafc !important;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
      }
      
      .text-high-contrast {
        color: #ffffff !important;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.9);
        font-weight: 500;
      }
      
      /* Mejoras para fondos oscuros */
      .bg-dark .text-gray-300,
      .bg-dark .text-gray-400,
      .bg-dark .text-gray-500 {
        color: #e2e8f0 !important;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
      }
      
      /* Mejoras para botones */
      .btn-accessible {
        min-height: 44px;
        min-width: 44px;
        font-weight: 500;
        border: 2px solid transparent;
        transition: all 0.2s ease;
      }
      
      .btn-accessible:focus {
        outline: 2px solid #3b82f6;
        outline-offset: 2px;
      }
      
      /* Mejoras para enlaces */
      .link-accessible {
        text-decoration: underline;
        text-underline-offset: 2px;
        color: #60a5fa !important;
      }
      
      .link-accessible:hover {
        color: #93c5fd !important;
        text-decoration-thickness: 2px;
      }
      
      /* Mejoras para inputs */
      .input-accessible {
        border: 2px solid #374151;
        background-color: rgba(255, 255, 255, 0.1);
        color: #ffffff;
      }
      
      .input-accessible:focus {
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }
      
      .input-accessible::placeholder {
        color: #9ca3af;
      }
      
      /* Mejoras para modales */
      .modal-accessible {
        border: 1px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
      }
      
      /* Mejoras para cards */
      .card-accessible {
        border: 1px solid rgba(255, 255, 255, 0.1);
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(10px);
      }
      
      .card-accessible:hover {
        border-color: rgba(255, 255, 255, 0.2);
        background: rgba(255, 255, 255, 0.08);
      }
      
      /* Mejoras para navegación */
      .nav-accessible {
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(20px);
        border-top: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      .nav-item-accessible {
        color: #e2e8f0 !important;
        font-weight: 500;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
      }
      
      .nav-item-accessible.active {
        color: #ffffff !important;
        background: rgba(147, 51, 234, 0.2);
        border-radius: 8px;
      }
      
      /* Mejoras para textos en gradientes */
      .gradient-text-accessible {
        background: linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        font-weight: 600;
        text-shadow: none;
      }
      
      /* Soporte para modo de alto contraste */
      @media (prefers-contrast: high) {
        .text-gray-300,
        .text-gray-400,
        .text-gray-500 {
          color: #ffffff !important;
          font-weight: 600 !important;
        }
        
        .bg-white\\/10,
        .bg-white\\/5 {
          background-color: rgba(255, 255, 255, 0.2) !important;
          border: 2px solid rgba(255, 255, 255, 0.3) !important;
        }
      }
      
      /* Soporte para motion reducido */
      @media (prefers-reduced-motion: reduce) {
        * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }
    `;
    
    document.head.appendChild(style);
    
    // Cleanup
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  return (
    <div className={cn('accessibility-enhanced', className)}>
      {children}
    </div>
  );
}

export default AccessibilityEnhancer;
