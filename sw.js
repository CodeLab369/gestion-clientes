// Service Worker para soporte offline
const VERSION = '2.0.0';
const CACHE_NAME = `gestion-clientes-v${VERSION}-${Date.now()}`;
const urlsToCache = [
    './',
    './index.html',
    './css/styles.css?v=2.0',
    './css/modal.css?v=2.0',
    './css/responsive.css?v=2.0',
    './js/database.js?v=2.0',
    './js/auth.js?v=2.0',
    './js/modal.js?v=2.0',
    './js/clientes.js?v=2.0',
    './js/unir.js?v=2.0',
    './js/comprimir.js?v=2.0',
    './js/ajustes.js?v=2.0',
    './js/app.js?v=2.0',
    'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
    // Forzar activación inmediata del nuevo SW
    self.skipWaiting();
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Cache abierto:', CACHE_NAME);
                return cache.addAll(urlsToCache);
            })
    );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
    // Tomar control inmediato de todas las páginas
    event.waitUntil(
        Promise.all([
            // Eliminar caches antiguos
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('Eliminando cache antiguo:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            // Tomar control de todas las páginas
            self.clients.claim()
        ])
    );
});

// Intercepción de peticiones
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    
    // Estrategia Network First para archivos HTML, JS y CSS
    const isAppFile = url.pathname.endsWith('.html') || 
                      url.pathname.endsWith('.js') || 
                      url.pathname.endsWith('.css') ||
                      url.pathname === '/' || url.pathname === './';
    
    if (isAppFile) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // Guardar en cache la nueva versión
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                    return response;
                })
                .catch(() => {
                    // Si falla la red, usar cache
                    return caches.match(event.request);
                })
        );
    } else {
        // Estrategia Cache First para otros recursos (CDN, imágenes, etc.)
        event.respondWith(
            caches.match(event.request)
                .then((response) => {
                    if (response) {
                        return response;
                    }
                    return fetch(event.request).then((response) => {
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseToCache);
                        });
                        return response;
                    });
                })
        );
    }
});
