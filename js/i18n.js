/* =========================================================================
   Emporio Armani Bahrain — English / Arabic
   ------------------------------------------------------------------------
   HOW TO CHANGE A TRANSLATION
   Find the English text on the left and change the Arabic on the right.
   Anything missing here simply stays in English.
   {n}, {name}, {time} … are filled in by the site — keep them as they are.
   ========================================================================= */

const LANG = (() => {
  try { const s = localStorage.getItem("ea_lang"); if (s === "ar" || s === "en") return s; } catch (e) {}
  return (navigator.language || "").toLowerCase().startsWith("ar") ? "ar" : "en";
})();
const IS_AR = LANG === "ar";

/* ---------- website text ---------- */
const AR_UI = {
  /* header, landing, navigation */
  "Marassi Mall, Bahrain · FW26 selection": "مراسي مول، البحرين · مجموعة خريف وشتاء 2026",
  "Marassi Mall, Bahrain": "مراسي مول، البحرين",
  "Browse all departments →": "تصفّح جميع الأقسام ←",
  "Browse all categories →": "تصفّح جميع الفئات ←",
  "All departments": "جميع الأقسام",
  "All categories": "جميع الفئات",
  "Skip to products": "انتقل إلى المنتجات",
  "Back to home": "العودة إلى الرئيسية",
  "Search": "بحث",
  "Search style, fabric or colour code": "ابحث برمز الموديل أو القماش أو اللون",
  "My selection": "اختياراتي",
  "Department": "القسم",
  "Category": "الفئة",
  "Type": "النوع",
  "You are here": "أنت هنا",
  "FW26 selection": "مجموعة خريف وشتاء 2026",
  "Shared selection": "اختيارات تمت مشاركتها",

  /* toolbar & filters */
  "Selected only": "المختارة فقط",
  "Selected pieces only": "القطع المختارة فقط",
  "Sort": "الترتيب",
  "Featured": "المميّزة",
  "Name, A–Z": "الاسم",
  "Category, A–Z": "الفئة",
  "Style code, A–Z": "رمز الموديل",
  "Filters": "التصفية",
  "Filter & Sort": "التصفية والترتيب",
  "Clear all filters": "إزالة كل عوامل التصفية",
  "Show more": "عرض المزيد",
  "Show more ({n} left)": "عرض المزيد (متبقٍ {n})",
  "Done": "تم",
  "No pieces match": "لا توجد قطع مطابقة",
  "Try widening your filters or clearing the search.": "جرّب توسيع خيارات التصفية أو مسح البحث.",

  /* shared selection */
  "Add all to my selection": "أضف الكل إلى اختياراتي",
  "Browse the full collection": "تصفّح المجموعة كاملة",
  "{pieces} were shared with you.": "تمت مشاركة {pieces} معك.",
  "This link has no pieces that are in the current catalogue.": "لا يحتوي هذا الرابط على قطع من المجموعة الحالية.",

  /* cards & product window */
  "No photo yet": "الصورة غير متوفرة بعد",
  "Select {name}": "اختيار {name}",
  "Colours": "الألوان",
  "Colour {code}": "اللون {code}",
  " (in your selection)": " (ضمن اختياراتك)",
  "Colour": "اللون",
  "{n} available": "{n} متوفرة",
  "Style": "الموديل",
  "Fabric": "القماش",
  "Style code": "رمز الموديل",
  "Fabric code": "رمز القماش",
  "Colour code": "رمز اللون",
  "Family": "المجموعة",
  "Photography for this piece is not available yet.": "صور هذه القطعة غير متوفرة بعد.",
  "Select this piece": "اختيار هذه القطعة",
  "Selected — remove": "تم الاختيار — إزالة",
  "View selection": "عرض اختياراتي",
  "Share this piece": "مشاركة هذه القطعة",
  "Close": "إغلاق",
  "Previous piece": "القطعة السابقة",
  "Next piece": "القطعة التالية",
  "Zoom photo {n}": "تكبير الصورة {n}",
  "Show photo {n}": "عرض الصورة {n}",
  "Zoomed photo": "صورة مكبّرة",
  "Close zoom": "إغلاق التكبير",

  /* selection drawer */
  "{pieces} selected": "{pieces} مختارة",
  "0 pieces selected": "لا توجد قطع مختارة",
  "Clear all": "مسح الكل",
  "Nothing selected yet.": "لم تختر أي قطعة بعد.",
  "Tap the heart on any piece to add it here.": "اضغط على القلب في أي قطعة لإضافتها هنا.",
  "A note for your Client Advisor, e.g. is this available in my size?": "ملاحظة لمستشار العملاء، مثلاً: هل يتوفر مقاسي؟",
  "Add a note": "إضافة ملاحظة",
  "Remove": "إزالة",
  "Add your name and a message (optional)": "أضف اسمك ورسالة (اختياري)",
  "Your name": "الاسم",
  "Mobile number": "رقم الهاتف",
  "A message for your Client Advisor, e.g. I'd like to try these on this weekend.": "رسالة لمستشار العملاء، مثلاً: أود تجربة هذه القطع في عطلة نهاية الأسبوع.",
  "Send to your Client Advisor": "أرسل إلى مستشار العملاء",
  "Save as PDF": "حفظ كملف PDF",
  "Copy link": "نسخ الرابط",
  "Send your selection": "أرسل اختياراتك",
  "Send to": "أرسل إلى",
  "Share with someone else": "مشاركة مع شخص آخر",
  "Cancel": "إلغاء",
  "Chat with us": "تواصل معنا",
  "Chat with us on WhatsApp": "تواصل معنا عبر واتساب",

  /* messages (toasts) */
  "Added {name} to your selection": "تمت إضافة {name} إلى اختياراتك",
  "Removed {name}": "تمت إزالة {name}",
  "Selection cleared": "تم مسح الاختيارات",
  "Select at least one piece first": "اختر قطعة واحدة على الأقل أولاً",
  "Preparing your PDF…": "جارٍ تجهيز ملف PDF…",
  "Link copied — paste it anywhere": "تم نسخ الرابط",
  "Added {pieces} to your selection": "تمت إضافة {pieces} إلى اختياراتك",
  "The catalogue could not be loaded. Please refresh.": "تعذّر تحميل المجموعة. يرجى تحديث الصفحة.",

  /* WhatsApp message & PDF */
  "Hello, I'd like to talk about these pieces from the Emporio Armani FW26 collection.": "مرحباً، أودّ الاستفسار عن هذه القطع من مجموعة Emporio Armani لخريف وشتاء 2026.",
  "Hello, I have a question about the Emporio Armani FW26 collection.": "مرحباً، لدي استفسار عن مجموعة Emporio Armani لخريف وشتاء 2026.",
  "Name": "الاسم",
  "Mobile": "الهاتف",
  "Message": "الرسالة",
  "Note": "ملاحظة",
  "View with photos:": "شاهدها مع الصور:",
  "My selection ({pieces})": "اختياراتي ({pieces})",
  "View online": "شاهدها على الإنترنت",
  "Emporio Armani — my selection": "Emporio Armani — اختياراتي",

  "Install the app on this device": "ثبّت التطبيق على هذا الجهاز",

  "New season": "الموسم الجديد",
  "You may also like": "قد يعجبك أيضاً",
  "Recently viewed": "شوهدت مؤخراً",
  "{pieces} without a photo yet.": "{pieces} بدون صورة حتى الآن.",
  "Show them": "اعرضها",
  "Hide pieces without photos": "إخفاء القطع التي بلا صور",

  /* store */
  "Open now · until {time}": "مفتوح الآن · حتى {time}",
  "Closed · opens today at {time}": "مغلق · يفتح اليوم الساعة {time}",
  "Closed · opens tomorrow at {time}": "مغلق · يفتح غداً الساعة {time}",
  "Get directions": "الاتجاهات",
  "Call": "اتصال",
  "WhatsApp": "واتساب",
  "Style, fabric and colour codes are from the FW26 item list.": "رموز الموديل والقماش واللون مأخوذة من قائمة منتجات خريف وشتاء 2026.",
  "Emporio Armani · Marassi Mall": "Emporio Armani · مراسي مول",
  "Marassi Galleria Mall, Diyar Al Muharraq, Bahrain": "مراسي جاليريا مول، ديار المحرق، البحرين",
};

