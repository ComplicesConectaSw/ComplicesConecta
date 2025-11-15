/**
 * Componente para corregir automáticamente problemas de contraste
 * Aplica mejoras de accesibilidad WCAG 2.1 AA
 */

import { useEffect } from 'react';
import { logger } from '@/lib/logger';

interface ContrastFixerProps {
  enabled?: boolean;
  level?: 'AA' | 'AAA';
}

export function ContrastFixer({ enabled = true, level = 'AA' }: ContrastFixerProps) {
  useEffect(() => {
    if (!enabled) return;

    const applyContrastFixes = () => {
      try {
        // Corregir texto gris con bajo contraste
        const lowContrastSelectors = [
          '.text-gray-300',
          '.text-gray-400', 
          '.text-gray-500',
          '.text-muted-foreground'
        ];

        lowContrastSelectors.forEach(selector => {
          const elements = document.querySelectorAll(selector);
          elements.forEach(element => {
            const htmlElement = element as HTMLElement;
            const computedStyle = window.getComputedStyle(htmlElement as Element);
            const backgroundColor = computedStyle.backgroundColor;
            
            // Detectar si está sobre fondo oscuro
            const isDarkBackground = 
              backgroundColor.includes('rgb(0, 0, 0)') ||
              backgroundColor.includes('rgba(0, 0, 0') ||
              htmlElement.closest('.bg-gradient-to-br, .bg-purple-900, .bg-pink-900, .bg-red-900') ||
              htmlElement.closest('[class*="bg-gray-9"], [class*="bg-slate-9"], [class*="bg-zinc-9"]');

            if (isDarkBackground || backgroundColor === 'rgba(0, 0, 0, 0)') {
              // Aplicar color con contraste AA (4.5:1) o AAA (7:1)
              const contrastColor = level === 'AAA' ? '#ffffff' : '#f1f5f9'; // slate-100
              const textShadow = level === 'AAA' 
                ? '0 1px 3px rgba(0, 0, 0, 0.8)' 
                : '0 1px 2px rgba(0, 0, 0, 0.6)';
              
              htmlElement.style.color = contrastColor;
              htmlElement.style.textShadow = textShadow;
              htmlElement.style.fontWeight = level === 'AAA' ? '500' : '400';
              
              // Agregar clase para identificar elementos corregidos
              htmlElement.classList.add('contrast-fixed');
            }
          });
        });

        // Corregir placeholders con bajo contraste
        const inputs = document.querySelectorAll('input, textarea');
        inputs.forEach(input => {
          const htmlInput = input as HTMLInputElement;
          const _computedStyle = window.getComputedStyle(htmlInput as Element);
          
          // Aplicar estilo de placeholder con mejor contraste
          if (!document.head.querySelector('[data-contrast-placeholder]')) {
            const style = document.createElement('style') as HTMLStyleElement;
            style.setAttribute('data-contrast-placeholder', 'true');
            style.textContent = `
              input.contrast-fixed::placeholder,
              textarea.contrast-fixed::placeholder {
                color: ${level === 'AAA' ? '#cbd5e1' : '#94a3b8'} !important;
                opacity: 1;
              }
            `;
            // @ts-ignore - HTMLStyleElement es compatible con appendChild
            document.head.appendChild(style);
          }
          
          htmlInput.classList.add('contrast-fixed');
        });

        // Corregir iconos con bajo contraste
        const icons = document.querySelectorAll('.text-gray-300, .text-gray-400, .text-gray-500');
        icons.forEach(icon => {
          const htmlIcon = icon as HTMLElement;
          if (htmlIcon.tagName === 'svg' || htmlIcon.querySelector('svg')) {
            htmlIcon.style.color = level === 'AAA' ? '#f8fafc' : '#e2e8f0';
            htmlIcon.style.filter = 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.6))';
            htmlIcon.classList.add('contrast-fixed');
          }
        });

        logger.info('✅ Correcciones de contraste aplicadas', { 
          level,
          elementsFixed: document.querySelectorAll('.contrast-fixed').length 
        });

      } catch (error) {
        logger.error('❌ Error aplicando correcciones de contraste:', { error });
      }
    };

    // Aplicar correcciones inmediatamente
    applyContrastFixes();

    // Aplicar correcciones cuando se agreguen nuevos elementos
    const observer = new MutationObserver((mutations) => {
      let shouldReapply = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (element.querySelector('.text-gray-300, .text-gray-400, .text-gray-500, .text-muted-foreground')) {
                shouldReapply = true;
              }
            }
          });
        }
      });

      if (shouldReapply) {
        setTimeout(applyContrastFixes, 100); // Debounce
      }
    });

    observer.observe(document.body as Element, {
      childList: true,
      subtree: true
    });

    return () => {
      observer.disconnect();
    };
  }, [enabled, level]);

  return null; // Componente sin renderizado visual
}

export default ContrastFixer;
