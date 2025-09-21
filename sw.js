const CACHE_NAME = 'bubble-pop-cache-v3';
const urlsToCache = [
  './',
  './index.html',
  './game.js',
  './manifest.json',
  './pwa.js',
  './icon-192.png',
  './icon-512.png',
  // Add scope-relative URLs
  '',
  '/',
  'index.html',
  'game.js',
  'manifest.json',
  'pwa.js',
  'icon-192.png',
  'icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// Activate event: clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event: serve cached files with improved handling for Android
self.addEventListener('fetch', event => {
  event.respondWith(
    (async () => {
      // Try to match the request in cache, including both relative and absolute paths
      const originalRequest = event.request;
      let response = await caches.match(originalRequest);

      if (!response) {
        // If not found, try matching without query strings
        const url = new URL(originalRequest.url);
        const cleanUrl = url.origin + url.pathname;
        const secondAttempt = new Request(cleanUrl);
        response = await caches.match(secondAttempt);
      }

      // If found in cache, return it
      if (response) {
        return response;
      }

      try {
        // If not in cache, try network
        const networkResponse = await fetch(originalRequest);

        // Cache only successful responses
        if (networkResponse.ok) {
          const cache = await caches.open(CACHE_NAME);
          // Cache both with and without trailing slash for robustness
          cache.put(originalRequest, networkResponse.clone());

          // If it's a navigation request, also cache at root
          if (originalRequest.mode === 'navigate') {
            cache.put('/', networkResponse.clone());
            cache.put('./index.html', networkResponse.clone());
            cache.put('/index.html', networkResponse.clone());
          }
        }

        return networkResponse;
      } catch (error) {
        // Network failed, serve from cache
        if (originalRequest.mode === 'navigate') {
          // Try multiple variants for index.html
          const indexVariants = ['./index.html', '/index.html', 'index.html', '/'];
          for (const variant of indexVariants) {
            const indexResponse = await caches.match(variant);
            if (indexResponse) return indexResponse;
          }
        }

        return new Response('Offline - Content not available', {
          status: 503,
          headers: { 'Content-Type': 'text/plain' },
        });
      }
    })()
  );
});
