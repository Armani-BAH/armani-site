/* Emporio Armani Bahrain — offline support + "install as an app"
   Change VERSION whenever you want every phone to drop its old copy at once. */
const VERSION = "ea-v2";
const SHELL = `${VERSION}-shell`, IMAGES = `${VERSION}-img`, MAX_IMAGES = 400;
const CORE = [
  "./", "index.html", "css/style.css", "js/i18n.js", "js/app.js", "data/products.json",
  "assets/logo/emporio-armani-logo.png", "assets/icons/favicon-32.png", "assets/icons/icon-192.png",
  "assets/fonts/jost-latin-300-normal.woff2", "assets/fonts/jost-latin-400-normal.woff2", "assets/fonts/jost-latin-500-normal.woff2"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => !k.startsWith(VERSION)).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

/* keep the photo cache from growing forever */
async function trim(name, max) {
  const c = await caches.open(name), keys = await c.keys();
  for (let i = 0; i < keys.length - max; i++) await c.delete(keys[i]);
}

self.addEventListener("fetch", e => {
  const req = e.request; if (req.method !== "GET") return;
  const url = new URL(req.url);

  /* product photos: from the phone first (fast), otherwise download and keep */
  if (url.hostname === "assets-cf.armani.com") {
    e.respondWith(caches.open(IMAGES).then(async c => {
      const hit = await c.match(req); if (hit) return hit;
      const res = await fetch(req);
      if (res.ok || res.type === "opaque") { c.put(req, res.clone()); trim(IMAGES, MAX_IMAGES); }
      return res;
    }));
    return;
  }
  if (url.origin !== location.origin) return;

  /* pages, code and catalogue: always try for the newest version, fall back to the saved copy offline */
  e.respondWith(
    fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(SHELL).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match("index.html")))
  );
});
