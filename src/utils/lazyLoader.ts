import { ComponentType, lazy } from 'react';

/**
 * Utility para crear lazy loading con retry automático
 */
export const createLazyComponent = <P = Record<string, unknown>>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  retries = 3
): ComponentType<P> => {
  return lazy(() => {
    return new Promise<{ default: ComponentType<P> }>((resolve, reject) => {
      let attempt = 0;
      
      const tryImport = () => {
        importFn()
          .then(resolve)
          .catch((error) => {
            attempt++;
            if (attempt < retries) {
              console.warn(`Lazy loading failed, retrying... (${attempt}/${retries})`);
              setTimeout(tryImport, 1000 * attempt);
            } else {
              console.error('Lazy loading failed after all retries:', error);
              reject(error);
            }
          });
      };
      
      tryImport();
    });
  });
};

/**
 * Preload de componentes críticos
 */
export const preloadComponent = <P = Record<string, unknown>>(importFn: () => Promise<{ default: ComponentType<P> }>) => {
  const link = document.createElement('link');
  link.rel = 'modulepreload';
  link.href = importFn.toString();
  document.head.appendChild(link);
  
  // También ejecutar la importación
  importFn().catch(console.warn);
};

/**
 * Lazy loading con prioridad
 */
export const createPriorityLazyComponent = <P = Record<string, unknown>>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  priority: 'high' | 'medium' | 'low' = 'medium'
): ComponentType<P> => {
  const component = createLazyComponent(importFn);
  
  // Preload para componentes de alta prioridad
  if (priority === 'high') {
    setTimeout(() => preloadComponent(importFn), 100);
  } else if (priority === 'medium') {
    setTimeout(() => preloadComponent(importFn), 2000);
  }
  
  return component;
};
