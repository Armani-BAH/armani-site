/* ============================================================
   Sub-category groups (approved by Jasim, Oct 2026)
   The stock system has many tiny sub-families (Trench 1, Bomber 1 …).
   On the site they are shown as a few customer-friendly groups instead.

   SUB_GROUPS[category][gender] = [ [English name, [stock sub-families]], … ]
   - gender is the display gender: MAN (includes UNISEX), WOMAN, BOY, GIRL, UNISEX JUNIOR
   - groups appear on the site in the order written here
   - a sub-family not listed here falls into a group named after its family,
     so new stock never creates a stray 1-item chip
   - a category with only one group shows no chips at all
   To rename a group, change the English name here and its Arabic in GROUP_AR.
   ============================================================ */
const SUB_GROUPS = {
  "READY TO WEAR": {
    "MAN": [
      ["T-Shirts",               ["T-SHIRT","TANK"]],
      ["Polos",                  ["POLO SHIRT"]],
      ["Shirts",                 ["SHIRT","TOP"]],
      ["Knitwear & Sweatshirts", ["PULLOVER","SWEATSHIRT","CARDIGAN","JUMPER","SWEATER","TRACKSUIT"]],
      ["Blazers",                ["BLAZER","WAISTCOAT","SHIRT JACKET"]],
      ["Suits",                  ["SUIT"]],
      ["Jackets & Coats",        ["BLOUSON JACKET","COAT","CABAN COAT","TRENCH","DOWN JACKET","BOMBER JACKET","OUTERWEAR JACKET"]],
      ["Trousers & Shorts",      ["TROUSER","BERMUDA","SHORTS"]],
      ["Jeans",                  ["5 POCKETS PANT","5 POCKETS BERMUDA SHORTS"]],
    ],
    "WOMAN": [
      ["Dresses",                ["DRESS","SKIRT","JUMPSUIT"]],
      ["Shirts & Blouses",       ["SHIRT","TOP","BLOUSE"]],
      ["T-Shirts & Tops",        ["T-SHIRT","JERSEY TOP","TANK"]],
      ["Knitwear & Sweatshirts", ["JUMPER","SWEATSHIRT","SWEATER","PULLOVER","CARDIGAN"]],
      ["Jackets & Coats",        ["BLAZER","COAT","BLOUSON JACKET","SHIRT JACKET","WAISTCOAT","TRENCH","OUTERWEAR JACKET","DOWN JACKET"]],
      ["Trousers",               ["TROUSER","SHORTS","BERMUDA"]],
      ["Jeans",                  ["5 POCKETS PANT"]],
    ],
    "BOY": [
      ["T-Shirts",               ["T-SHIRT","T-SHIRTS SET","TANK"]],
      ["Polos",                  ["POLO SHIRT"]],
      ["Shirts",                 ["SHIRT"]],
      ["Knitwear & Sweatshirts", ["SWEATSHIRT","TRACKSUIT","PULLOVER","CARDIGAN"]],
      ["Jackets & Coats",        ["BLOUSON JACKET","BLAZER","DOWN JACKET","WAISTCOAT","COAT"]],
      ["Trousers & Shorts",      ["TROUSER","SHORTS","5 POCKETS BERMUDA SHORTS","BERMUDA"]],
      ["Jeans",                  ["5 POCKETS PANT"]],
      ["Sets & Gifts",           ["SET TOP+BELOW","GIFT-BOX SET","SET"]],
    ],
    "GIRL": [
      ["Dresses",                ["DRESS","JUMPSUIT"]],
      ["Skirts",                 ["SKIRT"]],
      ["T-Shirts & Tops",        ["T-SHIRT","JERSEY TOP","T-SHIRTS SET"]],
      ["Shirts",                 ["SHIRT"]],
      ["Knitwear & Sweatshirts", ["SWEATSHIRT","PULLOVER","CARDIGAN","TRACKSUIT"]],
      ["Jackets & Coats",        ["BLAZER","COAT","BLOUSON JACKET","DOWN JACKET"]],
      ["Trousers",               ["TROUSER","SHORTS"]],
      ["Jeans",                  ["5 POCKETS PANT"]],
      ["Sets & Gifts",           ["SET TOP+BELOW","GIFT-BOX SET","SET"]],
    ],
    "UNISEX JUNIOR": [
      ["Newborn Sets",           ["SET NEWBORN"]],
      ["Jumpsuits",              ["JUMPSUIT"]],
      ["Padded Suits",           ["PADDED SUIT"]],
    ],
  },

  "LEATHER GOODS": {
    "MAN": [
      ["Bags",                   ["CROSSBODY","MINI BAG","BRIEFCASE BAG","MESSENGER BAG","SHOULDER BAG","BELT BAG"]],
      ["Backpacks",              ["BACKPACK"]],
      ["Wallets",                ["WALLET","WALLET ZIP AROUND","MONEY HOLDER"]],
      ["Card Holders",           ["CARD HOLDER"]],
      ["Belts",                  ["TONGUE BELT","FASHION BELT","BELT SET","PLATE BELT"]],
      ["Beauty Cases",           ["BEAUTY CASE","BEAUTY"]],
      ["Phone & Travel Cases",   ["PHONE CASE","PASSPORT HOLDER","TECH CASE","DOCUMENT HOLDER","ORGANIZER"]],
      ["Gift Sets",              ["SMALL LEATHER GOODS SET"]],
    ],
    "WOMAN": [
      ["Shopping Bags",          ["SHOPPING BAG"]],
      ["Handbags",               ["TOP HANDLE BAG","SHOULDER BAG","HANDBAG","CROSSBODY"]],
      ["Mini Bags",              ["MINI BAG"]],
      ["Wallets & Card Holders", ["WALLET","CARD HOLDER","PHONE CASE"]],
      ["Belts",                  ["TONGUE BELT","PLATE BELT","FASHION BELT"]],
    ],
    "BOY":  [["Bags", ["BACKPACK","CHANGING BAG","BELT BAG","SHOULDER BAG","MINI BAG"]]],
    "GIRL": [["Bags", ["SHOULDER BAG","BACKPACK","MINI BAG","BELT BAG"]]],
  },

  "SHOES": {
    "MAN": [
      ["Sneakers",               ["SNEAKER"]],
      ["Loafers & Lace-ups",     ["DRIVER SHOE","LOAFER","LACED SHOE"]],
      ["Sandals & Slippers",     ["SANDAL","SLIPPER"]],
    ],
    "WOMAN": [
      ["Sneakers",               ["SNEAKER"]],
      ["Pumps & Flats",          ["DECOLLETE SHOE","BALLET FLAT"]],
      ["Sandals & Boots",        ["SANDAL","BOOT"]],
    ],
    "BOY":  [["Shoes", ["SNEAKER","BOOT","SANDAL"]]],
    "GIRL": [["Shoes", ["BALLET FLAT","BOOT","SNEAKER","SANDAL"]]],
  },

  /* Textile Accessories is shown inside Soft Accessories (see app.js) */
  "SOFT ACCESSORIES": {
    "MAN": [
      ["Ties",                   ["TIE","BOW TIE"]],
      ["Caps & Hats",            ["BASEBALL HAT","BEANIE HAT","HAT","CLASSIC HAT"]],
      ["Scarves & Gloves",       ["STOLE","SCARF","GLOVE"]],
    ],
    "WOMAN": [
      ["Scarves & Gloves",       ["STOLE","SCARF","GLOVE"]],
      ["Hats",                   ["CLASSIC HAT","BASEBALL HAT","BEANIE HAT","HAT"]],
    ],
    "BOY": [
      ["Socks & Underwear",      ["UNDERWEAR JUNIOR SET","JUNIOR SOCKS"]],
      ["Hats",                   ["BEANIE HAT","HAT","BASEBALL HAT"]],
      ["Knit Sets",              ["KNITWEAR SET"]],
    ],
    "UNISEX JUNIOR": [
      ["Baby Essentials",        ["BLANKET","INFANT CARE SET"]],
      ["Socks",                  ["JUNIOR SOCKS"]],
      ["Hats",                   ["BEANIE HAT","HAT"]],
    ],
  },

  "UNDERWEAR": {
    "MAN": [
      ["Underwear",              ["3 PACK BOTTOM","UNDERWEAR SET","2 PACK BOTTOM","2 PACK TOP","BOTTOM","TOP"]],
      ["Socks",                  ["SOCKS SET"]],
      ["Nightwear & Loungewear", ["NIGHTWEAR PYJAMA","LOUNGEWEAR BATHROBE"]],
    ],
    "WOMAN": [
      ["Socks",                  ["SOCKS SET"]],
      ["Loungewear & Intimates", ["TOP","LOUNGEWEAR  SWEATSHIRT","LOUNGEWEAR PANTS","BOTTOM"]],
    ],
  },

  "BODYWEAR": {
    "MAN": [
      ["Swimwear",               ["BOXER BEACHWEAR","SHIRT BEACHWEAR"]],
      ["Beach Shoes",            ["SHOES BEACHWEAR"]],
      ["Towels",                 ["TOWEL BEACHWEAR"]],
    ],
  },

  "BIJOUX": {
    "WOMAN": [
      ["Necklaces",              ["NECKLACE"]],
      ["Earrings & Bracelets",   ["EARRINGS","BRACELET"]],
    ],
  },

  /* one chip only (so no chips are shown) */
  "PERFUME": { "MAN": [["Perfume", ["EAU DE PARFUM","EAU DE TOILETTE"]]], "WOMAN": [["Perfume", ["EAU DE PARFUM","EAU DE TOILETTE"]]] },
};

