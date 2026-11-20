// NALOR · service worker de la versión web (scripts/build.ts lo rellena). Guarda los archivos del juego en el teléfono, cada
// uno con su huella: la primera vez baja todo; en cada versión nueva SOLO baja los archivos que han cambiado (la casa C01,
// 18 MB, no se vuelve a bajar si no cambia). Después abre desde el teléfono, también sin conexión.
const VER = "2a255eb494ea", FILES = {"index.html":"39c7bcf4837e","game.js":"96f1eea02870","c01_game.glb":"b8009b28af7a","modelos.json":"1154500099c8","manifest.webmanifest":"8bb1ec4f1579","icono-192.png":"41631812547f","icono-512.png":"ee02f67edc17"}, CACHE = "nalor-archivos";
const key = (n) => new URL(`${n}?h=${FILES[n]}`, self.registration.scope).href;
const nameOf = (url) => { const s = self.registration.scope, u = new URL(url); if (!u.href.startsWith(s)) return null; const n = u.origin + u.pathname === s ? "index.html" : u.href.slice(s.length).split(/[?#]/)[0]; return n in FILES ? n : null; };
self.addEventListener("install", (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    for (const n of Object.keys(FILES)) {
      if (await c.match(key(n))) continue;
      const r = await fetch(n, { cache: "reload" });
      if (!r.ok) throw new Error(`${n}: ${r.status}`);
      await c.put(key(n), r);
    }
    await self.skipWaiting();
  })());
});
self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    const keep = new Set(Object.keys(FILES).map(key)), c = await caches.open(CACHE);
    for (const r of await c.keys()) if (!keep.has(r.url)) await c.delete(r);
    for (const k of await caches.keys()) if (k.startsWith("nalor-") && k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const n = nameOf(e.request.url); if (!n) return;
  e.respondWith(caches.open(CACHE).then(async (c) => (await c.match(key(n))) ?? fetch(e.request)));
});
