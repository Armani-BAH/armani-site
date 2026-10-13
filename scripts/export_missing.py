"""
export_missing.py
Writes every product that has no photo to data/missing_images.xlsx
(handy to send to the team). Run from anywhere inside the repo.
"""

from pathlib import Path
import json
import openpyxl

ROOT = Path(__file__).resolve().parent.parent
DATA_FILE = ROOT / "data" / "products.json"
OUT_FILE = ROOT / "data" / "missing_images.xlsx"

products = json.load(open(DATA_FILE, encoding="utf-8"))
missing = [x for x in products if not x.get("images")]

wb = openpyxl.Workbook()
ws = wb.active
ws.title = "Missing Images"
ws.append(["Gender", "Category", "Family", "Sub-Family", "Style Code", "Fabric Code", "Color Code"])

for x in missing:
    ws.append([
        x.get("gender", ""),
        x.get("category", ""),
        x.get("family", ""),
        x.get("sub", ""),
        x.get("styleCode", ""),
        x.get("fabricCode", ""),
        x.get("colorCode", ""),
    ])

wb.save(OUT_FILE)
print(f"Done. {len(missing)} rows written to {OUT_FILE}")
