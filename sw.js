// KakshaSahay Service Worker - Zero-Connectivity Offline Engine (sw.js)
// Updated for instant access on normal refresh with Network-First navigation & Stale-While-Revalidate
const CACHE_NAME = 'kakshasahay-v16-ci-recovery';
const CORE_ASSETS = [
  './',
  './index.html',
  './css/styles.css',
  './manifest.json',
  './assets/icon.svg',
  './sw.js',
  './js/bhasha-data.js',
  './js/state.js',
  './js/timer.js',
  './js/audio.js',
  './js/storage.js',
  './js/modal.js',
  './js/rag.js',
  './js/voice.js',
  './js/diagnostics.js',
  './js/app.js'
];

// 1. Install Event: Pre-cache all core HTML, CSS, manifest, icons, and modular JS
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[KakshaSahay SW] Pre-caching core assets for zero-connectivity classrooms');
      return cache.addAll(CORE_ASSETS).catch((err) => {
        console.warn('[KakshaSahay SW] Cache addAll partial failure:', err);
      });
    })
  );
});

// 2. Activate Event: Invalidate obsolete caches and claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[KakshaSahay SW] Deleting outdated cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Event:
// - Network-First for HTML navigation: guarantees normal refreshes load freshest deploy when online, falls back to cache offline
// - Stale-While-Revalidate for static assets: instant load with background cache refresh
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Allow cross-origin media/video iframes to pass through normally
  if (url.origin !== self.location.origin) return;

  const isNavigation = event.request.mode === 'navigate' ||
                       event.request.destination === 'document' ||
                       event.request.headers.get('accept')?.includes('text/html');

  if (isNavigation) {
    // Network-First for HTML pages
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Offline fallback
          return caches.match(event.request).then((cached) => {
            return cached || caches.match('./index.html');
          });
        })
    );
    return;
  }

  // Stale-While-Revalidate for static assets (CSS, JS, fonts, icons)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
