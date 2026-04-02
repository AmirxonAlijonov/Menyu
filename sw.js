// Service Worker - PWA uchun
const CACHE_NAME = 'alsafar-menu-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/CSS/style.css',
    '/manifest.json'
];

// Install event
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(urlsToCache);
            })
            .catch((err) => {
                console.log('Cache install error:', err);
            })
    );
    self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch event - network first, fall back to cache
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Clone response
                const responseClone = response.clone();
                
                // Cache successful responses
                if (response.status === 200) {
                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseClone);
                        });
                }
                
                return response;
            })
            .catch(() => {
                // Fall back to cache
                return caches.match(event.request);
            })
    );
});