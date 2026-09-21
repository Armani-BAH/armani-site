# Emporio Armani Bahrain — Product Selection Site

Static catalogue website for Emporio Armani (Bahrain – Marassi Mall). Buyers browse the FW26 item list, filter it, add pieces to "My Selection", and share the list via WhatsApp.

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
├── PROJECT.md                  This file
├── .gitignore / .gitattributes
├── assets/
│   ├── logo/emporio-armani-logo.png
│   └── images/products/        Local product images (currently 1, unused)
├── css/style.css               All styling
├── js/app.js                   All logic (~19 KB)
├── data/
│   ├── armani_styles.xlsx      Source of truth (item list from Excel)
│   └── products.json           Generated catalogue used by the site (1,880 items)
└── scripts/
    ├── build_products.py       Excel -> products.json (+ image lookup on Armani CDN)
    ├── check_missing.py        Lists products with no image
    └── test_images.py          Tests image URL patterns for one style
```

## 2. How it works

1. `scripts/build_products.py` reads `data/armani_styles.xlsx` (columns: Gender, Category, Family, Sub-Family, Style Code, Fabric Code, Color Code).
2. For each row it probes the Armani image CDN (`assets-cf.armani.com`) for `F`, `D`, `L` views, newest season first (FW2026 → SS2023), and records the first season that has images.
3. Output is `data/products.json` (each product has `id, gender, category, family, sub, name, styleCode, fabricCode, colorCode, productKey, season, images[]`). `name` is the Sub-Family in Title Case.
4. `js/app.js` loads the JSON and renders the gender nav, category sidebar, filter chips, grid (60 per page + "Load more"), product modal with gallery, and the selection drawer.
5. Selection and buyer details persist in `localStorage` (`ea_selection`, `ea_buyer`). Sharing opens `wa.me` with a text summary.
6. The build script writes a resume checkpoint `data/products_progress.json` (git-ignored). Delete it to re-crawl everything.

**Catalogue snapshot:** 1,880 products — 1,685 with images, 195 without. Genders: MAN 952, WOMAN 385, BOY 319, GIRL 177, UNISEX JUNIOR 41, UNISEX 6. Categories: Ready to Wear 1,220, Leather Goods 280, Shoes 117, Glasses 95, Soft Accessories 94, Underwear 41, Perfume 27, Swimwear 3, Bijoux 3.

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

## 4. Next steps

1. Visual polish: typography, spacing, header, product cards (use `name`), footer, mobile layout, favicon/meta tags.
2. Performance: image sizing (currently `w_1536` for grid thumbnails), smaller data payload.
3. Data: decide what to do with the 195 products without images.
4. README, push to GitHub, custom domain.

## 5. Working notes

- Jasim works in VS Code on Windows and publishes via GitHub Pages.
- Keep it dependency-free (no build tooling) unless there is a strong reason.
- Update this file whenever structure or decisions change.

## 6. Decisions log

| Date | Decision |
|------|----------|
| 2026-09-21 | Project files shared; goal is to reorganize and make the site look professional. |
| 2026-09-21 | Restructured folders (`assets/`, `scripts/`), fixed bugs #1–#7, #10, #11; smoke-tested rendering, filtering, sort-by-name, modal and selection. |
