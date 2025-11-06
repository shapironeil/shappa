/**
 * 🚀 SHAPPA SERVICE WORKER v2.0
 * Service Worker per Progressive Web App
 */

const CACHE_NAME = 'shappa-v2.0.0';
const STATIC_CACHE = 'shappa-static-v2.0.0';
const DYNAMIC_CACHE = 'shappa-dynamic-v2.0.0';

// Risorse da cachare staticamente
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/src/styles/main.css',
    '/src/styles/theme-v2.css',
    '/src/js/shappa-core.js',
    '/src/js/shappa-theme-manager.js',
    '/src/pages/login.html',
    '/src/pages/register.html',
    '/src/pages/dashboard.html',
    '/src/pages/admin.html',
    // Font e icone
    'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2'
];

// Installazione
self.addEventListener('install', (event) => {
    console.log('🚀 Service Worker installing...');
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('📦 Caching static assets...');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Attivazione
self.addEventListener('activate', (event) => {
    console.log('🚀 Service Worker activating...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // Rimuovi cache vecchie
                    if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                        console.log('🗑️ Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch con strategia Cache First per risorse statiche, Network First per API
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Strategia per risorse statiche
    if (STATIC_ASSETS.includes(url.pathname) || request.destination === 'style' || request.destination === 'script') {
        event.respondWith(cacheFirst(request));
    }
    // Strategia per API calls
    else if (url.pathname.startsWith('/api/')) {
        event.respondWith(networkFirst(request));
    }
    // Strategia per pagine HTML
    else if (request.destination === 'document') {
        event.respondWith(networkFirst(request));
    }
    // Cache first per altri asset
    else {
        event.respondWith(cacheFirst(request));
    }
});

// Strategia Cache First
async function cacheFirst(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.error('Cache first failed:', error);
        // Fallback per risorse critiche
        if (request.destination === 'document') {
            const cache = await caches.open(STATIC_CACHE);
            return cache.match('/index.html');
        }
    }
}

// Strategia Network First
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.log('Network failed, trying cache:', error);
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        // Fallback per pagine
        if (request.destination === 'document') {
            const cache = await caches.open(STATIC_CACHE);
            return cache.match('/index.html');
        }
    }
}

// Gestione messaggi dal main thread
self.addEventListener('message', (event) => {
    const { type, data } = event.data;

    switch (type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;

        case 'GET_CACHE_INFO':
            caches.keys().then(cacheNames => {
                event.ports[0].postMessage({
                    cacheNames,
                    currentVersion: CACHE_NAME
                });
            });
            break;

        case 'CLEAR_CACHE':
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => caches.delete(cacheName))
                );
            }).then(() => {
                event.ports[0].postMessage({ success: true });
            });
            break;

        default:
            console.log('Unknown message type:', type);
    }
});

// Background sync per operazioni offline
self.addEventListener('sync', (event) => {
    console.log('🔄 Background sync:', event.tag);

    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

async function doBackgroundSync() {
    // Implementa sincronizzazione dati quando online
    console.log('📡 Performing background sync...');
    // Qui puoi implementare la logica per sincronizzare dati offline
}

// Push notifications
self.addEventListener('push', (event) => {
    console.log('📬 Push received:', event);

    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/icon-192x192.png',
            badge: '/icon-192x192.png',
            vibrate: [100, 50, 100],
            data: data.data || {},
            actions: data.actions || []
        };

        event.waitUntil(
            self.registration.showNotification(data.title || 'Shappa', options)
        );
    }
});

// Click sulle notifiche
self.addEventListener('notificationclick', (event) => {
    console.log('🔔 Notification clicked:', event);
    event.notification.close();

    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(clientList => {
                // Controlla se c'è già una finestra aperta
                for (const client of clientList) {
                    if (client.url === urlToOpen && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Apri nuova finestra
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});

// Monitoraggio performance periodico
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'performance-check') {
        event.waitUntil(checkPerformance());
    }
});

async function checkPerformance() {
    // Implementa controlli performance periodici
    console.log('📊 Periodic performance check...');
}

// Gestione errori
self.addEventListener('error', (event) => {
    console.error('🚨 Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
    console.error('🚨 Service Worker unhandled rejection:', event.reason);
});
