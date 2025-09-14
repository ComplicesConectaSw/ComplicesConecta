// Service Worker para Push Notifications - ComplicesConecta
const CACHE_NAME = 'complicesconecta-v1';
const urlsToCache = [
  '/',
  '/compliceslogo.png',
  '/favicon.ico'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker instalando...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Cache abierto');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('✅ Service Worker instalado');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activando...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Service Worker activado');
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
  const promiseChain = clients.matchAll({
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
      return clients.openWindow(urlToOpen);
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

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
      .catch(() => {
        // Return offline page for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      })
  );
});

// Handle message from main thread
self.addEventListener('message', (event) => {
  console.log('💬 Message from main thread:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('🎯 Service Worker loaded - ComplicesConecta v2.7.0');
