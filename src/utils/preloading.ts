// Utilidades para preloading de rutas críticas - ComplicesConecta v2.9.0

export interface PreloadOptions {
  priority?: 'high' | 'low';
  as?: 'script' | 'style' | 'font' | 'image' | 'fetch';
  crossorigin?: 'anonymous' | 'use-credentials';
  type?: string;
}

// Rutas críticas de la aplicación
export const CRITICAL_ROUTES = [
  '/discover',
  '/matches', 
  '/chat',
  '/profile-single',
  '/profile-couple'
];

// Recursos críticos para precargar
export const CRITICAL_RESOURCES = [
  // Logo removido - usar placeholder.svg o favicon.ico en su lugar
  // Fuentes críticas se añadirían aquí
] as const;

// Crear elemento de preload
export const createPreloadLink = (href: string, options: PreloadOptions = {}): HTMLLinkElement => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  
  if (options.as) link.as = options.as;
  if (options.type) link.type = options.type;
  if (options.crossorigin) link.crossOrigin = options.crossorigin;
  if (options.priority) link.setAttribute('fetchpriority', options.priority);
  
  return link;
};

// Precargar recurso
export const preloadResource = (href: string, options: PreloadOptions = {}): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Verificar si ya está precargado
    const existing = document.querySelector(`link[href="${href}"]`);
    if (existing) {
      resolve();
      return;
    }

    const link = createPreloadLink(href, options);
    
    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to preload ${href}`));
    
    document.head.appendChild(link);
  });
};

// Precargar múltiples recursos
export const preloadResources = async (resources: Array<{ href: string } & PreloadOptions>): Promise<void> => {
  const promises = resources.map(({ href, ...options }) => 
    preloadResource(href, options).catch(error => {
      console.warn(`Failed to preload ${href}:`, error);
    })
  );
  
  await Promise.allSettled(promises);
};

// Prefetch para navegación futura
export const prefetchRoute = (href: string): void => {
  // Verificar si ya está prefetched
  const existing = document.querySelector(`link[href="${href}"][rel="prefetch"]`);
  if (existing) return;

  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;
  
  document.head.appendChild(link);
};

// Preconnect a dominios externos
export const preconnectDomain = (domain: string, crossorigin = false): void => {
  const existing = document.querySelector(`link[href="${domain}"][rel="preconnect"]`);
  if (existing) return;

  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = domain;
  
  if (crossorigin) {
    link.crossOrigin = 'anonymous';
  }
  
  document.head.appendChild(link);
};

// DNS prefetch para dominios
export const dnsPrefetch = (domain: string): void => {
  const existing = document.querySelector(`link[href="${domain}"][rel="dns-prefetch"]`);
  if (existing) return;

  const link = document.createElement('link');
  link.rel = 'dns-prefetch';
  link.href = domain;
  
  document.head.appendChild(link);
};

// Precargar rutas basado en hover (predictive prefetching)
export const setupPredictivePrefetching = (): void => {
  let prefetchTimeout: NodeJS.Timeout;

  const handleMouseEnter = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    const link = target.closest('a[href]') as HTMLAnchorElement;
    
    if (!link || !link.href) return;
    
    // Solo prefetch rutas internas
    if (link.hostname !== window.location.hostname) return;
    
    prefetchTimeout = setTimeout(() => {
      prefetchRoute(link.href);
    }, 100); // Delay para evitar prefetch accidental
  };

  const handleTouchStart = (event: TouchEvent) => {
    const target = event.target as HTMLElement;
    const link = target.closest('a[href]') as HTMLAnchorElement;
    
    if (!link || !link.href) return;
    
    // Solo prefetch rutas internas
    if (link.hostname !== window.location.hostname) return;
    
    prefetchTimeout = setTimeout(() => {
      prefetchRoute(link.href);
    }, 100);
  };

  const handleMouseLeave = () => {
    if (prefetchTimeout) {
      clearTimeout(prefetchTimeout);
    }
  };

  // Agregar listeners a todos los enlaces
  document.addEventListener('mouseenter', handleMouseEnter, true);
  document.addEventListener('mouseleave', handleMouseLeave, true);
  document.addEventListener('touchstart', handleTouchStart, { passive: true });
};

// Precargar basado en viewport (intersection observer)
export const setupViewportPrefetching = (): IntersectionObserver => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const link = entry.target as HTMLAnchorElement;
          if (link.href && link.hostname === window.location.hostname) {
            prefetchRoute(link.href);
            observer.unobserve(link); // Solo prefetch una vez
          }
        }
      });
    },
    {
      rootMargin: '200px', // Prefetch cuando esté cerca del viewport
      threshold: 0
    }
  );

  // Observar todos los enlaces visibles
  const links = document.querySelectorAll('a[href]');
  links.forEach(link => observer.observe(link));

  return observer;
};

// Inicializar preloading crítico
export const initializeCriticalPreloading = async (): Promise<void> => {
  try {
    // Precargar recursos críticos
    if (CRITICAL_RESOURCES.length > 0) {
      await preloadResources([...CRITICAL_RESOURCES]);
    }
    
    // Preconnect a dominios importantes
    preconnectDomain('https://fonts.googleapis.com');
    preconnectDomain('https://fonts.gstatic.com', true);
    
    // DNS prefetch para APIs externas
    dnsPrefetch('//api.complicesconecta.app');
    
    console.log('✅ Critical preloading initialized');
  } catch (error) {
    console.error('❌ Error initializing critical preloading:', error);
  }
};

// Hook para React
export const usePreloading = () => {
  const preloadRoute = (href: string) => prefetchRoute(href);
  const preloadImage = (src: string) => preloadResource(src, { as: 'image' });
  
  return {
    preloadRoute,
    preloadImage,
    preloadResource,
    prefetchRoute
  };
};

export default {
  preloadResource,
  preloadResources,
  prefetchRoute,
  preconnectDomain,
  dnsPrefetch,
  setupPredictivePrefetching,
  setupViewportPrefetching,
  initializeCriticalPreloading,
  usePreloading
};
