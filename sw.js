// Service Worker - PWA uchun (cache-first strategiyasi)
const CACHE_NAME = 'alsafar-menu-v1';
const STATIC_CACHE = 'alsafar-static-v1';
const IMAGE_CACHE = 'alsafar-images-v1';

// Assets to cache immediately
const staticAssets = [
    '/',
    '/index.html',
    '/index.js',
    '/CSS/style.css',
    '/manifest.json',
    '/sw.js'
];

// Install event - cache all static assets
self.addEventListener('install', (event) => {
    console.log('[SW] Installing...');
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('[SW] Caching static assets');
                return cache.addAll(staticAssets);
            })
            .then(() => {
                console.log('[SW] Installed successfully');
                return self.skipWaiting();
            })
            .catch((err) => {
                console.error('[SW] Cache install error:', err);
            })
    );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE && cacheName !== IMAGE_CACHE) {
                        console.log('[SW] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('[SW] Activated');
            return self.clients.claim();
        })
    );
});

// Fetch event - cache-first for static, network-only for API
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    const pathname = url.pathname;
    const isImage = url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i);
    
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }
    
    // API requests - ALWAYS go to network, never cache
    if (pathname.startsWith('/api/')) {
        console.log('[SW] API request - network only:', pathname);
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // Don't cache API responses
                    return response;
                })
                .catch((err) => {
                    console.log('[SW] API fetch failed:', err);
                    return new Response(JSON.stringify({ error: 'Serverga ulanish mumkin emas' }), {
                        status: 503,
                        headers: { 'Content-Type': 'application/json' }
                    });
                })
        );
        return;
    }
    
    // sw.js request - return current script
    if (pathname === '/sw.js' || pathname.endsWith('/sw.js')) {
        event.respondWith(
            caches.match('/sw.js')
                .then((response) => {
                    return response || fetch('/sw.js');
                })
        );
        return;
    }
    
    // Images - cache first with separate image cache
    if (isImage) {
        console.log('[SW] Image request - cache first:', pathname);
        event.respondWith(
            caches.open(IMAGE_CACHE)
                .then((imageCache) => {
                    return imageCache.match(event.request)
                        .then((cachedResponse) => {
                            if (cachedResponse) {
                                console.log('[SW] Serving image from cache:', pathname);
                                return cachedResponse;
                            }
                            
                            console.log('[SW] Fetching image from network:', pathname);
                            return fetch(event.request)
                                .then((response) => {
                                    if (response && response.status === 200) {
                                        imageCache.put(event.request, response.clone());
                                    }
                                    return response;
                                })
                                .catch(() => {
                                    // Return placeholder image if offline
                                    return new Response('', { status: 503 });
                                });
                        });
                })
        );
        return;
    }
    
    // Static assets - cache first, then network
    console.log('[SW] Static request - cache first:', pathname);
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    console.log('[SW] Serving from cache:', pathname);
                    return cachedResponse;
                }
                
                console.log('[SW] Fetching from network:', pathname);
                return fetch(event.request)
                    .then((response) => {
                        // Don't cache non-successful responses
                        if (!response || response.status !== 200) {
                            return response;
                        }
                        
                        // Clone the response
                        const responseToCache = response.clone();
                        
                        // Cache the new response
                        caches.open(STATIC_CACHE)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    })
                    .catch((err) => {
                        console.log('[SW] Fetch failed:', err);
                        
                        // Return offline page for navigation requests
                        if (event.request.mode === 'navigate') {
                            return caches.match('/index.html');
                        }
                        
                        return new Response('Offline', { status: 503 });
                    });
            })
    );
});

// Handle messages from the main app
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});