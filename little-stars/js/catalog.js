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
  'green-tee':          { cat: 'tops', tags: ['sunny'] },
  'navy-tee':           { cat: 'tops', tags: ['sunny'] },
  'peach-tee':          { cat: 'tops', tags: ['sunny'] },
  'white-tee':          { cat: 'tops', tags: ['sunny'] },
  'varsity-tee':        { cat: 'tops', tags: ['sunny'] },
  'green-hoodie':       { cat: 'tops' },
  'burgundy-hoodie':    { cat: 'tops' },
  'pink-cardigan':      { cat: 'tops' },
  'pattern-sweatshirt': { cat: 'tops' },
  'beige-pullover':     { cat: 'tops' },
  'eagle-tees':         { cat: 'tops', tags: ['eagle'] },
  'three-tees':         { cat: 'tops', tags: ['count3'] },

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
  'peach-dress':        { cat: 'dresses' }
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
LS.byTag = function (tag) {
  return Object.keys(LS.ITEMS).filter(function (k) { return (LS.ITEMS[k].tags || []).indexOf(tag) >= 0; });
};
