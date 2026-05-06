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
    '/css/style.css',
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

    // Images - stale-while-revalidate (fast + fresh)
    if (isImage) {
        console.log('[SW] Image request - stale-while-revalidate:', pathname);
        event.respondWith(
            caches.open(IMAGE_CACHE)
                .then((imageCache) => {
                    return imageCache.match(event.request)
                        .then((cachedResponse) => {
                            // Fetch from network in background
                            const fetchPromise = fetch(event.request)
                                .then((networkResponse) => {
                                    if (networkResponse && networkResponse.status === 200) {
                                        imageCache.put(event.request, networkResponse.clone());
                                    }
                                    return networkResponse;
                                })
                                .catch((err) => {
                                    console.log('[SW] Image network fetch failed:', err);
                                });

                            // Return cached response immediately if available, otherwise wait for network
                            return cachedResponse || fetchPromise;
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
    console.log('[SW] Xabar keldi:', event.data);

    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    // Javob yuborish (kanalni yopmaslik uchun)
    event.ports[0]?.postMessage({ status: 'ok' });
});

// Fallback menu data for offline mode - index.js bilan mos
function getFallbackMenu() {
    return {
        salads: [
            { title: "Chiroqchi Salati", description: "Yangi sabzavotlar, pyuresi, tuxum va maxsus french sousi bilan.", price: "20,000 so'm" },
            { title: "Sezer Salati", description: "Romsalat, parmesan, croutons va caesar sousi bilan.", price: "30,000 so'm" },
            { title: "Svejiy Salat", description: "Yangi sabzavotlar: pomidor, bodring, ko'katlar va zaytun moyi.", price: "15,000 so'm" },
            { title: "Achchiq Chuchuk Salat", description: "Achchiq va shirin ta'mli salad: qizilmiya, cho'chqa, pomidor va maxsus sous.", price: "15,000 so'm" }
        ],
        mains: [
            { title: "Mastava", description: "Guruch, go'sht va sabzavotlar bilan tayyorlangan an'anaviy O'zbek sho'rvasi.", price: "35,000 so'm", image: "https://zira.uz/wp-content/uploads/2018/02/mastava-1.jpg" },
            { title: "Qaynatma Sho'rva", description: "Go'shtni uzoq vaqt davomida qaynatib tayyorlangan to'qimali sho'rva.", price: "35,000 so'm", image: "https://zira.uz/wp-content/uploads/2020/08/kai--natma-shurpa.jpg" },
            { title: "Grechka", description: "Grechka yoki sovuq - go'sht va sabzavotlar bilan tayyorlangan mazali taom.", price: "35,000 so'm", image: "https://mf.b37mrtl.ru/rbthmedia/images/2021.01/original/6011771d85600a5ea5564c98.jpg" },
            { title: "Ko'za Sho'rva", description: "Ko'zada tayyorlangan go'sht va sabzavotli an'anaviy sho'rva.", price: "70,000 so'm", image: "https://zira.uz/wp-content/uploads/2018/08/lg-schurpa-2.jpg" },
            { title: "Tushonka Sho'rva", description: "Tushonka go'shtidan tayyorlangan mazali va to'qimali sho'rva. An'anaviy usulda pishiriladi.", price: "35,000 so'm", image: "https://www.gazeta.uz/media/img/2021/10/zlqzJT16355047115889_l.jpg" },
            { title: "Jiz", description: "Mol go'shtidan tayyorlangan mazali taom. Qiyma go'sht, piyoz va maxsus ziravorlar bilan.", price: "250,000 so'm", hasWeight: true, baseWeight: 1000, pricePerGram: 250, minWeight: 300, image: "https://adrastravel.com/wp-content/uploads/2023/04/jiz.jpg" },
            { title: "Tabaka", description: "Butun tovuqni yog'da press bilan bosib tayyorlangan shirali va mazali taom.", price: "60,000 so'm", image: "https://images.getrecipekit.com/20240403145433-tabaka-for-card.jpg?aspect_ratio=16:9&quality=90&" },
            { title: "Vag'ori", description: "An'anaviy oshpazlik usulida tayyorlangan mazali Vag'ori taomi. Go'sht va sabzavotlar bilan pishiriladi.", price: "250,000 so'm", hasWeight: true, baseWeight: 1000, pricePerGram: 250, minWeight: 300, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSlYjrX2TZPKi5lhLkyTGO6RwbqlRk_EvyNlQ&s" },
            { title: "KFS", description: "Maxsus marinadlangan qovurilgan tovuq va qovurilgan kartoshka (fri) bilan. KFS - mashhur fast food taomi.", price: "80,000 so'm", hasWeight: true, baseWidth: 1000, pricePerGram: 80, minWeight: 300, image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800" },
            { title: "Barbekyu", description: "Go'shtni maxsus barbekyu sousi bilan grillda pishirilgan mazali taom.", price: "250,000 so'm", hasWeight: true, baseWeight: 1000, pricePerGram: 250, minWeight: 300, image: "https://img.theepochtimes.com/assets/uploads/2021/05/31/shutterstock_1828017947-1-1080x720.jpg" },
            { title: "Mol Go'shti Shashlik", description: "Maxsus marinadlangan mol go'shtidan tayyorlangan shirali shashlik. Uzun vaqt davomida kokilarda pishiriladi va ajoyib ta'mga ega bo'ladi.", price: "110,000 so'm", image: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=800" },
            { title: "Qozon Kabob", description: "Qozonda pishirilgan mazali kabob. Go'sht, sabzavotlar va maxsus ziravorlar bilan.", price: "250,000 so'm", hasWeight: true, baseWeight: 1000, pricePerGram: 250, minWeight: 300, image: "https://makepedia.uz/wp-content/uploads/2018/04/qozon-kabob.jpg" },
            { title: "Manti", description: "Go'sht va sabzavotlar bilan tayyorlangan an'anaviy O'zbek taomi. Bug'da pishiriladi.", price: "7,000 so'm", image: "https://petersfoodadventures.com/wp-content/uploads/2016/05/Manti-Russian.png" },
            { title: "Tandir Somsa", description: "Tandirda pishirilgan go'shtli an'anaviy somsa.", price: "15,000 so'm", image: "https://pbs.twimg.com/media/Gd30LNDawAA2y_p.jpg" }
        ],
        drinks: [
            { title: "Coca Cola", description: "Gazli ichimlik. Sovuq va tetiklashtiruvchi ichimlik.", price: "17,000 so'm", hasSizes: true, sizes: { "1.5l": { price: 17000, desc: "1.5 litr" }, "1l": { price: 12000, desc: "1 litr" }, "0.5l": { price: 8000, desc: "0.5 litr" } } },
            { title: "Yashil Choy", description: "Issiq yashil choy limon va asal bilan. Bu ichimlik sog'liq uchun juda foydali va tetiklashtiradi.", price: "2,000 so'm" },
            { title: "Fanta", description: "Gazli apelsinli ichimlik. Mashhur va tetiklashtiruvchi ichimlik.", price: "17,000 so'm", hasSizes: true, sizes: { "1.5l": { price: 17000, desc: "1.5 litr" }, "1l": { price: 12000, desc: "1 litr" }, "0.5l": { price: 8000, desc: "0.5 litr" } } },
            { title: "Pepsi", description: "Gazli ichimlik. Mashhur va tetiklashtiruvchi ichimlik.", price: "17,000 so'm", hasSizes: true, sizes: { "1.5l": { price: 17000, desc: "1.5 litr" }, "1l": { price: 12000, desc: "1 litr" }, "0.5l": { price: 8000, desc: "0.5 litr" } } },
            { title: "Qora Choy", description: "Issiq qora choy suty bilan. An'anaviy ichimlik.", price: "5,000 so'm" },
            { title: "Limon Choy", description: "Maxsus tayyorlangan limonli choy - yangi limon va choy bilan tayyorlangan.", price: "20,000 so'm" },
            { title: "Sok", description: "Tabiiy meva sharbati - aralash mevalar.", price: "20,000 so'm" },
            { title: "Sprite", description: "Gazli limonato ichimlik. Sovuq va tetiklashtiruvchi ichimlik.", price: "17,000 so'm", hasSizes: true, sizes: { "1.5l": { price: 17000, desc: "1.5 litr" }, "1l": { price: 12000, desc: "1 litr" }, "0.5l": { price: 8000, desc: "0.5 litr" } } }
        ]
    };
}
