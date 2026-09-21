import requests

IMAGE_BASE = (
    "https://assets-cf.armani.com/image/upload/"
    "f_auto,q_auto:best,ar_4:5,w_1024,c_fill/"
)

style = "EB001535"
fabric = "AF25909"
color = "UB101"

suffixes = ["F", "D", "L", "B"]

headers = {
    "User-Agent": "Mozilla/5.0"
}

for suffix in suffixes:

    filename = f"{style}_{fabric}_{color}_{suffix}_FW2026.jpg"
    url = IMAGE_BASE + filename

    try:
        response = requests.get(
            url,
            headers=headers,
            timeout=15
        )

        content_type = response.headers.get("Content-Type", "")

        if response.status_code == 200 and "image" in content_type:
            print(f"✓ {suffix} image exists")
            print(f"  {url}")
        else:
            print(
                f"✗ {suffix} not confirmed "
                f"(Status: {response.status_code}, "
                f"Type: {content_type})"
            )

    except Exception as error:
        print(f"⚠ {suffix} error: {error}")