import pandas as pd
import json
import requests
import time
from pathlib import Path

# Paths are resolved from the repo root, so the script works from any folder.
ROOT = Path(__file__).resolve().parent.parent
EXCEL_FILE = ROOT / "data" / "armani_styles.xlsx"
OUTPUT_FILE = ROOT / "data" / "products.json"
# Resume checkpoint (git-ignored). Delete it to re-crawl everything from scratch.
PROGRESS_FILE = ROOT / "data" / "products_progress.json"

IMAGE_BASE = (
    "https://assets-cf.armani.com/image/upload/"
    "f_auto,q_auto:best,ar_4:5,w_1536,c_fill/"
)

# Search newest seasons first
SEASONS = [
    "FW2026",
    "FW2025",
    "SS2026",
    "SS2025",
    "FW2024",
    "SS2024",
    "FW2023",
    "SS2023",
]

# Images to look for
IMAGE_SUFFIXES = ["F", "D", "L"]

HEADERS = {
    "User-Agent": "Mozilla/5.0"
}

SAVE_EVERY = 25


print("Reading Excel file...")

df = pd.read_excel(EXCEL_FILE)

df.columns = [str(column).strip() for column in df.columns]

print(f"Found {len(df)} rows.")


def check_image(url):

    try:

        response = requests.get(
            url,
            headers=HEADERS,
            timeout=5
        )

        content_type = response.headers.get(
            "Content-Type",
            ""
        )

        if (
            response.status_code == 200
            and "image" in content_type
        ):
            return True

        return False

    except requests.RequestException:

        return False


def display_name(text):
    """'SUN GLASSES' -> 'Sun Glasses' (same rule the site used before)."""
    words = " ".join(str(text).split()).split(" ")
    return " ".join(w[:1].upper() + w[1:].lower() for w in words)


def save_progress(products):

    with open(
        PROGRESS_FILE,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            products,
            file,
            ensure_ascii=False,
            indent=2
        )


# --------------------------------------------------
# Load previous progress if available
# --------------------------------------------------

if PROGRESS_FILE.exists():

    print()
    print("Previous progress found.")

    with open(
        PROGRESS_FILE,
        "r",
        encoding="utf-8"
    ) as file:

        products = json.load(file)

    processed_ids = {
        product["id"]
        for product in products
    }

    print(
        f"Already processed: "
        f"{len(products)} products"
    )

else:

    products = []
    processed_ids = set()


print()
print("========================================")
print("ARMANI IMAGE SEARCH")
print("========================================")
print()


total_rows = len(df)

for index, row in df.iterrows():

    product_id = f"p{index}"

    # Skip products already processed
    if product_id in processed_ids:
        continue

    style = str(
        row["Style Code"]
    ).strip()

    fabric = str(
        row["Fabric Code"]
    ).strip()

    color = str(
        row["Color Code"]
    ).strip()

    # Skip incomplete rows
    if (
        style in ("", "nan")
        or fabric in ("", "nan")
        or color in ("", "nan")
    ):
        continue

    product_key = (
        f"{style}-{fabric}-{color}"
    )

    images = []
    found_season = None

    # ----------------------------------------------
    # Search seasons
    # ----------------------------------------------

    for season in SEASONS:

        season_images = []

        for suffix in IMAGE_SUFFIXES:

            filename = (
                f"{style}_{fabric}_{color}_"
                f"{suffix}_{season}.jpg"
            )

            image_url = (
                IMAGE_BASE + filename
            )

            if check_image(image_url):

                season_images.append(
                    image_url
                )

            time.sleep(0.02)

        # Stop at first season where
        # at least one image exists
        if season_images:

            images = season_images
            found_season = season

            break

    product = {

        "id": product_id,

        "gender": str(
            row["Gender"]
        ).strip(),

        "category": str(
            row["Category"]
        ).strip(),

        "family": str(
            row["Family"]
        ).strip(),

        "sub": str(
            row["Sub-Family"]
        ).strip(),

        "name": display_name(
            row["Sub-Family"]
        ),

        "styleCode": style,

        "fabricCode": fabric,

        "colorCode": color,

        "productKey": product_key,

        "season": found_season,

        "images": images
    }

    products.append(product)

    processed_ids.add(product_id)

    # ----------------------------------------------
    # Progress display
    # ----------------------------------------------

    print(
        f"{index + 1:4} / {total_rows}  |  "
        f"{style} | {fabric} | {color}  |  "
        f"{found_season or 'NO IMAGE'}  |  "
        f"{len(images)} image(s)"
    )

    # ----------------------------------------------
    # Save progress every 25 products
    # ----------------------------------------------

    if len(products) % SAVE_EVERY == 0:

        save_progress(products)

        print()
        print(
            f"Progress saved: "
            f"{len(products)} products"
        )
        print()


# --------------------------------------------------
# Final save
# --------------------------------------------------

save_progress(products)

with open(
    OUTPUT_FILE,
    "w",
    encoding="utf-8"
) as file:

    json.dump(
        products,
        file,
        ensure_ascii=False,
        indent=2
    )


print()
print("========================================")
print("SEARCH COMPLETE")
print("========================================")

print(
    f"Products processed: {len(products)}"
)

print(
    f"Final file: {OUTPUT_FILE}"
)

print("========================================")