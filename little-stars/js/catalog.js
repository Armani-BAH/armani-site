/* ============================================================
   LITTLE STARS — PRODUCT CATALOGUE
   ------------------------------------------------------------
   This is the ONE place that lists the photos used in the game.

   To swap a photo:   replace the .jpg in assets/images/<folder>/
                      keeping the SAME file name. Nothing else to do.
   To add a photo:    put it in the right folder and add one line
                      below:  'new-name': { cat: 'tops' },
   Photos work best as 4:5 portrait (e.g. 640 x 800) on a white
   or very light background.

   cat   = folder / type of item
   tags  = what the quiz knows about the item (optional)
   ============================================================ */
window.LS = window.LS || {};

LS.ITEMS = {
  /* ---------- tops ---------- */
  'green-tee':          { cat: 'tops', tags: ['sunny', 'tee'] },
  'navy-tee':           { cat: 'tops', tags: ['sunny', 'tee'] },
  'peach-tee':          { cat: 'tops', tags: ['sunny', 'tee'] },
  'white-tee':          { cat: 'tops', tags: ['sunny', 'tee'] },
  'varsity-tee':        { cat: 'tops', tags: ['sunny', 'tee'] },
  'green-hoodie':       { cat: 'tops' },
  'burgundy-hoodie':    { cat: 'tops' },
  'pink-cardigan':      { cat: 'tops' },
  'pattern-sweatshirt': { cat: 'tops' },
  'beige-pullover':     { cat: 'tops' },
  'eagle-tees':         { cat: 'tops', tags: ['eagle', 'multi'] },
  'three-tees':         { cat: 'tops', tags: ['count3', 'multi'] },

  /* ---------- trousers, jeans, skirts ---------- */
  'green-joggers':      { cat: 'bottoms' },
  'burgundy-joggers':   { cat: 'bottoms' },
  'jeans':              { cat: 'bottoms' },
  'navy-trousers':      { cat: 'bottoms' },
  'pink-skirt':         { cat: 'bottoms' },
  'check-skirt':        { cat: 'bottoms' },
  'navy-shorts':        { cat: 'bottoms', tags: ['sunny'] },
  'light-jeans':        { cat: 'bottoms' },

  /* ---------- shoes ---------- */
  'navy-sneakers':      { cat: 'shoes' },
  'tan-sneakers':       { cat: 'shoes' },
  'blue-sneakers':      { cat: 'shoes' },
  'pink-ballet':        { cat: 'shoes' },
  'silver-ballet':      { cat: 'shoes' },
  'black-boots':        { cat: 'shoes' },
  'cream-sneakers':     { cat: 'shoes' },
  'black-ballet':       { cat: 'shoes' },

  /* ---------- accessories ---------- */
  'backpack':           { cat: 'accessories', tags: ['bag'] },
  'cap':                { cat: 'accessories', tags: ['hat'] },
  'beige-beanie':       { cat: 'accessories', tags: ['hat', 'cold'] },
  'navy-beanie':        { cat: 'accessories', tags: ['hat', 'cold'] },
  'pink-beret':         { cat: 'accessories', tags: ['hat'] },
  'pink-bag':           { cat: 'accessories', tags: ['bag'] },
  'cream-bag':          { cat: 'accessories', tags: ['bag'] },
  'socks':              { cat: 'accessories' },

  /* ---------- jackets & coats ---------- */
  'navy-blazer':        { cat: 'jackets' },
  'varsity-jacket':     { cat: 'jackets' },
  'pattern-puffer':     { cat: 'jackets', tags: ['cold'] },
  'pink-jacket':        { cat: 'jackets' },
  'check-jacket':       { cat: 'jackets' },
  'navy-coat':          { cat: 'jackets', tags: ['cold'] },
  'black-puffer':       { cat: 'jackets', tags: ['cold'] },

  /* ---------- dresses ---------- */
  'navy-dress':         { cat: 'dresses' },
  'check-dress':        { cat: 'dresses' },
  'green-dress':        { cat: 'dresses' },
  'pink-dress':         { cat: 'dresses' },
  'peach-dress':        { cat: 'dresses' },

  /* ---------- more pieces from the FW26 kids collection (added Nov 2026) ---------- */
  /* tops */
  'tee-1': { cat: 'tops', tags: ['tee', 'sunny', 'eagle'] },
  'tee-2': { cat: 'tops' },
  'tee-3': { cat: 'tops', tags: ['tee', 'sunny'] },
  'tee-4': { cat: 'tops', tags: ['tee', 'sunny'] },
  'tee-5': { cat: 'tops' },
  'tee-6': { cat: 'tops', tags: ['tee', 'sunny'] },
  'tee-7': { cat: 'tops', tags: ['tee', 'sunny'] },
  'tee-8': { cat: 'tops', tags: ['tee', 'sunny'] },
  'tee-9': { cat: 'tops', tags: ['tee', 'sunny'] },
  'tee-10': { cat: 'tops', tags: ['tee', 'sunny'] },
  'tee-11': { cat: 'tops', tags: ['tee', 'sunny'] },
  'tee-12': { cat: 'tops', tags: ['tee', 'sunny'] },
  'tee-13': { cat: 'tops', tags: ['tee', 'sunny'] },
  'tee-14': { cat: 'tops' },
  'tee-15': { cat: 'tops', tags: ['tee', 'sunny'] },
  'tee-16': { cat: 'tops', tags: ['tee', 'sunny'] },
  'tee-17': { cat: 'tops', tags: ['tee', 'sunny'] },
  'tee-18': { cat: 'tops', tags: ['tee', 'sunny'] },
  'tee-19': { cat: 'tops' },
  'tee-20': { cat: 'tops' },
  'tee-21': { cat: 'tops' },
  'tee-22': { cat: 'tops' },
  'tee-23': { cat: 'tops', tags: ['tee', 'sunny'] },
  'tee-24': { cat: 'tops', tags: ['tee', 'sunny'] },
  'tee-25': { cat: 'tops' },
  'tee-26': { cat: 'tops', tags: ['tee', 'sunny'] },
  'tee-27': { cat: 'tops', tags: ['tee', 'sunny'] },
  'tee-28': { cat: 'tops', tags: ['tee', 'sunny'] },
  'tee-29': { cat: 'tops' },
  'tee-30': { cat: 'tops' },
  'tee-31': { cat: 'tops', tags: ['tee', 'sunny'] },
  'tee-32': { cat: 'tops', tags: ['tee', 'sunny'] },
  'tee-33': { cat: 'tops' },
  'tee-34': { cat: 'tops' },
  'tee-35': { cat: 'tops' },
  'tee-36': { cat: 'tops' },
  'tee-37': { cat: 'tops' },
  'tee-38': { cat: 'tops', tags: ['tee', 'sunny'] },
  'tee-39': { cat: 'tops', tags: ['tee', 'sunny'] },
  'sweatshirt-1': { cat: 'tops' },
  'sweatshirt-2': { cat: 'tops' },
  'sweatshirt-3': { cat: 'tops' },
  'sweatshirt-4': { cat: 'tops' },
  'sweatshirt-5': { cat: 'tops' },
  'sweatshirt-6': { cat: 'tops' },
  'sweatshirt-7': { cat: 'tops' },
  'sweatshirt-8': { cat: 'tops' },
  'sweatshirt-9': { cat: 'tops' },
  'sweatshirt-10': { cat: 'tops' },
  'sweatshirt-11': { cat: 'tops' },
  'shirt-1': { cat: 'tops' },
  'shirt-2': { cat: 'tops' },
  'shirt-3': { cat: 'tops' },
  'shirt-4': { cat: 'tops' },
  'shirt-5': { cat: 'tops' },
  'shirt-6': { cat: 'tops' },
  'shirt-7': { cat: 'tops' },
  'shirt-8': { cat: 'tops' },
  'pullover-1': { cat: 'tops' },
  'pullover-2': { cat: 'tops' },
  'pullover-3': { cat: 'tops' },
  'pullover-4': { cat: 'tops' },
  'pullover-5': { cat: 'tops' },
  'polo-1': { cat: 'tops', tags: ['sunny'] },
  'polo-2': { cat: 'tops', tags: ['sunny'] },
  'polo-3': { cat: 'tops', tags: ['sunny'] },
  'polo-4': { cat: 'tops', tags: ['sunny'] },
  'polo-5': { cat: 'tops', tags: ['sunny'] },
  'polo-6': { cat: 'tops', tags: ['sunny'] },
  'polo-7': { cat: 'tops', tags: ['sunny'] },
  'cardigan-1': { cat: 'tops' },
  'cardigan-2': { cat: 'tops' },
  'cardigan-3': { cat: 'tops' },
  /* bottoms */
  'trousers-1': { cat: 'bottoms' },
  'trousers-2': { cat: 'bottoms' },
  'trousers-3': { cat: 'bottoms' },
  'trousers-4': { cat: 'bottoms' },
  'trousers-5': { cat: 'bottoms' },
  'trousers-6': { cat: 'bottoms', tags: ['sunny'] },
  'trousers-7': { cat: 'bottoms' },
  'trousers-8': { cat: 'bottoms' },
  'trousers-9': { cat: 'bottoms' },
  'trousers-10': { cat: 'bottoms' },
  'trousers-11': { cat: 'bottoms' },
  'trousers-12': { cat: 'bottoms' },
  'trousers-13': { cat: 'bottoms' },
  'trousers-14': { cat: 'bottoms' },
  'trousers-15': { cat: 'bottoms' },
  'skirt-1': { cat: 'bottoms' },
  'skirt-2': { cat: 'bottoms' },
  'jeans-1': { cat: 'bottoms' },
  'jeans-2': { cat: 'bottoms' },
  'jeans-3': { cat: 'bottoms', tags: ['sunny'] },
  'jeans-4': { cat: 'bottoms' },
  'jeans-5': { cat: 'bottoms' },
  'jeans-6': { cat: 'bottoms' },
  'jeans-7': { cat: 'bottoms', tags: ['sunny'] },
  'jeans-8': { cat: 'bottoms' },
  'jeans-9': { cat: 'bottoms', tags: ['sunny'] },
  'jeans-10': { cat: 'bottoms' },
  'jeans-11': { cat: 'bottoms' },
  'jeans-12': { cat: 'bottoms' },
  'jeans-13': { cat: 'bottoms' },
  'jeans-14': { cat: 'bottoms', tags: ['sunny'] },
  'jeans-15': { cat: 'bottoms' },
  'jeans-16': { cat: 'bottoms' },
  'jeans-17': { cat: 'bottoms' },
  'jeans-18': { cat: 'bottoms', tags: ['sunny'] },
  'denim-shorts-1': { cat: 'bottoms', tags: ['sunny'] },
  /* shoes */
  'sneakers-1': { cat: 'shoes' },
  'sneakers-2': { cat: 'shoes' },
  'sneakers-3': { cat: 'shoes' },
  'sneakers-4': { cat: 'shoes' },
  'ballet-1': { cat: 'shoes' },
  'ballet-2': { cat: 'shoes' },
  /* accessories */
  'mini-bag-1': { cat: 'accessories', tags: ['bag'] },
  'beret-1': { cat: 'accessories', tags: ['hat'] },
  /* jackets */
  'puffer-1': { cat: 'jackets', tags: ['cold'] },
  'puffer-2': { cat: 'jackets', tags: ['cold'] },
  'jacket-1': { cat: 'jackets' },
  'jacket-2': { cat: 'jackets' },
  'jacket-3': { cat: 'jackets' },
  'jacket-4': { cat: 'jackets' },
  'jacket-5': { cat: 'jackets' },
  'blazer-1': { cat: 'jackets' },
  'blazer-2': { cat: 'jackets' },
  'blazer-3': { cat: 'jackets' },
  'blazer-4': { cat: 'jackets' },
  /* dresses */
  'dress-1': { cat: 'dresses' },
  'dress-2': { cat: 'dresses' },
  'dress-3': { cat: 'dresses' },
  'dress-4': { cat: 'dresses' },
  'dress-5': { cat: 'dresses' },
  'dress-6': { cat: 'dresses' },
  'dress-7': { cat: 'dresses' },
  'dress-8': { cat: 'dresses' },
  'dress-9': { cat: 'dresses' }
};

