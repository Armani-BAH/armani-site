// Client Advisors - ONE list used by the personal links (catalogue) AND the advisors page.
// id       = short, lowercase, letters/numbers only. This is what goes in the link: ?a=mohammed
// whatsapp = digits only, with country code 973 (no + and no spaces)
// role / roleAr / group are used only by the advisors page (store management is shown under its own heading).
// Keep every key in "quotes" and no trailing comma, so scripts/make_advisor_links.py can read it.
window.EA_ADVISORS = [
  { "id": "mohammed", "name": "Mohammed Ghuloom", "nameAr": "محمد غلوم",    "whatsapp": "97333161154" },
  { "id": "layla",    "name": "Layla Alqaidoom",  "nameAr": "ليلى القيدوم", "whatsapp": "97333161142" },
  { "id": "mayssa",   "name": "Mayssa Aloui",     "nameAr": "ميساء علوي",   "whatsapp": "97333161076" },
  { "id": "alaa",     "name": "Alaa Faisal",      "nameAr": "آلاء فيصل",    "whatsapp": "97333161159" },
  { "id": "jasim",    "name": "Jasim Almudaweb",  "nameAr": "جاسم المدوب",  "whatsapp": "97335581881", "role": "Store Manager",           "roleAr": "مدير المتجر",         "group": "management" },
  { "id": "ahmed",    "name": "Ahmed Kuwaitan",   "nameAr": "أحمد كويتان",  "whatsapp": "97333480808", "role": "Assistant Store Manager", "roleAr": "مساعد مدير المتجر", "group": "management" }
];
