const version = 1;
const CACHE_NAME = `jsScopeVisualizer-${version}`;
const urlsToCache = [
  './',
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
  './assets/icons/icon-maskable.png',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Roboto:wght@300&display=swap',
];

self.addEventListener('install', onInstall);
self.addEventListener('activate', onActivate);
self.addEventListener('fetch', onFetch);

main().catch(console.error);

async function main() {
  await cacheFiles();
}

// Install.
function onInstall() {
  self.skipWaiting();
}

// Cache files.
async function cacheFiles(forceReload = false) {
  var cache = await caches.open(CACHE_NAME);

  return Promise.all(
    urlsToCache.map(async function requestFile(url) {
      try {
        let res;

        if (!forceReload) {
          res = await cache.match.url();
          if (res) {
            return res;
          }
        }

        let fetchOptions = {
          method: 'GET',
          cache: 'no-store',
        };

        res = await fetch(url, fetchOptions);
        if (res.ok) {
          await cache.put(url, res.clone());
        }
      } catch (err) {}
    }),
  );
}

// Clean up caches other than current.
function onActivate(event) {
  event.waitUntil(handleActivation());
}

// Cache and update with stale-while-revalidate policy.
function onFetch(event) {
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
}

async function handleActivation() {
  await clearCaches();
  await cacheFiles(true);
}

async function clearCaches() {
  var cacheNames = await caches.keys();
  var oldCacheNames = cacheNames.filter(function matchOldCache(cacheName) {
    var [, cacheNameVersion] =
      cacheName.match(/^jsScopeVisualizer-(\d+)$/) || [];
    cacheNameVersion =
      cacheNameVersion != null ? Number(cacheNameVersion) : cacheNameVersion;
    return cacheNameVersion > 0 && version !== cacheNameVersion;
  });
  await Promise.all(
    oldCacheNames.map(function deleteCache(cacheName) {
      return caches.delete(cacheName);
    }),
  );
}
