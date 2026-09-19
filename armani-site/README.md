# Armani Wishlist Website

A static, no-backend website: customers browse the catalog, save pieces to
a wishlist, and send it to your WhatsApp number to check price and size.

## Project structure

```
armani-site/
├── index.html              the page itself
├── css/
│   └── style.css           all styling
├── js/
│   └── app.js               all behavior (filters, wishlist, WhatsApp link, reading the Excel file)
├── data/
│   └── catalog.xlsx         your product catalog — the site reads this directly
├── images/                  optional — put local product photos here if not hosting elsewhere
└── scripts/
    └── excel_to_json.py     no longer needed — kept only in case you ever want it back
```

## 1. Open it in VS Code

1. Install [VS Code](https://code.visualstudio.com/) if you don't have it.
2. Install the **Live Server** extension (search it in the Extensions panel, `Ctrl+Shift+X`).
3. Open this whole `armani-site` folder in VS Code (`File → Open Folder`).
4. Right-click `index.html` → **Open with Live Server**.

Your browser opens the site at `http://127.0.0.1:5500` (or similar) with live reload.

> **Important:** don't just double-click `index.html` to open it in a browser —
> the site loads `data/catalog.xlsx` over the network, which most browsers
> block on `file://` pages. Live Server (or any local server) avoids that.

## 2. Set your WhatsApp number

Open `js/app.js` and edit this line near the top:

```js
const ADVISOR_WHATSAPP_NUMBER = "97300000000"; // country code + number, no + or spaces
```

## 3. Update your product catalog — no conversion step

The site reads your Excel file **directly in the browser** (via a small
library called SheetJS, loaded in `index.html`). There is no Python script
to run anymore.

To update your products:
1. Edit your Excel sheet.
2. Save it as `data/catalog.xlsx` (same file name, replacing the old one).
3. Refresh the browser tab (Live Server does this automatically on save).

Your sheet needs these exact column headers, in any order:

| Gender | Category | Product Description | Style Code | Fabric Code | Color Code | Image Link |
|---|---|---|---|---|---|---|

**Image Link** must be a direct public URL to the photo (ending in
`.jpg`/`.png`/`.webp`, or a public link from wherever you host images —
Google Drive "anyone with the link" sharing works if you use the direct
image URL format, not the folder view link). Rows with no image link, or
a broken one, fall back to a simple line icon so the layout never breaks.

## 4. Publish it

Push this folder to a GitHub repository and turn on GitHub Pages (or Azure
Static Web Apps / Netlify) — see the hosting steps discussed earlier in
this conversation. Whenever you update `data/catalog.xlsx`, commit and push;
the live site updates automatically, still with no conversion step.

## Notes

- The wishlist is stored in each visitor's own browser (`localStorage`) —
  it isn't shared between customers and isn't visible to you until they
  send it via WhatsApp.
- No backend, database, Python, or hosting cost is required for the core site.
- `scripts/excel_to_json.py` is left in the project but unused — safe to
  delete, or keep as a reference if you ever want a JSON-based version again.
