/* LITTLE STARS — offline support.
   After the game has been opened once with internet, it keeps working without it.
   Online it always loads the newest files; VERSION only matters for the offline copy. */
const VERSION = '20261111-2000';
const FILES = [
  "./",
  "assets/fonts/bodoni-moda-latin-400-normal.woff2",
  "assets/fonts/bodoni-moda-latin-500-normal.woff2",
  "assets/fonts/jost-latin-300-normal.woff2",
  "assets/fonts/jost-latin-400-normal.woff2",
  "assets/fonts/jost-latin-500-normal.woff2",
  "assets/fonts/tajawal-arabic-400-normal.woff2",
  "assets/fonts/tajawal-arabic-500-normal.woff2",
  "assets/fonts/tajawal-arabic-700-normal.woff2",
  "assets/icons/apple-touch-icon.png",
  "assets/icons/favicon-32.png",
  "assets/icons/icon-192.png",
  "assets/icons/icon-512.png",
  "assets/images/accessories/backpack.jpg",
  "assets/images/accessories/beige-beanie.jpg",
  "assets/images/accessories/cap.jpg",
  "assets/images/accessories/cream-bag.jpg",
  "assets/images/accessories/navy-beanie.jpg",
  "assets/images/accessories/pink-bag.jpg",
  "assets/images/accessories/pink-beret.jpg",
  "assets/images/accessories/socks.jpg",
  "assets/images/bottoms/burgundy-joggers.jpg",
  "assets/images/bottoms/check-skirt.jpg",
  "assets/images/bottoms/green-joggers.jpg",
  "assets/images/bottoms/jeans.jpg",
  "assets/images/bottoms/light-jeans.jpg",
  "assets/images/bottoms/navy-shorts.jpg",
  "assets/images/bottoms/navy-trousers.jpg",
  "assets/images/bottoms/pink-skirt.jpg",
  "assets/images/dresses/check-dress.jpg",
  "assets/images/dresses/green-dress.jpg",
  "assets/images/dresses/navy-dress.jpg",
  "assets/images/dresses/peach-dress.jpg",
  "assets/images/dresses/pink-dress.jpg",
  "assets/images/jackets/black-puffer.jpg",
  "assets/images/jackets/check-jacket.jpg",
  "assets/images/jackets/navy-blazer.jpg",
  "assets/images/jackets/navy-coat.jpg",
  "assets/images/jackets/pattern-puffer.jpg",
  "assets/images/jackets/pink-jacket.jpg",
  "assets/images/jackets/varsity-jacket.jpg",
  "assets/images/shoes/black-ballet.jpg",
  "assets/images/shoes/black-boots.jpg",
  "assets/images/shoes/blue-sneakers.jpg",
  "assets/images/shoes/cream-sneakers.jpg",
  "assets/images/shoes/navy-sneakers.jpg",
  "assets/images/shoes/pink-ballet.jpg",
  "assets/images/shoes/silver-ballet.jpg",
  "assets/images/shoes/tan-sneakers.jpg",
  "assets/images/tops/beige-pullover.jpg",
  "assets/images/tops/burgundy-hoodie.jpg",
  "assets/images/tops/eagle-tees.jpg",
  "assets/images/tops/green-hoodie.jpg",
  "assets/images/tops/green-tee.jpg",
  "assets/images/tops/navy-tee.jpg",
  "assets/images/tops/pattern-sweatshirt.jpg",
  "assets/images/tops/peach-tee.jpg",
  "assets/images/tops/pink-cardigan.jpg",
  "assets/images/tops/three-tees.jpg",
  "assets/images/tops/varsity-tee.jpg",
  "assets/images/tops/white-tee.jpg",
  "assets/logo/emporio-armani-logo.png",
  "css/style.css",
  "index.html",
  "js/app.js",
  "js/catalog.js",
  "js/core.js",
  "js/games/adventure.js",
  "js/games/catch.js",
  "js/games/challenge.js",
  "js/games/designer.js",
  "js/games/memory.js",
  "js/games/quiz.js",
  "js/games/studio.js",
  "js/games/stylist.js",
  "js/i18n.js",
  "js/mascot.js",
  "manifest.webmanifest"
];

const CACHE = 'little-stars-' + VERSION;

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('little-stars-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
/* Online: always take the newest file from the web (and keep a copy).
   Offline: use the saved copy. So updates show up the next time the game opens. */
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request, { cache: 'no-cache' }).then((res) => {
      if (res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
      }
      return res;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then((hit) => hit || (e.request.mode === 'navigate' ? caches.match('./index.html') : undefined)))
  );
});