/* Colour-matched looks used by "Little Armani Stylist" and the final challenge.
   bottom / shoes / acc:  { ok: the matching piece, no: clearly different pieces }
   shoesFree / accFree:   a free creative choice — every answer is a good answer. */
LS.LOOKS = [
  {
    id: 'green', top: 'green-tee',
    bottom: { ok: 'green-joggers', no: ['burgundy-joggers', 'pink-skirt', 'check-skirt'] },
    shoesFree: ['cream-sneakers', 'tan-sneakers', 'blue-sneakers'],
    accFree: ['beige-beanie', 'backpack', 'cap']
  },
  {
    id: 'pink', top: 'pink-cardigan',
    bottom: { ok: 'pink-skirt', no: ['green-joggers', 'burgundy-joggers', 'navy-shorts'] },
    shoes: { ok: 'pink-ballet', no: ['black-boots', 'navy-sneakers', 'tan-sneakers'] },
    accFree: ['pink-bag', 'pink-beret', 'cream-bag']
  },
  {
    id: 'burgundy', top: 'burgundy-hoodie',
    bottom: { ok: 'burgundy-joggers', no: ['green-joggers', 'pink-skirt', 'light-jeans'] },
    shoesFree: ['navy-sneakers', 'black-boots', 'cream-sneakers'],
    accFree: ['cap', 'backpack', 'navy-beanie']
  }
];

LS.src = function (id) {
  return 'assets/images/' + LS.ITEMS[id].cat + '/' + id + '.jpg';
};
LS.byCat = function (cat) {
  return Object.keys(LS.ITEMS).filter(function (k) { return LS.ITEMS[k].cat === cat; });
};
/* what can go on each part of the dress-up figure */
LS.figureLists = function () {
  var single = function (k) { return (LS.ITEMS[k].tags || []).indexOf('multi') < 0; };
  return {
    top: LS.byCat('tops').filter(single).concat(LS.byCat('jackets'), LS.byCat('dresses')),
    bottom: LS.byCat('bottoms'),
    shoes: LS.byCat('shoes'),
    extra: LS.byCat('accessories')
  };
};
LS.byTag = function (tag) {
  return Object.keys(LS.ITEMS).filter(function (k) { return (LS.ITEMS[k].tags || []).indexOf(tag) >= 0; });
};
