/**
 * Vite Plugin para asegurar que vendor-react se cargue ANTES que vendor
 * Este plugin reordena los modulepreload links en el HTML generado
 * 
 * PROBLEMA: Vite genera modulepreload links en orden arbitrario, pero vendor-react
 * DEBE cargarse antes que vendor, ui-radix, framer-motion, etc. que usan React.useLayoutEffect
 */

import type { Plugin } from 'vite';

export function reactOrderPlugin(): Plugin {
  return {
    name: 'react-order-plugin',
    enforce: 'post',
    transformIndexHtml(html) {
      // Buscar todos los modulepreload links usando una regex más robusta
      const modulepreloadRegex = /<link\s+rel="modulepreload"[^>]*>/gi;
      const matches = html.match(modulepreloadRegex) || [];
      
      if (matches.length === 0) {
        return html;
      }
      
      // Separar vendor-react del resto (CRÍTICO: vendor-react debe ir primero)
      const vendorReactLinks: string[] = [];
      const vendorLinks: string[] = [];
      const dataLayerLinks: string[] = [];
      const otherLinks: string[] = [];
      
      matches.forEach(link => {
        const href = link.match(/href="([^"]+)"/)?.[1] || '';
        if (href.includes('vendor-react')) {
          vendorReactLinks.push(link);
        } else if (href.includes('vendor') && !href.includes('vendor-react')) {
          vendorLinks.push(link);
        } else if (href.includes('data-layer')) {
          dataLayerLinks.push(link);
        } else {
          otherLinks.push(link);
        }
      });
      
      // CRÍTICO: Orden correcto de carga:
      // 1. vendor-react (React debe estar disponible primero)
      // 2. vendor (otras dependencias que pueden usar React)
      // 3. data-layer (depende de React)
      // 4. Resto de chunks
      const reorderedLinks = [
        ...vendorReactLinks,
        ...vendorLinks,
        ...dataLayerLinks,
        ...otherLinks
      ];
      
      if (reorderedLinks.length === 0) {
        return html;
      }
      
      // Remover todos los modulepreload links originales
      let newHtml = html;
      matches.forEach(link => {
        // Remover incluyendo espacios y saltos de línea antes/después
        newHtml = newHtml.replace(new RegExp(`\\s*${link.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*`, 'g'), '');
      });
      
      // Insertar los links reordenados antes del primer script type="module"
      const scriptTagMatch = newHtml.match(/<script\s+type="module"[^>]*>/i);
      if (scriptTagMatch && scriptTagMatch.index !== undefined) {
        const insertIndex = scriptTagMatch.index;
        const linksHtml = reorderedLinks.join('\n    ');
        newHtml = newHtml.slice(0, insertIndex) + 
                 `    ${linksHtml}\n\n    ` +
                 newHtml.slice(insertIndex);
      } else {
        // Si no encontramos el script tag, insertar antes del cierre de </head>
        const headCloseIndex = newHtml.indexOf('</head>');
        if (headCloseIndex !== -1) {
          const linksHtml = reorderedLinks.join('\n    ');
          newHtml = newHtml.slice(0, headCloseIndex) + 
                   `    ${linksHtml}\n` +
                   newHtml.slice(headCloseIndex);
        }
      }
      
      return newHtml;
    }
  };
}

