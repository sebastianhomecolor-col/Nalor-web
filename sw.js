// NALOR · service worker de la versión web (scripts/build.ts lo rellena). Guarda todos los archivos del juego en el teléfono:
// la primera vez baja todo; después abre desde el teléfono (también sin conexión) y, si hay versión nueva, solo cambia la caché.
const CACHE = "nalor-786cc071604d", FILES = ["./","index.html","game.js","c01_game.glb","modelos.json","manifest.webmanifest","icono-192.png","icono-512.png"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener("activate", (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith("nalor-") && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(caches.open(CACHE).then(async (c) => (await c.match(e.request, { ignoreSearch: true })) ?? fetch(e.request)));
});
