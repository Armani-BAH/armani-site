# Emporio Armani Bahrain — Product Selection Site

Static catalogue website for Emporio Armani (Bahrain – Marassi Mall). Clients browse the FW26 collection, add pieces to "My selection", and send it to their Client Advisor on WhatsApp (or save it as a PDF) to start a conversation. No prices, sizes or quantities — on purpose.

- **Repo:** https://github.com/Armani-BAH/armani-site
- **Live (GitHub Pages):** https://armani-bah.github.io/armani-site/
- **Domain:** https://www.eawishlist.com (Namecheap, bought 2026-10-14; `CNAME` file in the repo). The old github.io address forwards automatically.
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
├── js/advisors-data.js         The ONE list of Client Advisors (catalogue personal links + /advisors/ page) — see §7e
├── js/advisor.js               Personal advisor links (?a=<id>): WhatsApp goes to that advisor — see §7e
├── data/
│   ├── armani_styles.xlsx      Source of truth (item list from Excel)
│   └── products.json           Generated catalogue used by the site (1,276 items)
└── scripts/
    ├── build_products.py       Excel -> products.json (+ image lookup on Armani CDN)
    ├── check_missing.py        Lists products with no image
    ├── export_missing.py       Writes products with no image to data/missing_images.xlsx (git-ignored)
    ├── test_images.py          Tests image URL patterns for one style
    └── make_advisor_links.py   Personal links: <id>/index.html forwarding pages + 404.html (committed) and QR codes -> advisor-qr/ (git-ignored)
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

7. Visitor statistics (Google Analytics 4) — code ready, ON — `ANALYTICS_ID = "G-1098C6F5SS"` at the top of `js/app.js`. Events: page_view, view_item, select_colour, add_to_wishlist / remove_from_selection, send_selection (whatsapp_boutique / whatsapp_other), save_pdf, share (copy_link / share_piece), search, contact (whatsapp_chat / call / directions), open_shared_selection, add_all_shared, language_change, install_app, advisor_link_open (see §7e). Product info is always sent in English (item_id = style-fabric-colour). Debug: `window.EA_DEBUG=true` in the browser console prints every event.

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
| 2026-10-28 | Greeting messages name the advisor (first name only): "Hello Mohammed, …" in the selection message, the chat button and the /advisors/ page; boutique greeting unchanged. |
| 2026-10-28 | Removed "Share with someone else" (pop-up now: advisor list + "No preference — send to the boutique"); personal title/description + extra image tags on the forwarding pages (no meta refresh). |
| 2026-10-28 | Advisor clients send in one tap ("Send to Mohammed"); other visitors choose their Client Advisor in the pop-up (+ "No preference — boutique"); address bar cleaned after an advisor link; shared links `eawishlist.com/<id>#/…`. |
| 2026-10-28 | Personal advisor links (§7e): `?a=<id>`, saved 30 days, replaced by another advisor's link, cleared by the shop QR; shared links keep the advisor; one shared advisors list for the catalogue and `/advisors/`; campaign name `personal-link`; clean client link `eawishlist.com/<id>` (forwarding page per advisor + `404.html` for capital letters); QR images go to `advisor-qr/` (not committed). |
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
| `…?p=EM001739-UC001` | Same page with that product open |
| `#/selection/EB001440-M9136,LF704500-100ML` | A selection someone shared — STYLE-COLOUR, or STYLE-FABRIC-COLOUR where two pieces share style+colour (`buildRefs()` in `js/app.js`) |
| `#/selection/1042` | A numbered selection saved in Firebase (Firebase project `eawishlist`, config at the top of `js/app.js`) |
| `#/s/code.code` and full STYLE-FABRIC-COLOUR links | Older forms — still open |

**Numbered selections (Firebase Firestore):** project rules in `firebase/firestore.rules` (paste into Firestore → Rules). Documents: `counters/selections {next}` and `selections/{number} {items[], lang, created}`; numbers start at 1001; only new selections can be written, nothing can be changed or deleted. Saving uses the Firestore REST API (no extra library) and falls back to the long code link if Firebase is unreachable within 6 s. The same selection re-uses its number on that phone (`ea_selnums`).

## 7b. Shopping improvements (2026-10-14)

- Phone: one slim sticky top bar (logo · search icon · language · selection), no breadcrumb/title, compact tabs → products start ~⅓ down the screen.
- Cards: photo, name, department/category, colour dots only (codes in product window, WhatsApp, PDF; search still finds codes).
- "New season" label = photo season `NEW_SEASON` ("FW2026", top of `js/app.js`); default sort puts new season first.
- Pieces without photos hidden by default ("N pieces without a photo yet — Show them" at the end); always shown when searching, in a shared link or "Selected only".
- Product window: "You may also like" (same department + type, then category; one per style; with photos).
- "Recently viewed" strip under the grid (`ea_recent`, last 12, this phone only).
- More products load automatically when scrolling ("Show more" stays as a fallback).