/* ---------- product words ---------- */
const AR_GENDERS = { "WOMAN": "نساء", "MAN": "رجال", "GIRL": "بنات", "BOY": "أولاد", "UNISEX JUNIOR": "أطفال (للجنسين)", "UNISEX": "رجال" };
const AR_DAYS = { Sunday: "الأحد", Monday: "الاثنين", Tuesday: "الثلاثاء", Wednesday: "الأربعاء", Thursday: "الخميس", Friday: "الجمعة", Saturday: "السبت" };
const AR_CATEGORIES = {
  "BIJOUX": "مجوهرات", "BODYWEAR": "ملابس الشاطئ", "GLASSES": "نظارات", "LEATHER GOODS": "منتجات جلدية",
  "PERFUME": "عطور", "READY TO WEAR": "ملابس جاهزة", "SHOES": "أحذية", "SOFT ACCESSORIES": "إكسسوارات",
  "TEXTILE ACCESSORIES": "ربطات عنق وأوشحة", "UNDERWEAR": "ملابس داخلية"
};
const AR_FAMILIES = {
  "5 POCKETS": "جينز وبناطيل بخمسة جيوب", "BAGS": "حقائب", "BEACHWEAR LEISURE OUT OF WATER": "ملابس الشاطئ",
  "BEACHWEAR LEISURE SWIMSUITS": "ملابس السباحة", "BEACHWEAR&SWIMWEAR ACCESSORIES": "إكسسوارات الشاطئ", "BELTS": "أحزمة",
  "BIJOUX": "مجوهرات", "DRESSES": "فساتين", "GLASSES": "نظارات", "GLOVES": "قفازات", "HATS": "قبعات",
  "INTIMATES": "ملابس داخلية", "JACKETS": "جاكيتات", "JERSEYWEAR": "ملابس جيرسي", "KIDSWEAR SPECIAL": "أطفال — مجموعة خاصة",
  "KNITWEAR": "تريكو", "LEATHER & EXOTIC RTW": "ملابس جلدية", "LOUNGEWEAR": "ملابس منزلية", "NIGHTWEAR": "ملابس نوم",
  "OTHER SOFT ACCESSORIES": "إكسسوارات أخرى", "OUTERWEAR": "ملابس خارجية", "PERFUMES": "عطور", "READY TO WEAR SET": "أطقم",
  "SCARVES": "أوشحة", "SET": "أطقم", "SHIRTS": "قمصان", "SHOES": "أحذية", "SKIRTS": "تنانير",
  "SMALL LEATHER GOODS": "منتجات جلدية صغيرة", "SOCKS": "جوارب", "SUITS": "بدلات", "T-SHIRTS": "تي شيرت",
  "TIES": "ربطات عنق", "TROUSERS": "بناطيل"
};
const AR_TYPES = {
  "2 PACK BOTTOM": "سروال داخلي (قطعتان)", "2 PACK TOP": "قميص داخلي (قطعتان)", "3 PACK BOTTOM": "سروال داخلي (3 قطع)",
  "5 POCKETS BERMUDA SHORTS": "شورت برمودا بخمسة جيوب", "5 POCKETS PANT": "بنطال بخمسة جيوب", "BACKPACK": "حقيبة ظهر",
  "BALLET FLAT": "حذاء باليه", "BASCO HAT": "بيريه", "BASEBALL HAT": "قبعة بيسبول", "BEANIE HAT": "قبعة صوفية",
  "BEAUTY": "مستحضرات تجميل", "BEAUTY CASE": "حقيبة مستحضرات تجميل", "BELT BAG": "حقيبة خصر", "BELT SET": "طقم أحزمة",
  "BERMUDA": "شورت برمودا", "BIKINI": "بيكيني", "BLANKET": "بطانية", "BLAZER": "بليزر", "BLOUSE": "بلوزة",
  "BLOUSON JACKET": "جاكيت بلوزون", "BOMBER JACKET": "جاكيت بومبر", "BOOT": "بوت", "BOTTOM": "قطعة سفلية",
  "BOW TIE": "ربطة عنق فراشة", "BOXER BEACHWEAR": "شورت سباحة", "BRACELET": "سوار", "BRIEFCASE BAG": "حقيبة أوراق",
  "CABAN COAT": "معطف كابان", "CARD HOLDER": "حافظة بطاقات", "CARDIGAN": "كارديغان", "CHANGING BAG": "حقيبة مستلزمات الطفل",
  "CLASSIC HAT": "قبعة كلاسيكية", "COAT": "معطف", "CROSSBODY": "حقيبة كروس", "DECOLLETE SHOE": "حذاء بكعب",
  "DOCUMENT HOLDER": "حافظة مستندات", "DOWN JACKET": "جاكيت محشو", "DRESS": "فستان", "DRIVER SHOE": "حذاء قيادة",
  "EARRINGS": "أقراط", "EAU DE PARFUM": "أو دو بارفان", "EAU DE TOILETTE": "أو دو تواليت", "FASHION BELT": "حزام",
  "GIFT-BOX SET": "طقم هدية", "GLOVE": "قفازات", "HANDBAG": "حقيبة يد", "HAT": "قبعة", "INFANT CARE SET": "طقم عناية بالرضّع",
  "JERSEY TOP": "توب جيرسي", "JUMPER": "كنزة", "JUMPSUIT": "جمبسوت", "JUNIOR SOCKS": "جوارب أطفال", "KNITWEAR SET": "طقم تريكو",
  "LACED SHOE": "حذاء برباط", "LOAFER": "حذاء لوفر", "LOUNGEWEAR SWEATSHIRT": "سويتشيرت منزلي", "LOUNGEWEAR BATHROBE": "روب حمام",
  "LOUNGEWEAR PANTS": "بنطال منزلي", "MESSENGER BAG": "حقيبة مسنجر", "MINI BAG": "حقيبة صغيرة", "MONEY HOLDER": "حافظة نقود",
  "NECKLACE": "قلادة", "NIGHTWEAR PYJAMA": "بيجاما", "ORGANIZER": "منظّم", "OUTERWEAR JACKET": "جاكيت",
  "PADDED SUIT": "بدلة شتوية مبطّنة", "PASSPORT HOLDER": "حافظة جواز سفر", "PHONE CASE": "غطاء هاتف", "PLATE BELT": "حزام بإبزيم",
  "POLO SHIRT": "قميص بولو", "PULLOVER": "بلوفر", "SANDAL": "صندل", "SCARF": "وشاح", "SET": "طقم", "SET NEWBORN": "طقم مواليد",
  "SET TOP+BELOW": "طقم علوي وسفلي", "SHIRT": "قميص", "SHIRT BEACHWEAR": "قميص شاطئ", "SHIRT JACKET": "جاكيت قميص",
  "SHOES BEACHWEAR": "حذاء شاطئ", "SHOPPING BAG": "حقيبة تسوق", "SHORTS": "شورت", "SHOULDER BAG": "حقيبة كتف", "SKIRT": "تنورة",
  "SLIPPER": "شبشب", "SMALL LEATHER GOODS SET": "طقم منتجات جلدية صغيرة", "SNEAKER": "حذاء رياضي", "SOCKS SET": "طقم جوارب",
  "STOLE": "شال", "SUIT": "بدلة", "SUN GLASSES": "نظارة شمسية", "SWEATER": "سويتر", "SWEATSHIRT": "سويتشيرت",
  "T-SHIRT": "تي شيرت", "T-SHIRTS SET": "طقم تي شيرت", "TANK": "توب بدون أكمام", "TECH CASE": "حافظة أجهزة", "TIE": "ربطة عنق",
  "TONGUE BELT": "حزام كلاسيكي", "TOP": "توب", "TOP HANDLE BAG": "حقيبة بمقبض علوي", "TOWEL BEACHWEAR": "منشفة شاطئ",
  "TRACKSUIT": "بدلة رياضية", "TRENCH": "معطف ترنش", "TROUSER": "بنطال", "UNDERWEAR JUNIOR SET": "طقم ملابس داخلية للأطفال",
  "UNDERWEAR SET": "طقم ملابس داخلية", "WAISTCOAT": "صديري", "WALLET": "محفظة", "WALLET ZIP AROUND": "محفظة بسحّاب"
};

