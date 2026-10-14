"""
build_perfumes.py
Reads data/perfume_notes.xlsx (the team's perfume sheet) and writes data/perfumes.json,
which the website uses for fragrance names, notes and descriptions.
Columns: Department | Type | Style code | Size | Photo | Fragrance name | Top notes | Heart notes |
         Base notes | Short description | Details (size / ingredients)
"""
from pathlib import Path
import json, re
import openpyxl

ROOT = Path(__file__).resolve().parent.parent
SRC, OUT = ROOT / "data" / "perfume_notes.xlsx", ROOT / "data" / "perfumes.json"

def clean(v):
    return re.sub(r"\s+", " ", re.sub(r"<br\s*/?>", " ", str(v or ""))).strip()

def notes(v):
    return [n.strip() for n in clean(v).split(",") if n.strip()]

def main():
    ws = openpyxl.load_workbook(SRC, data_only=True).active
    out = {}
    for row in ws.iter_rows(min_row=4, values_only=True):
        style = clean(row[2]) if len(row) > 2 else ""
        if not style or style.startswith("LXXX") or style.lower() == "style code":
            continue
        details = str(row[10] or "") if len(row) > 10 else ""
        m = re.search(r"Ingredients:\s*(.*)", details, re.S | re.I)
        out[style] = {
            "name": clean(row[5]),
            "top": notes(row[6]), "heart": notes(row[7]), "base": notes(row[8]),
            "description": clean(row[9]),
            "ingredients": clean(m.group(1)) if m else "",
        }
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(out)} perfumes to {OUT}")

if __name__ == "__main__":
    main()
