// Service Worker - PWA uchun (cache-first strategiyasi)
const CACHE_NAME = 'alsafar-menu-v1';
const STATIC_CACHE = 'alsafar-static-v1';
const IMAGE_CACHE = 'alsafar-images-v1';
const API_CACHE = 'alsafar-api-cache-v1';

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
    
    // API requests - cache-first with network fallback
    if (pathname.startsWith('/api/')) {
        console.log('[SW] API request - cache first:', pathname);
        event.respondWith(
            caches.open(API_CACHE)
                .then((apiCache) => {
                    return apiCache.match(event.request)
                        .then((cachedResponse) => {
                            if (cachedResponse) {
                                console.log('[SW] Serving API from cache:', pathname);
                                return cachedResponse;
                            }
                            
                            console.log('[SW] Fetching API from network:', pathname);
                            return fetch(event.request)
                                .then((response) => {
                                    if (response && response.status === 200) {
                                        apiCache.put(event.request, response.clone());
                                    }
                                    return response;
                                })
                                .catch((err) => {
                                    console.log('[SW] API fetch failed, trying cache:', err);
                                    // Return cached menu if available
                                    if (pathname === '/api/menu') {
                                        return apiCache.match('/api/menu')
                                            .then(cached => {
                                                if (cached) return cached;
                                                // Return embedded fallback data
                                                return new Response(JSON.stringify(getFallbackMenu()), {
                                                    status: 200,
                                                    headers: { 'Content-Type': 'application/json' }
                                                });
                                            });
                                    }
                                    return new Response(JSON.stringify({ error: 'Serverga ulanish mumkin emas', offline: true }), {
                                        status: 503,
                                        headers: { 'Content-Type': 'application/json' }
                                    });
                                });
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
    
// Static assets - stale-while-revalidate strategy
    // First serve from cache, then update cache in background
    console.log('[SW] Static request - stale-while-revalidate:', pathname);
    event.respondWith(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                return cache.match(event.request)
                    .then((cachedResponse) => {
                        // Fetch from network in background
                        const fetchPromise = fetch(event.request)
                            .then((response) => {
                                // Don't cache non-successful responses
                                if (!response || response.status !== 200) {
                                    return response;
                                }
                                
                                // Clone and cache the new response
                                const responseToCache = response.clone();
                                cache.put(event.request, responseToCache);
                                
                                return response;
                            })
                            .catch((err) => {
                                console.log('[SW] Network fetch failed:', err);
                                // Return offline page for navigation requests
                                if (event.request.mode === 'navigate') {
                                    return caches.match('/index.html');
                                }
                            });
                        
                        // Return cached response immediately if available
                        // Otherwise wait for network response
                        return cachedResponse || fetchPromise;
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

// Fallback menu data for offline mode
function getFallbackMenu() {
    return {
        salads: [
            { title: "Chiroqchi Salati", description: "Yangi sabzavotlar, pyuresi, tuxum va maxsus french sousi bilan.", price: "20,000 so'm" },
            { title: "Sezer Salati", description: "Romsalat, parmesan, croutons va caesar sousi bilan.", price: "30,000 so'm" },
            { title: "Svejiy Salat", description: "Yangi sabzavotlar: pomidor, bodring, ko'katlar va zaytun moyi.", price: "15,000 so'm" },
            { title: "Achchiq Chuchuk Salat", description: "Achchiq va shirin ta'mli salad: qizilmiya, cho'chqa, pomidor va maxsus sous.", price: "15,000 so'm" }
        ],
        mains: [
            { title: "Jiz", description: "Mol go'shtidan tayyorlangan mazali taom.", price: "250,000 so'm" },
            { title: "Tabaka", description: "Butun tovuqni yog'da press bilan bosib tayyorlangan shirali taom.", price: "60,000 so'm" },
            { title: "Lag'mon", description: "Qo'lda cho'zilgan lag'mon go'sht va sabzavotlar bilan.", price: "45,000 so'm" },
            { title: "Shashlik", description: "Mol go'shtidan tayyorlangan shashlik.", price: "50,000 so'm" }
        ],
        drinks: [
            { title: "Coca Cola", description: "Gazli ichimlik 0.5L", price: "15,000 so'm" },
            { title: "Choy", description: "Ko'k va qora choy", price: "10,000 so'm" },
            { title: "Suv", description: "Ichimlik suvi 1L", price: "8,000 so'm" },
            { title: "Kompot", description: "Mevalar komboki", price: "20,000 so'm" }
        ]
    };
}