## 7c. Perfumes (2026-10-14)

- `data/perfume_notes.xlsx` = the team's perfume sheet (fragrance name, top/heart/base notes, description, details/ingredients). Names/notes in blue were filled by Claude from the team's descriptions — to be checked.
- `python scripts/build_perfumes.py` → `data/perfumes.json` (keyed by style code). The site shows the fragrance name instead of "Eau de parfum", "Eau de parfum · 100 ml", three key notes on the card; Top/Heart/Base, description (Read more) and ingredients in the product window. Notes are translated in `AR_NOTES` (`js/i18n.js`). Search finds notes.
- LG152100 and LD801400 are both Stronger With You Amber (two codes for the same fragrance, confirmed by Jasim).

## 7d. Client Advisors page — www.eawishlist.com/advisors (2026-10-14)

- `advisors/index.html` (self-contained). Advisors list (name, Arabic name, WhatsApp, store management) is the shared `js/advisors-data.js` (`var ADVISORS = window.EA_ADVISORS`) — edit the list THERE (§7e); opening message in `MESSAGE` (EN/AR).
- The opening message uses `{name}` = the advisor's first name (see §7e, Greeting messages).
- Its `contact` / `whatsapp_advisor` event sends `advisor` = the advisor's full name, while personal links send `advisor` = the id (e.g. `mohammed`). Filter on the event name when reporting.
- Same look, logo, fonts and language setting (`ea_lang`) as the catalogue; Google Analytics event `contact` / `whatsapp_advisor` with the advisor's name.

## 7e. Personal advisor links (2026-10-28)

Each Client Advisor has a personal link + QR code. A client who opens it sends their selection / chat to **that advisor's** WhatsApp instead of the boutique number. Everyone else (Google, shop QR) still gets the boutique number — no change for them.

