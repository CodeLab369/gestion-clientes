// Service Worker para soporte offline
const CACHE_NAME = 'gestion-clientes-v1';
const urlsToCache = [
    './',
    './index.html',
    './css/styles.css',
    './css/modal.css',
    './css/responsive.css',
    './js/database.js',
    './js/auth.js',
    './js/modal.js',
    './js/clientes.js',
    './js/unir.js',
    './js/comprimir.js',
    './js/ajustes.js',
    './js/app.js',
    'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Cache abierto');
                return cache.addAll(urlsToCache);
            })
    );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Eliminando cache antiguo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Intercepción de peticiones
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Cache hit - devolver respuesta del cache
                if (response) {
                    return response;
                }

                // No está en cache - hacer petición de red
                return fetch(event.request).then(
                    (response) => {
                        // Verificar si es una respuesta válida
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clonar la respuesta
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                ).catch(() => {
                    // Si falla la red, devolver página offline si es HTML
                    if (event.request.headers.get('accept').includes('text/html')) {
                        return caches.match('./index.html');
                    }
                });
            })
    );
});
