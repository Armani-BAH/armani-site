"""
build_products.py
Reads armani_styles.xlsx and writes data/products.json.
Images are read directly from the Excel columns (Image 1–4).
Run from anywhere inside the repo — paths resolve automatically.
"""

from pathlib import Path
import json
import re
import openpyxl

ROOT        = Path(__file__).resolve().parent.parent
EXCEL_FILE  = ROOT / "data" / "armani_styles.xlsx"
OUTPUT_FILE = ROOT / "data" / "products.json"


def clean(value):
    """Return a stripped string or empty string for None/NaN."""
    if value is None:
        return ""
    return str(value).strip()


def display_name(text):
    """'SUN GLASSES' -> 'Sun Glasses'"""
    words = " ".join(str(text).split()).split(" ")
    return " ".join(w[:1].upper() + w[1:].lower() for w in words)


def make_id(row_index, style, fabric, color):
    return f"{style}-{fabric}-{color}-{row_index}"


def main():
    print(f"Reading {EXCEL_FILE} ...")
    wb = openpyxl.load_workbook(EXCEL_FILE, read_only=True, data_only=True)
    ws = wb.active

    rows = list(ws.iter_rows(values_only=True))
    if not rows:
        print("ERROR: worksheet is empty.")
        return

    # Build header map from first row
    header = [clean(h).lower() for h in rows[0]]
    print("Columns found:", header)

    def col(name):
        """Return index of a column by lowercase name, or None."""
        try:
            return header.index(name.lower())
        except ValueError:
            return None

    # Locate columns
    c_gender   = col("gender")
    c_category = col("category")
    c_family   = col("family")
    c_sub      = col("sub-family")
    c_model    = col("model")
    c_fabric_n = col("fabric")
    c_color_n  = col("color")
    c_style    = col("style code")
    c_fabric_c = col("fabric code")
    c_color_c  = col("color code")

    # Image columns — there may be duplicates in the header (Image 1 appears twice)
    # Collect ALL positions that match "image 1", "image 2", "image 3", "image 4"
    image_cols = []
    seen_img = {}
    for i, h in enumerate(header):
        m = re.match(r"image\s*(\d+)", h)
        if m:
            num = int(m.group(1))
            if num not in seen_img:
                seen_img[num] = i
                image_cols.append(i)

    image_cols = sorted(image_cols)  # keep in order 1,2,3,4
    print(f"Image columns at positions: {image_cols}")

    products = []
    for row_idx, row in enumerate(rows[1:], start=2):
        def v(c):
            return clean(row[c]) if c is not None and c < len(row) else ""

        gender   = v(c_gender).upper()
        category = v(c_category).upper()
        family   = v(c_family)
        sub      = v(c_sub)
        style    = v(c_style)
        fabric   = v(c_fabric_c)
        color    = v(c_color_c)

        if not style and not gender:
            continue  # skip empty rows

        # Collect non-empty image URLs
        images = []
        for ic in image_cols:
            url = clean(row[ic]) if ic < len(row) else ""
            if url and url.lower().startswith("http"):
                images.append(url)

        products.append({
            "id":          make_id(row_idx, style, fabric, color),
            "gender":      gender,
            "category":    category,
            "family":      family,
            "sub":         sub,
            "name":        display_name(sub),
            "model":       v(c_model),
            "styleCode":   style,
            "fabricCode":  fabric,
            "colorCode":   color,
            "images":      images
        })

    print(f"Writing {len(products)} products to {OUTPUT_FILE} ...")
    with open(OUTPUT_FILE, "w", encoding="utf-8", newline="\n") as f:
        json.dump(products, f, ensure_ascii=False, indent=2)
        f.write("\n")

    with_images    = sum(1 for p in products if p["images"])
    without_images = sum(1 for p in products if not p["images"])
    print(f"Done. {with_images} with images, {without_images} without.")


if __name__ == "__main__":
    main()