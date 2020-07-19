const cacheName = 'jsScopeVisualizer';

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(cacheName).then((cache) => {
      return cache.addAll([
        './',
        './index.html',
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
        './lib/codemirror.css',
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

var networkDataReceived = false;

// fetch fresh data
var networkUpdate = fetch('/data.json')
  .then(function getResponse(response) {
    return response.json();
  })
  .then(function getData(data) {
    networkDataReceived = true;
    updatePage(data);
  });

// fetch cached data
caches
  .match('/data.json')
  .then(function getResponse(response) {
    if (!response) throw Error('No data');
    return response.json();
  })
  .then(function getData(data) {
    // don't overwrite newer network data
    if (!networkDataReceived) {
      updatePage(data);
    }
  })
  .catch(function networkRequest() {
    // we didn't get cached data, the network is our last hope:
    return networkUpdate;
  })
  .catch(console.log);
