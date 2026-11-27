"""
build_prices.py
Reads data/prices.xlsx and writes data/prices.json (retail prices in BHD).

Matching rule — on purpose, very strict:
  A price belongs to ONE exact style + fabric + colour.
  The same style in another fabric (or even another colour) can have a different
  price, so there is NO fallback to "same style". No exact match = no price shown.

Rows that are skipped:
  - "Grand Total" / empty rows
  - price 0 or blank (hidden until a real price is known)

Also prints a check report:
  - price rows that match no product on the site
  - site products that have no price
  - matches where the department in the price file differs from the site

Run from anywhere inside the repo:  python scripts/build_prices.py
"""

from pathlib import Path
import json
import openpyxl

ROOT          = Path(__file__).resolve().parent.parent
PRICE_FILE    = ROOT / "data" / "prices.xlsx"
PRODUCTS_FILE = ROOT / "data" / "products.json"
OUTPUT_FILE   = ROOT / "data" / "prices.json"

# column headers in prices.xlsx
COL_SECTOR, COL_STYLE, COL_FABRIC, COL_COLOR, COL_PRICE = (
    "Sector/Gender2", "Style", "Fabric", "Color", "Retail Price (Correct)")


def clean(v):
    return "" if v is None else str(v).strip()


def key(style, fabric, color):
    # same format as pKey() in js/app.js
    return f"{style}-{fabric}-{color}"


def main():
    wb = openpyxl.load_workbook(PRICE_FILE, read_only=True, data_only=True)
    rows = list(wb.active.iter_rows(values_only=True))
    head = [clean(h) for h in rows[0]]
    col = {h: i for i, h in enumerate(head)}
    for h in (COL_SECTOR, COL_STYLE, COL_FABRIC, COL_COLOR, COL_PRICE):
        if h not in col:
            raise SystemExit(f"ERROR: column '{h}' not found in {PRICE_FILE.name}")

    products = json.loads(PRODUCTS_FILE.read_text(encoding="utf-8"))
    site = {}
    for p in products:
        site.setdefault(key(p["styleCode"], p["fabricCode"], p["colorCode"]), []).append(p)

    prices, sector_of, skipped_zero, unmatched, clash = {}, {}, [], [], []
    for r in rows[1:]:
        sector = clean(r[col[COL_SECTOR]])
        style, fabric, color = (clean(r[col[c]]) for c in (COL_STYLE, COL_FABRIC, COL_COLOR))
        price = r[col[COL_PRICE]]
        if not sector or sector.upper() == "GRAND TOTAL" or not style:
            continue
        k = key(style, fabric, color)
        if not isinstance(price, (int, float)) or price <= 0:
            skipped_zero.append(k)
            continue
        if k in prices and prices[k] != price:
            clash.append((k, prices[k], price))
            continue
        if k not in site:
            unmatched.append((sector, k, price))
            continue
        prices[k] = int(price) if float(price).is_integer() else round(float(price), 3)
        sector_of[k] = sector

    # the same code listed twice with two different prices: show neither
    for k, *_ in clash:
        prices.pop(k, None)

    dept_diff = [(k, sector_of[k], p["gender"]) for k in prices for p in site[k]
                 if sector_of[k].upper() != p["gender"].upper()]
    no_price = [k for k in site if k not in prices]

    OUTPUT_FILE.write_text(
        json.dumps(dict(sorted(prices.items())), ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8")

    print(f"Wrote {OUTPUT_FILE.name}: {len(prices)} priced pieces "
          f"({sum(len(site[k]) for k in prices)} of {len(products)} site products)")
    print(f"  price 0 / blank, hidden:          {len(skipped_zero)}")
    print(f"  price rows not on the site:        {len(unmatched)}")
    print(f"  site products without a price:     {len(no_price)}")
    print(f"  same code with two prices (hidden):{len(clash)}")
    for c in clash:
        print("     ", *c)
    print(f"  department differs file vs site:   {len(dept_diff)}")
    for d in dept_diff:
        print("     ", *d)


if __name__ == "__main__":
    main()