**What the client gets — a clean link:** `https://www.eawishlist.com/mohammed` (also on the advisor's QR code). `/mohammed/index.html` is a tiny forwarding page (same idea as `/qr/`) that sends the visitor to the tracked link (query string BEFORE the `#`, otherwise the hash routes break):
`https://www.eawishlist.com/?a=mohammed&utm_source=advisor&utm_medium=whatsapp&utm_campaign=personal-link&utm_content=mohammed#/`
The forwarding pages carry the WhatsApp/social preview tags: the site picture (`assets/og-image.jpg`, 1200×630, 110 KB) plus a personal title/description ("Emporio Armani FW26 — Mohammed Ghuloom" / "…send your favourite pieces to Mohammed on WhatsApp"). They have no `meta refresh` (crawlers stay on the page and read its tags; browsers are forwarded by JavaScript). **Known cause of a missing preview picture:** the preview is built by the SENDER's phone/computer — on the Armani network (Zscaler web filter, checked 2026-10-28) eawishlist.com is blocked (403 "Internet Security by Zscaler" page), so no picture; send links from mobile data / a personal phone, or ask IT to allow eawishlist.com. WhatsApp also caches a failed preview for each link for a while. `404.html` forwards `/Mohammed`, `/MOHAMMED` (GitHub Pages is case-sensitive) and shows "Page not found" for any other unknown address. The pages are generated — never edit by hand; an advisor id must be lowercase letters/numbers and must not clash with a site folder (`advisors`, `qr`, `contact`, `print`, `assets`, `css`, `data`, `js`, …; the script refuses).

- **List:** `js/advisors-data.js` → `window.EA_ADVISORS` (`id`, `name`, `nameAr`, `whatsapp`; managers also `role`, `roleAr`, `group`). Every key in quotes, no trailing comma (the Python script reads it). To add/remove an advisor: edit this file, bump `?v=` of `advisors-data.js` in `index.html`, run `scripts/make_advisor_links.py`.
- **Security:** an advisor is accepted only if the id exists in the list; a phone number is never read from the URL; unknown `?a=` values are ignored (boutique number). Advisor numbers are public in the site code — each advisor agreed.
- **How it works** (`js/advisor.js`, loaded after `app.js`): sets `STORE.whatsapp` to the advisor's number, rewrites the `#chatFab` link, refreshes the footer WhatsApp link, sets `window.EA_ADVISOR`, and cleans the address bar to `www.eawishlist.com/#/` (`history.replaceState`; the original link is kept in `window.EA_LANDING` and sent with the first `page_view` + `advisor_link_open`, so Google Analytics still sees the campaign tags).
- **Sending (advisor client):** the drawer button reads **"Send to Mohammed"** (first name; Arabic "أرسل إلى محمد") and opens WhatsApp to him in **one tap**. Phones only allow WhatsApp to open during the tap, so the selection link is prepared while the drawer is open (`prepareAdvisorLink()` in `app.js`; numbered selections are therefore created when an advisor client opens the drawer). If the link isn't ready yet, the usual pop-up appears and waits ("Send to Mohammed Ghuloom" / Cancel).
- **Sending (Google / shop QR / no advisor):** the pop-up is **"Choose your Client Advisor"** — the 4 advisors, then Store management (2), from `js/advisors-data.js` — plus the full-width button "No preference — send to the boutique". There is **no "Share with someone else" any more** (clients share with "Copy link" in the drawer). The choice is NOT remembered (chat button stays the boutique). GA: `send_selection` method `whatsapp_advisor` + `advisor=<id>`.
- **Memory:** `localStorage` key `ea_advisor` = `{id, t}`, kept **30 days** on that phone. Opening another advisor's link replaces it. A printed shop QR code (`utm_medium=qr`, or the first counter card `utm_source=qr&utm_medium=store`) **clears** it, so a client who scans the shop QR gets the boutique number. No reprint needed.
- **Shared links:** for an advisor client `SITE_URL()` in `app.js` is `eawishlist.com/<id>`, so "Copy link", product links, the PDF and "Share with someone else" look like `eawishlist.com/mohammed#/selection/1042`; the forwarding page keeps the `#/…` part, so a friend reaches the same advisor. The message sent TO the advisor uses the plain `eawishlist.com/#/selection/1042`.
- **Analytics:** `track()` in `app.js` adds `advisor=<id>` to every event once an advisor is active; `advisor_link_open` is sent once per link open per browser tab-session (reloads / language switch are not counted again). GA4 setup (done by the owner): Admin → Data display → Custom definitions → Create custom dimension → name `Advisor`, scope `Event`, event parameter `advisor`; mark `send_selection` as a key event. Report in Explore: dimension `Advisor`, metric `Event count`, filter event name = `send_selection`. Normally even the first `page_view` carries `advisor`, but on a slow connection it can be sent before `advisor.js` has run; it then has no `advisor` parameter (its `page_location` still contains `?a=` and the UTM tags). For per-advisor numbers use `advisor_link_open` and `send_selection`.
- **Greeting messages (what is pre-typed when WhatsApp opens):** when the message goes to a specific advisor it starts with **"Hello <first name>, …"** (Arabic first name in Arabic: "مرحباً محمد، …"); the boutique and anyone without an advisor get the original "Hello, …". Three places, all editable: (1) selection message — keys `"Hello {name}, I'm interested in these pieces…"` / `"Hello, I'm interested in these pieces…"` in `js/i18n.js` (English left, Arabic right) used by `selectionText()` in `js/app.js`; (2) "Chat with us" button — `"Hello {name}, I have a question about…"` (`js/advisor.js` sets it for advisor clients; the original is in `js/app.js`); (3) `/advisors/` page — `MESSAGE` (EN/AR, `{name}` = first name) at the bottom of `advisors/index.html`, the same sentence as the chat button. Changing the wording = edit those texts (keep `{name}`), bump the `?v=` numbers in `index.html` and `VERSION` in `sw.js`.
- **Staff page:** `/advisors/links.html` (not linked anywhere, `noindex`) — each advisor taps "Copy link" and gets their clean link.
- **Generate (links, QR codes, forwarding pages):** `pip install "qrcode[pil]"` then `python scripts/make_advisor_links.py` → `advisor-qr/<id>.png` + `advisor-qr/links.csv` (git-ignored; `/qr/` is the shop QR page, so a different folder) AND the forwarding pages `<id>/index.html` + `404.html` (**commit and push these** — they are what makes the clean link work). The QR code holds the clean link. After adding/removing an advisor, run it again. Change `CAMPAIGN` in the script if the campaign name changes (the script rewrites the pages).
- **Footer / home-page "WhatsApp" link** also goes to the advisor while one is active ("Call" stays the boutique).

## 8. Custom domain — DONE: www.eawishlist.com (DNS checked 2026-10-14)

1. Check the name with the brand (no "armani" in a self-owned domain without written approval).
2. Buy on Namecheap (1 year, auto-renew, free Domain Privacy, no extras).
3. Advanced DNS: delete the default parking records, then add
   - A `@` → 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153
   - CNAME `www` → armani-bah.github.io
4. Claude: add a `CNAME` file with the domain, update `og:url` / `og:image` in `index.html`, Google Analytics stream URL.
5. GitHub → Settings → Pages → Custom domain → Save → (after the DNS check) Enforce HTTPS.
