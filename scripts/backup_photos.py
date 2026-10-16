"""
backup_photos.py
Keeps our own copy of every product photo, in case a photo disappears
from Armani's (or another shop's) website.

Run by GitHub every week (.github/workflows/photo-backup.yml):
    python scripts/backup_photos.py data/products.json <photos folder>

- downloads every photo we don't have a copy of yet (max 1200 px wide, JPEG)
  into <photos folder>/img/
- checks that the original links still work
- writes <photos folder>/REPORT.md (also posted on GitHub as the weekly report)

The website switches to these copies by itself when an original link fails
(see copyName() in js/app.js — the file naming below must stay identical).
"""

import io
import json
import os
import re
import sys
import time
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.parse import urlparse, unquote, parse_qs
from urllib.request import Request, urlopen

from PIL import Image

MAX_WIDTH = 1200
QUALITY = 85
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36"


def copy_name(url):
    """Saved file name for a photo link. Must match copyName() in js/app.js."""
    u = urlparse(url)
    inner = parse_qs(u.query).get("url")          # e.g. shop.com/_next/image?url=<real photo link>
    if inner and inner[0].startswith("http"):
        return copy_name(inner[0])
    base = unquote(u.path.split("/")[-1] or "")
    base = re.sub(r"\.[A-Za-z0-9]{2,5}$", "", base)
    host = re.sub(r"^www\.", "", u.hostname or "")
    prefix = "" if (host == "armani.com" or host.endswith(".armani.com")) else host + "__"
    return re.sub(r"[^A-Za-z0-9._-]", "_", prefix + base) + ".jpg"


def download_url(url):
    """Ask Armani's image server for a JPEG at a sensible size; other shops as-is."""
    if "armani.com" in (urlparse(url).hostname or ""):
        url = url.replace("f_auto", "f_jpg").replace("q_auto:best", "q_auto:good")
        url = re.sub(r"w_\d+", f"w_{MAX_WIDTH}", url)
    return url


def fetch(url, limit=None):
    req = Request(url, headers={"User-Agent": UA, "Accept": "image/jpeg,image/*;q=0.9,*/*;q=0.5"})
    with urlopen(req, timeout=40) as r:
        return r.status, (r.read(limit) if limit else r.read())


def save_copy(url, dest):
    last = None
    for attempt in range(3):
        try:
            status, data = fetch(download_url(url))
            img = Image.open(io.BytesIO(data))
            img.load()
            if img.mode in ("RGBA", "LA", "P"):
                img = img.convert("RGBA")
                bg = Image.new("RGB", img.size, (255, 255, 255))
                bg.paste(img, mask=img.split()[-1])
                img = bg
            else:
                img = img.convert("RGB")
            if img.width > MAX_WIDTH:
                img = img.resize((MAX_WIDTH, round(img.height * MAX_WIDTH / img.width)), Image.LANCZOS)
            tmp = dest.with_suffix(".tmp")
            img.save(tmp, "JPEG", quality=QUALITY, optimize=True, progressive=True)
            tmp.replace(dest)
            return True, ""
        except Exception as e:  # noqa: BLE001
            last = str(e)[:120]
            time.sleep(2 * (attempt + 1))
    return False, last


def link_works(url):
    for attempt in range(2):
        try:
            status, _ = fetch(url, limit=512)
            return status < 400
        except Exception:  # noqa: BLE001
            time.sleep(2)
    return False


def main():
    products_file, out = Path(sys.argv[1]), Path(sys.argv[2])
    img_dir = out / "img"
    img_dir.mkdir(parents=True, exist_ok=True)
    products = json.load(open(products_file, encoding="utf-8"))

    # every photo link, with the product it belongs to
    links = {}
    for p in products:
        for url in p.get("images") or []:
            links.setdefault(url, f'{p.get("styleCode","")} {p.get("fabricCode","")} {p.get("colorCode","")}'.strip())

    names = {}
    clashes = []
    for url in links:
        n = copy_name(url)
        if n in names and names[n] != url:
            clashes.append((n, url))
        names.setdefault(n, url)

    have = {f.name for f in img_dir.glob("*.jpg")}
    todo = [u for u in links if copy_name(u) not in have]
    print(f"{len(links)} photo links, {len(links) - len(todo)} already saved, {len(todo)} to download")

    with ThreadPoolExecutor(12) as pool:
        results = list(pool.map(lambda u: (u, *save_copy(u, img_dir / copy_name(u))), todo))
    new_ok = [u for u, ok, _ in results if ok]
    failed = [(u, err) for u, ok, err in results if not ok]

    # check the originals of the photos we already had (the new ones just worked)
    to_check = [u for u in links if u not in set(todo)]
    with ThreadPoolExecutor(12) as pool:
        alive = dict(zip(to_check, pool.map(link_works, to_check)))
    broken = [u for u, ok in alive.items() if not ok]

    json.dump({copy_name(u): u for u in links}, open(out / "index.json", "w"), indent=0)

    saved = len({f.name for f in img_dir.glob("*.jpg")})
    size_mb = sum(f.stat().st_size for f in img_dir.glob("*.jpg")) / 1e6
    bh = datetime.now(timezone.utc) + timedelta(hours=3)
    lines = [
        f"# Photo backup report — {bh:%d %b %Y}",
        "",
        f"- **Photos on the website:** {len(links)}",
        f"- **Saved copies:** {saved} ({size_mb:,.0f} MB)",
        f"- **New copies saved this week:** {len(new_ok)}",
        f"- **Original links no longer working:** {len(broken)}"
        + (" — the website is showing our saved copy for these." if broken else ""),
        f"- **Could not be saved:** {len(failed)}"
        + (" — these photos have no copy yet; the job will try again next week." if failed else ""),
    ]
    if broken:
        lines += ["", "## Links no longer working (our copy is used)", "",
                  "| Product (style · fabric · colour) | Link |", "|---|---|"]
        lines += [f"| {links[u]} | {u} |" for u in broken]
    if failed:
        lines += ["", "## Could not be saved", "", "| Product | Link | Reason |", "|---|---|---|"]
        lines += [f"| {links[u]} | {u} | {e} |" for u, e in failed]
    if clashes:
        lines += ["", "## Name clashes (technical)", ""] + [f"- {n}: {u}" for n, u in clashes]
    report = "\n".join(lines) + "\n"
    (out / "REPORT.md").write_text(report, encoding="utf-8")
    if os.environ.get("GITHUB_STEP_SUMMARY"):
        open(os.environ["GITHUB_STEP_SUMMARY"], "a", encoding="utf-8").write(report)
    print(report)


if __name__ == "__main__":
    main()
