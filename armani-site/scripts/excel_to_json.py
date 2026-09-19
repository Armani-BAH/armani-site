"""
Converts your Armani product Excel sheet into data/products.json,
which the website reads to build the catalog.

Usage:
    python3 scripts/excel_to_json.py path/to/your-sheet.xlsx

Expected Excel columns (exact header names, case-sensitive):
    Gender | Category | Product Description | Style Code | Fabric Code | Color Code | Image Link

Run this every time you update your product spreadsheet, then
refresh the website (or push to GitHub) to publish the changes.
"""

import sys
import json
from pathlib import Path
import pandas as pd

REQUIRED_COLUMNS = [
    "Gender", "Category", "Product Description",
    "Style Code", "Fabric Code", "Color Code", "Image Link",
]


def convert(excel_path: str, output_path: str = None, sheet_name=0):
    excel_path = Path(excel_path)
    if not excel_path.exists():
        sys.exit(f"File not found: {excel_path}")

    df = pd.read_excel(excel_path, sheet_name=sheet_name)

    missing = [c for c in REQUIRED_COLUMNS if c not in df.columns]
    if missing:
        sys.exit(
            "Your sheet is missing these expected columns: "
            f"{', '.join(missing)}\n"
            f"Found columns: {', '.join(df.columns)}"
        )

    # drop fully blank rows
    df = df.dropna(how="all")

    products = []
    skipped = 0
    for _, row in df.iterrows():
        style = str(row["Style Code"]).strip() if pd.notna(row["Style Code"]) else ""
        if not style:
            skipped += 1
            continue

        image_link = row["Image Link"]
        image_link = image_link.strip() if isinstance(image_link, str) else ""
        if image_link and not image_link.lower().startswith(("http://", "https://")):
            image_link = ""  # ignore anything that isn't a real public URL

        products.append({
            "id": style,
            "gender": str(row["Gender"]).strip() if pd.notna(row["Gender"]) else "",
            "category": str(row["Category"]).strip() if pd.notna(row["Category"]) else "",
            "description": str(row["Product Description"]).strip() if pd.notna(row["Product Description"]) else "",
            "style": style,
            "fabricCode": str(row["Fabric Code"]).strip() if pd.notna(row["Fabric Code"]) else "",
            "color": str(row["Color Code"]).strip() if pd.notna(row["Color Code"]) else "",
            "imageLink": image_link,
        })

    if output_path is None:
        output_path = Path(__file__).parent.parent / "data" / "products.json"

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(products, f, indent=2, ensure_ascii=False)

    print(f"Wrote {len(products)} products to {output_path}")
    if skipped:
        print(f"Skipped {skipped} row(s) with no Style Code.")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit("Usage: python3 scripts/excel_to_json.py path/to/your-sheet.xlsx")
    convert(sys.argv[1])
