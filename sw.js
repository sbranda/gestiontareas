/* Service worker de Tareas diarias.
   Guarda la app en el dispositivo para que abra sin conexión.
   Si cambiás algún archivo, subí el número de CACHE para que se actualice. */
var CACHE = 'tareas-diarias-v10';
var ARCHIVOS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon.svg',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) { return c.addAll(ARCHIVOS); }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (claves) {
      return Promise.all(claves.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

/* Responde desde el dispositivo y actualiza en segundo plano cuando hay red. */
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(function (guardado) {
      var red = fetch(req).then(function (res) {
        if (res && res.ok) {
          var copia = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copia); });
        }
        return res;
      }).catch(function () { return guardado || caches.match('./index.html'); });
      return guardado || red;
    })
  );
});
