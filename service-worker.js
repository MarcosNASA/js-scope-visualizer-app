const cacheName = 'jsScopeVisualizer';

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(cacheName).then((cache) => {
      return cache.addAll([
        './',
        './index.html',
        './lib/codemirror.css',
        './src/app/styles.css',
        './src/app/styles/code.css',
        './src/app/styles/visualizer.css',
        './src/app/styles/mediaqueries.css',
        './src/app/main.js',
        './lib/lib.js',
        './lib/codemirror.js',
        './lib/esprima.js',
        './lib/javascript.js',
        './lib/parser-babel.js',
        './lib/prettier.js',
        './lib/keywords.js',
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

// Our service worker will intercept all fetch requests
// and check if we have cached the file
// if so it will serve the cached file
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches
      .open(cacheName)
      .then((cache) => cache.match(event.request, { ignoreSearch: true }))
      .then((response) => {
        return response || fetch(event.request);
      })
      .catch(() => {}),
  );
});
