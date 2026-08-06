/* ==========================================================================
   🪷 SADHANA MONITOR — SERVICE WORKER FOR OFFLINE PWA (sw.js)
   ========================================================================== */

const CACHE_NAME = 'sadhana-pwa-v3';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/style.css',
  './css/animations.css',
  './js/app.js',
  './js/storage.js',
  './js/auth.js',
  './js/utils.js',
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
  self.skipWaiting();
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching app shell assets v2');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate Event — Clean up Old Caches & Claim Clients Immediately
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

// Fetch Event — Network-First Strategy with Cache Fallback for instant live updates
self.addEventListener('fetch', (evt) => {
  if (evt.request.method !== 'GET') return;

  evt.respondWith(
    fetch(evt.request).then((networkResponse) => {
      if (networkResponse && networkResponse.status === 200) {
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(evt.request, responseClone));
      }
      return networkResponse;
    }).catch(() => {
      return caches.match(evt.request);
    })
  );
});