/* ---------- helpers used by app.js ---------- */
const norm = s => String(s || "").toUpperCase().split(/\s+/).join(" ").trim();

/* t("Removed {name}", {name:"Wallet"}) */
function t(en, vars) {
  let s = (IS_AR && AR_UI[en] !== undefined) ? AR_UI[en] : en;
  if (vars) for (const k in vars) s = s.split(`{${k}}`).join(vars[k]);
  return s;
}
/* Arabic counting: 1 قطعة واحدة · 2 قطعتان · 3–10 قطع · 11+ قطعة */
function arCount(n, one, two, few, many) {
  if (n === 0) return `0 ${many}`;
  if (n === 1) return one;
  if (n === 2) return two;
  if (n % 100 >= 3 && n % 100 <= 10) return `${n.toLocaleString("en-US")} ${few}`;
  return `${n.toLocaleString("en-US")} ${many}`;
}
const trType     = s => IS_AR && AR_TYPES[norm(s)] || null;
const trCategory = s => IS_AR && AR_CATEGORIES[norm(s)] || null;
const trFamily   = s => IS_AR && AR_FAMILIES[norm(s)] || null;
const trGender   = g => IS_AR && AR_GENDERS[norm(g)] || null;
const trDay      = d => IS_AR && AR_DAYS[d] || d;

/* Translate the fixed text already in index.html (runs once, before anything else is drawn) */
function translateStaticPage() {
  document.documentElement.lang = LANG;
  document.documentElement.dir = IS_AR ? "rtl" : "ltr";
  if (!IS_AR) return;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(n => {
    const key = n.nodeValue.trim().split(/\s+/).join(" ");
    if (key && AR_UI[key] !== undefined) n.nodeValue = n.nodeValue.replace(n.nodeValue.trim(), AR_UI[key]);
  });
  document.querySelectorAll("[placeholder],[aria-label],[title]").forEach(el => {
    ["placeholder", "aria-label", "title"].forEach(a => {
      const v = el.getAttribute(a); if (v && AR_UI[v] !== undefined) el.setAttribute(a, AR_UI[v]);
    });
  });
}

/* English ⇄ العربية switch */
function setLang(l) {
  try { localStorage.setItem("ea_lang", l); } catch (e) {}
  location.reload();
}
