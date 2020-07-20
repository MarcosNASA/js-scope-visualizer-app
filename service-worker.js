const CACHE_NAME = 'jsScopeVisualizer';

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        './index.html',
        './404.html',
        './lib/codemirror.css',
        './src/app/styles.css',
        './src/app/styles/code.css',
        './src/app/styles/visualizer.css',
        './src/app/styles/scope-theory.css',
        './src/app/styles/mediaqueries.css',
        './lib/keywords.js',
        './lib/prettier.js',
        './lib/parser-babel.js',
        './lib/esprima.js',
        './lib/lib.js',
        './lib/codemirror.js',
        './lib/javascript.js',
        './src/app/main.js',
        './assets/icons/favicon.ico',
        './assets/icons/icon-64.png',
        './assets/icons/icon-96.png',
        './assets/icons/icon-128.png',
        './assets/icons/icon-192.png',
        './assets/icons/icon-256.png',
        './assets/icons/icon-512.png',
        './assets/icons/icon-1080.png',
        './manifest.json',
      ]);
    }),
  );
});

// Cache and update with stale-while-revalidate policy.
self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.cache === 'only-if-cached' && request.mode !== 'same-origin') {
    return;
  }

  event.respondWith(
    (async function staleWhileRevalidate() {
      const cache = await caches.open(CACHE_NAME);

      const cachedResponsePromise = await cache.match(request);
      const networkResponsePromise = fetch(request);

      if (request.url.startsWith(self.location.origin)) {
        event.waitUntil(
          (async function fetchNetwork() {
            const networkResponse = await networkResponsePromise;

            await cache.put(request, networkResponse.clone());
          })(),
        );
      }

      return cachedResponsePromise || networkResponsePromise;
    })(),
  );
});

// Clean up caches other than current.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async function cleanCache() {
      const cacheNames = await caches.keys();

      await Promise.all(
        cacheNames
          .filter((cacheName) => {
            const deleteThisCache = cacheName !== CACHE_NAME;

            return deleteThisCache;
          })
          .map((cacheName) => caches.delete(cacheName)),
      );
    })(),
  );
});