const GROUP_AR = {
  "T-Shirts": "تيشيرتات", "Polos": "قمصان بولو", "T-Shirts & Tops": "تيشيرتات وبلوزات",
  "Shirts": "قمصان", "Shirts & Blouses": "قمصان وبلوزات", "Knitwear & Sweatshirts": "تريكو وسويت شيرت",
  "Blazers": "بليزرات", "Suits": "بدلات", "Jackets & Coats": "جاكيتات ومعاطف",
  "Trousers & Shorts": "بناطيل وشورتات", "Trousers": "بناطيل", "Jeans": "جينز",
  "Dresses": "فساتين", "Skirts": "تنانير", "Sets & Gifts": "أطقم وهدايا",
  "Newborn Sets": "أطقم حديثي الولادة", "Jumpsuits": "جمبسوت", "Padded Suits": "بدلات مبطّنة",
  "Bags": "حقائب", "Backpacks": "حقائب ظهر", "Wallets": "محافظ", "Card Holders": "حافظات بطاقات",
  "Belts": "أحزمة", "Beauty Cases": "حقائب العناية", "Phone & Travel Cases": "أغطية الهاتف ومستلزمات السفر",
  "Gift Sets": "أطقم هدايا", "Shopping Bags": "حقائب تسوّق", "Handbags": "حقائب يد", "Mini Bags": "حقائب صغيرة",
  "Wallets & Card Holders": "محافظ وحافظات بطاقات",
  "Sneakers": "أحذية رياضية", "Loafers & Lace-ups": "لوفر وأحذية برباط", "Sandals & Slippers": "صنادل وشباشب",
  "Pumps & Flats": "أحذية بكعب وباليرينا", "Sandals & Boots": "صنادل وأحذية طويلة", "Shoes": "أحذية",
  "Ties": "ربطات عنق", "Caps & Hats": "قبعات وكابات", "Scarves & Gloves": "أوشحة وقفازات", "Hats": "قبعات",
  "Socks & Underwear": "جوارب وملابس داخلية", "Knit Sets": "أطقم تريكو", "Baby Essentials": "مستلزمات الرضّع",
  "Socks": "جوارب", "Underwear": "ملابس داخلية", "Nightwear & Loungewear": "ملابس نوم ومنزل",
  "Loungewear & Intimates": "ملابس منزلية وداخلية",
  "Swimwear": "ملابس سباحة", "Beach Shoes": "أحذية شاطئ", "Towels": "مناشف",
  "Necklaces": "قلائد", "Earrings & Bracelets": "أقراط وأساور", "Perfume": "عطور",
};

/* Lookup: "CATEGORY|GENDER|SUB" -> { key, order, subOrder } */
const GROUP_INDEX = new Map();
Object.entries(SUB_GROUPS).forEach(([cat, byGender]) =>
  Object.entries(byGender).forEach(([g, groups]) =>
    groups.forEach(([name, subs], order) =>
      subs.forEach((sub, subOrder) => GROUP_INDEX.set(`${cat}|${g}|${sub}`, { key: name, order, subOrder })))));

/* Group for one product; dGender is its display gender (MAN / WOMAN / BOY / GIRL / UNISEX JUNIOR) */
function groupOf(category, dGender, sub, family){
  const hit = GROUP_INDEX.get(`${category}|${dGender}|${sub}`);
  if(hit) return hit;
  /* not in the table: fall back to the family name, placed after the listed groups */
  const key = String(family || sub || "Other").toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  if(typeof trFamily === "function" && !GROUP_AR[key]) GROUP_AR[key] = trFamily(family) || "";
  return { key, order: 99, subOrder: 0 };
}
const grpLabel = key => (IS_AR && GROUP_AR[key]) || key;
