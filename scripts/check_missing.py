import json
from pathlib import Path

DATA_FILE = Path(__file__).resolve().parent.parent / "data" / "products.json"

with open(
    DATA_FILE,
    "r",
    encoding="utf-8"
) as file:
    products = json.load(file)

missing = [
    product
    for product in products
    if not product["images"]
]

print()
print("========================================")
print("MISSING PRODUCTS")
print("========================================")
print(f"Missing: {len(missing)}")
print()

for product in missing:
    print(
        f"{product['styleCode']} | "
        f"{product['fabricCode']} | "
        f"{product['colorCode']} | "
        f"{product['category']} | "
        f"{product['sub']}"
    )

print()
print("========================================")