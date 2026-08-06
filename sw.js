/* ==========================================================================
   🪷 SADHANA MONITOR — SERVICE WORKER FOR OFFLINE PWA (sw.js)
   ========================================================================== */

const CACHE_NAME = 'sadhana-pwa-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/style.css',
  './css/animations.css',
  './js/app.js',
  './js/storage.js',
  './js/auth.js',
  './js/profiles.js',
  './js/home.js',
  './js/entry.js',
  './js/shlokas.js',
  './js/quotes.js',
  './js/recommendations.js',
  './js/calendar.js',
  './js/analytics.js',
  './js/counsellor.js',
  './js/settings.js',
  './manifest.json'
];

// Install Event — Pre-cache App Shell Assets
self.addEventListener('install', (evt) => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching app shell assets');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event — Clean up Old Caches
self.addEventListener('activate', (evt) => {
  evt.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Clearing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event — Cache-First Strategy with Network Fallback
self.addEventListener('fetch', (evt) => {
  // Only intercept GET requests
  if (evt.request.method !== 'GET') return;

  evt.respondWith(
    caches.match(evt.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached asset and update cache in background
        fetch(evt.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(evt.request, networkResponse));
          }
        }).catch(() => {});
        return cachedResponse;
      }

      return fetch(evt.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(evt.request, responseToCache));
        return networkResponse;
      });
    })
  );
});
