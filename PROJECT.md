# Emporio Armani Bahrain — Product Selection Site

Static catalogue website for Emporio Armani (Bahrain – Marassi Mall). Clients browse the FW26 collection, add pieces to "My selection", and send it to their Client Advisor on WhatsApp (or save it as a PDF) to start a conversation. No prices, sizes or quantities — on purpose.

- **Repo:** https://github.com/Armani-BAH/armani-site
- **Live (GitHub Pages):** https://armani-bah.github.io/armani-site/
- **Planned domain:** wishlist.armani.com
- **Stack:** plain HTML + CSS + vanilla JS. No build step, no framework. Data comes from an Excel file converted to JSON by a Python script.
- **Run locally:** the site loads `data/products.json` with `fetch()`, so open it through a web server (VS Code "Live Server", or `python -m http.server`), not by double-clicking `index.html`.

---

## 1. Folder structure (current)

```
armani-site/
├── index.html                  Page shell (header, filters, grid, modal, drawer)
├── manifest.webmanifest        "Install as an app" settings (name, icons)
├── sw.js                       Offline support + photo cache
├── PROJECT.md                  This file
├── .gitignore / .gitattributes
├── assets/
│   ├── logo/emporio-armani-logo.png
│   ├── icons/                  Favicon, phone home-screen + app icons (eagle)
│   ├── og-image.jpg            Preview picture shown when the link is shared on WhatsApp
│   ├── fonts/                  Jost (self-hosted)
│   └── images/genders/         Department landing photos
├── css/style.css               All styling
├── js/i18n.js                  English / Arabic text (edit translations here)
├── js/app.js                   All logic; boutique details (STORE) at the top
├── data/
│   ├── armani_styles.xlsx      Source of truth (item list from Excel)
│   └── products.json           Generated catalogue used by the site (1,276 items)
└── scripts/
    ├── build_products.py       Excel -> products.json (+ image lookup on Armani CDN)
    ├── check_missing.py        Lists products with no image
    ├── export_missing.py       Writes products with no image to data/missing_images.xlsx (git-ignored)
    └── test_images.py          Tests image URL patterns for one style
```

## 2. How it works

1. `scripts/build_products.py` reads `data/armani_styles.xlsx` (columns: Gender, Category, Family, Sub-Family, Style Code, Fabric Code, Color Code).
2. For each row it probes the Armani image CDN (`assets-cf.armani.com`) for `F`, `D`, `L` views, newest season first (FW2026 → SS2023), and records the first season that has images.
3. Output is `data/products.json` (each product has `id, gender, category, family, sub, name, styleCode, fabricCode, colorCode, productKey, season, images[]`). `name` is the Sub-Family in Title Case.
4. `js/app.js` loads the JSON and renders the gender nav, category sidebar, filter chips, grid (60 per page + "Load more"), product modal with gallery, and the selection drawer.
5. Selection and buyer details persist in `localStorage` (`ea_selection`, `ea_buyer`). Sharing opens `wa.me` with a text summary plus a link to the selection.
6. The build script writes a resume checkpoint `data/products_progress.json` (git-ignored). Delete it to re-crawl everything.

