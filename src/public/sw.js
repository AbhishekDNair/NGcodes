// Karshaka Care Service Worker - Offline Caching & Resilience
// Version: karshaka-care-sw-v11 (migrated from krishivaani-v1)

const CACHE_NAME = 'karshaka-care-v11';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/app.js',
  '/js/offline-advisor.js',
  '/manifest.json',
  '/assets/rice_leaf_sample.jpg'
];

// Install: Pre-cache core application shell and activate immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching application shell...');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate: Purge all obsolete caches immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log(`[SW] Deleting old cache: ${name}`);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Handle network requests with offline resilience
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. API Requests (Network-First with structured offline fallback)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .catch(() => {
          // If offline and request is an API call, return fallback JSON
          console.warn(`[SW] API offline fallback for: ${url.pathname}`);
          return new Response(
            JSON.stringify({
              offline: true,
              success: false,
              message: 'No internet connection. System running in offline local mode.',
              messageMl: 'ഇന്റർനെറ്റ് കണക്ഷൻ ലഭ്യമല്ല. സിസ്റ്റം ഓഫ്‌ലൈൻ മോഡിൽ പ്രവർത്തിക്കുന്നു.',
              messageEn: 'No internet connection. System running in offline local mode.',
              timestamp: new Date().toISOString()
            }),
            {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        })
    );
    return;
  }

  // 2. Static Assets & Pages (Network-First with Cache Fallback for instant updates)
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (request.method === 'GET' && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
      })
  );
});
