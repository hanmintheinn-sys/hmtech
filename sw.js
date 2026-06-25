const CACHE_NAME = 'scope-pro-cache-v2';
const urlsToCache = [
  '/',
  '/hmtech/index.html',
  '/hmtech/css/style.css',
  '/hmtech/js/app.js',
  '/hmtech/js/renderer.js',
  '/hmetch/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      })
    ))
  );
});