**Catalogue snapshot (Oct 2026):** 1,276 products after removing duplicates (see #20). Genders: MAN 688, WOMAN 258, BOY 200, GIRL 108, UNISEX JUNIOR 43, UNISEX 12. Categories: Ready to Wear 723, Leather Goods 213, Glasses 91, Soft Accessories 73, Shoes 73, Underwear 67, Bodywear 28, Perfume 25, Textile Accessories 8, Bijoux 8.

Images are now read from the Excel's Image 1–4 columns (no CDN crawling). Rows the Excel files under category "OTHER" are re-filed by family in `build_products.py` (GLASSES → Glasses, PERFUMES → Perfume).

## 3. Issues

| # | Issue | Status |
|---|-------|--------|
| 1 | `name` missing from products.json (modal title, alt text, toasts, sort by name were broken) | **Fixed** — `name` added to the JSON and to `build_products.py` |
| 2 | ~380 KB unused `RAW` array (4,847 old rows, stale vs. the 1,880-row JSON) embedded in app.js | **Fixed** — removed (app.js 383 KB → 19 KB) |
| 3 | Stray `<Bahrain-Marassi>` tag in `<title>` | **Fixed** |
| 4 | Duplicate `id="genderNav"` + stray closing `</div>` in header | **Fixed** — genderNav now sits inside a `.wrap`, so it aligns with the logo/search row |
| 5 | Footer said "images are pending" | **Fixed** — neutral footer text |
| 6 | Identical `products_progress.json` duplicate | **Fixed** — removed and git-ignored |
| 7 | Scripts in the root | **Fixed** — moved to `scripts/`, paths resolve from the repo root |
| 8 | Product images are hotlinked from Armani's CDN (can break; may need brand permission) | **Open** — confirm with the brand/team |
| 9 | CSS leftovers: `--serif` and `--sans` are both Arial, `--bronze` is `#111`, mobile rules for a missing `.header-top` | **Open** — part of visual polish |
| 10 | Implicit globals, duplicate comments, CRLF/LF mix | **Fixed** — `GENDERS`/`CATEGORIES` declared, LF everywhere, `.gitattributes` added |
| 11 | Catalogue failing to load left a blank page | **Fixed** — visible message shown |
| 12 | Product cards show the raw Sub-Family in caps ("SUN GLASSES") while the modal shows the Title Case `name` | **Open** — polish |
| 13 | `assets/images/products/EB001426-F.jpg` is not referenced anywhere | **Open** — use it or delete it |
| 14 | 88 sunglasses + 25 perfumes sat in category "OTHER" | **Fixed** — re-filed by family (data + build script) |
| 15 | Pinch-zoom disabled on phones (`maximum-scale=1.0`) | **Fixed** |
| 16 | Grid/drawer/landing loaded full 1536px images | **Fixed** — `sized()` asks the CDN for 640px (grid), 160px (thumbs), 720px (landing) |
| 17 | Phone cards: codes stacked vertically | **Fixed** — one compact line |
| 18 | No favicon / no WhatsApp link preview | **Fixed** — eagle icons + `og-image.jpg` + Open Graph tags |
| 20 | 30 duplicate rows + 3 placeholder rows (codes = type name) in the Excel | **Fixed** — skipped by `build_products.py` (1,309 → 1,276) |
| 21 | Opening a category from the landing page didn't highlight it in the sidebar | **Fixed** |
| 19 | Debug `console.log` in `renderCategoryNav`, duplicate CSS rules | **Fixed** |

## 4. Roadmap (agreed 2026-10-13, one phase at a time)

1. ✅ Quick fixes — categories, pinch-zoom, smaller images, compact phone cards, department landing layout, favicon + WhatsApp preview, cleanup.
2. ✅ Shareable links — every screen has its own address (see §7), browser/phone Back works, "Share this piece" in the product window, "Copy link to this selection" + the link is added to the WhatsApp message, shared selections open with an "Add all" banner.
3. ✅ Group colours — one card per style (department + style code); small photo swatches switch the colour on the card and in the product window; a dot marks colours already in the selection. Count reads "159 pieces · 332 colours".
4. ✅ Photo experience — second photo on hover (computer, loaded only on first hover), swipeable gallery with dots (phone) / thumbnails (computer), zoom viewer at 2048px (computer: click + follows the mouse; phone: pan with a finger, pinch works).
5. ✅ Selection for the Client Advisor — no sizes/qty (Jasim's decision: keep it an open conversation). Note per piece (`ea_notes`), client details = name, mobile, message; "Send to your Client Advisor" (WhatsApp), "Save as PDF" (print stylesheet, `#printSheet`), "Copy link". Excel export dropped.
6. Store info (location, hours), Arabic (RTL), install as an app (PWA).
   - ✅ Boutique WhatsApp: `STORE.whatsapp` at the top of `js/app.js` (digits only, with 973) = 97317564991 (same as the store phone — **to be confirmed by Jasim**). Floating "Chat with us" + "Send your selection" pop-up (to the boutique / share with someone else). Empty = both hidden.
   - ✅ Store info: footer (address, live Open/Closed in Bahrain time, hours with today highlighted, directions, call, WhatsApp) + a short line on the landing page. All details live in `STORE` in `js/app.js`.
   - ✅ Arabic: all text in `js/i18n.js` (English on the left, Arabic on the right — edit there; missing entries stay English). Language button in the header + landing; first visit follows the phone language; choice saved (`ea_lang`). Right-to-left layout via `[dir="rtl"]` rules at the end of `style.css`; Arabic font IBM Plex Sans Arabic (Google Fonts, only loads for Arabic text). Search works with Arabic and English words. Links stay English (`#/men/shoes`) so they work in both languages.
   - ✅ Install as an app: `manifest.webmanifest` + `sw.js` (offline: newest version when online, saved copy offline; product photos cached on the phone, max 400). "Install the app" button appears in the footer on Android/Chrome; iPhone = Share → Add to Home Screen. Bump `VERSION` in `sw.js` to force every phone to drop old copies.

7. Visitor statistics (Google Analytics 4) — code ready, set `ANALYTICS_ID` at the top of `js/app.js` to switch on. Events: page_view, view_item, select_colour, add_to_wishlist / remove_from_selection, send_selection (whatsapp_boutique / whatsapp_other), save_pdf, share (copy_link / share_piece), search, contact (whatsapp_chat / call / directions), open_shared_selection, add_all_shared, language_change, install_app. Product info is always sent in English (item_id = style-fabric-colour). Debug: `window.EA_DEBUG=true` in the browser console prints every event.

Open: 269 products without photos; CDN hot-linking permission; custom domain.

## 5. Working notes

- Jasim works in VS Code on Windows and publishes via GitHub Pages.
- Keep it dependency-free (no build tooling) unless there is a strong reason.
- Update this file whenever structure or decisions change.

## 6. Decisions log

| Date | Decision |
|------|----------|
| 2026-09-21 | Project files shared; goal is to reorganize and make the site look professional. |
| 2026-10-13 | Agreed 6-phase upgrade plan (see §4). Phase 1 done. |
| 2026-10-13 | Phase 6 done: store info, boutique WhatsApp, Arabic (RTL), installable app with offline support. |
| 2026-10-13 | Phase 5: no sizes/quantities — the selection opens a conversation with the Client Advisor. Wording changed from "buyer" to "client". |
| 2026-10-13 | Claude now pushes directly to `main` (Jasim approved); Jasim should Pull in VS Code before editing locally. |
| 2026-10-13 | Phase 3: grouping key = display department + style code (fabric can differ inside a group — 72 styles come in two fabrics). Selection stays per colour. |
| 2026-10-13 | Phase 2: hash-based links (works on GitHub Pages without server setup). Product links use STYLE-FABRIC-COLOUR, not the row-based `id`, so they survive Excel updates. |
| 2026-09-21 | Restructured folders (`assets/`, `scripts/`), fixed bugs #1–#7, #10, #11; smoke-tested rendering, filtering, sort-by-name, modal and selection. |

## 7. Link format (Phase 2)

| Address | Shows |
|---|---|
| `#/` | Home (departments) |
| `#/men` | Category tiles for Men |
| `#/men/shoes` | Men's shoes |
| `#/men/ready-to-wear?type=5-pockets-pant` | One type inside a category |
| `#/women,men/glasses` | Several departments/categories (comma-separated) |
| `#/all/all` | Every product |
| `…?p=EM001739-AF14774-UC001` | Same page with that product open |
| `#/selection/KEY,KEY,…` | A selection someone shared (KEY = style-fabric-colour) |
