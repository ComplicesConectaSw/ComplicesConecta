// Service Worker Avanzado - ComplicesConecta v3.0.0
// CRÍTICO: Actualizar versión para forzar limpieza de caches antiguos
const STATIC_CACHE = 'static-v3.0.0';
const DYNAMIC_CACHE = 'dynamic-v3.0.0';
const IMAGE_CACHE = 'images-v3.0.0';

// Recursos estáticos críticos
const STATIC_ASSETS = [
  '/',
  '/compliceslogo.png',
  '/favicon.ico',
  '/placeholder.svg'
];

// Recursos dinámicos importantes
const DYNAMIC_ASSETS = [
  '/discover',
  '/matches',
  '/chat',
  '/profile-single',
  '/profile-couple'
];

// Patrones de cache
const CACHE_STRATEGIES = {
  static: /\.(js|css|woff2?|ttf|eot)$/,
  images: /\.(png|jpg|jpeg|svg|webp|avif|gif)$/,
  api: /\/api\//,
  pages: /^\/(?!api)/
};

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker instalando...');
  
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_ASSETS)),
      caches.open(DYNAMIC_CACHE).then(cache => cache.addAll(DYNAMIC_ASSETS)),
      caches.open(IMAGE_CACHE)
    ]).then(() => {
      console.log('✅ Service Worker instalado con cache avanzado');
      return self.skipWaiting();
    })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activando...');
  
  // CRÍTICO: Limpiar TODOS los caches antiguos para forzar recarga de chunks
  const currentCaches = [STATIC_CACHE, DYNAMIC_CACHE, IMAGE_CACHE];
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!currentCaches.includes(cacheName)) {
            console.log('🗑️ Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Service Worker activado con limpieza avanzada');
      return self.clients.claim();
    })
  );
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('📨 Push notification recibida:', event);

  let notificationData = {
    title: 'ComplicesConecta',
    body: 'Tienes una nueva notificación',
    icon: '/compliceslogo.png',
    badge: '/compliceslogo.png',
    data: {}
  };

  // Parse notification data if available
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        ...notificationData,
        ...data
      };
    } catch (error) {
      console.error('❌ Error parsing push data:', error);
      notificationData.body = event.data.text() || notificationData.body;
    }
  }

  // Show notification
  const notificationPromise = self.registration.showNotification(
    notificationData.title,
    {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      image: notificationData.image,
      data: notificationData.data,
      tag: notificationData.tag || 'complicesconecta',
      requireInteraction: notificationData.requireInteraction || false,
      actions: notificationData.actions || [
        {
          action: 'open',
          title: 'Abrir App',
          icon: '/compliceslogo.png'
        },
        {
          action: 'close',
          title: 'Cerrar',
          icon: '/compliceslogo.png'
        }
      ]
    }
  );

  event.waitUntil(notificationPromise);
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('🖱️ Notification click:', event);

  const notification = event.notification;
  const action = event.action;
  const data = notification.data || {};

  notification.close();

  if (action === 'close') {
    return;
  }

  // Handle different notification types
  let urlToOpen = '/';
  
  if (data.type) {
    switch (data.type) {
      case 'message':
        urlToOpen = `/chat/${data.chatId || ''}`;
        break;
      case 'match':
        urlToOpen = '/matches';
        break;
      case 'like':
        urlToOpen = '/discover';
        break;
      case 'invitation':
        urlToOpen = '/invitations';
        break;
      case 'profile_view':
        urlToOpen = '/profile-single';
        break;
      default:
        urlToOpen = '/';
    }
  }

  // Open or focus app window
  const promiseChain = self.clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  }).then((windowClients) => {
    let matchingClient = null;

    // Check if there's already a window/tab open with the target URL
    for (let i = 0; i < windowClients.length; i++) {
      const windowClient = windowClients[i];
      if (windowClient.url.includes(urlToOpen.split('?')[0])) {
        matchingClient = windowClient;
        break;
      }
    }

    // Focus existing window or open new one
    if (matchingClient) {
      return matchingClient.focus();
    } else {
      return self.clients.openWindow(urlToOpen);
    }
  });

  event.waitUntil(promiseChain);
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync:', event.tag);

  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// Handle background sync
async function doBackgroundSync() {
  try {
    console.log('🔄 Ejecutando background sync...');
    
    // Here you could sync offline actions like:
    // - Send pending messages
    // - Update user location
    // - Sync profile changes
    
    console.log('✅ Background sync completado');
  } catch (error) {
    console.error('❌ Error en background sync:', error);
  }
}

// Estrategias de cache avanzadas
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  return cached || fetch(request).then(response => {
    cache.put(request, response.clone());
    return response;
  });
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    return cached || new Response('Offline', { status: 503 });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  const fetchPromise = fetch(request).then(response => {
    cache.put(request, response.clone());
    return response;
  });
  
  return cached || fetchPromise;
}

// Fetch event con estrategias avanzadas
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  const url = new URL(event.request.url);
  
  // CRÍTICO: No interceptar chunks de Vite - deben cargarse siempre desde red
  // Los chunks de Vite tienen formato: /assets/[name]-[hash].js
  if (url.pathname.startsWith('/assets/') && url.pathname.endsWith('.js')) {
    // Chunks de JavaScript: siempre desde red, sin cache para evitar problemas de carga
    return; // No interceptar, dejar que el navegador maneje
  }
  
  // CRÍTICO: No interceptar el HTML principal - debe cargarse siempre desde red
  if (url.pathname === '/' || url.pathname === '/index.html') {
    return; // No interceptar, dejar que el navegador maneje
  }
  
  // Estrategia por tipo de recurso
  if (CACHE_STRATEGIES.static.test(url.pathname)) {
    // Recursos estáticos: Cache First
    event.respondWith(cacheFirst(event.request, STATIC_CACHE));
  } else if (CACHE_STRATEGIES.images.test(url.pathname)) {
    // Imágenes: Cache First con compresión
    event.respondWith(handleImageRequest(event.request));
  } else if (CACHE_STRATEGIES.api.test(url.pathname)) {
    // API: Network First
    event.respondWith(networkFirst(event.request, DYNAMIC_CACHE));
  } else if (CACHE_STRATEGIES.pages.test(url.pathname)) {
    // Páginas: Stale While Revalidate
    event.respondWith(staleWhileRevalidate(event.request, DYNAMIC_CACHE));
  } else {
    // Default: Network First
    event.respondWith(networkFirst(event.request, DYNAMIC_CACHE));
  }
});

// Manejo optimizado de imágenes
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cached = await cache.match(request);
  
  if (cached) return cached;
  
  try {
    const response = await fetch(request);
    
    // Solo cachear imágenes exitosas
    if (response.ok) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch {
    // Retornar placeholder en caso de error
    return cache.match('/placeholder.svg') || 
           new Response('', { status: 404 });
  }
}

// Handle message from main thread
self.addEventListener('message', (event) => {
  console.log('💬 Message from main thread:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('🎯 Service Worker Avanzado loaded - ComplicesConecta v2.9.0');
