"""Generate the GingerBros favicons: white "GB" monogram on an orange square.

Run from the repo root:  python3 scripts/generate-favicon.py
Outputs every icon referenced by index.html and site.webmanifest into public/.
"""

import os
from PIL import Image, ImageDraw, ImageFont

# Config
ORANGE = (212, 119, 33)  # #D47721 warm brand orange
TEXT = "GB"
TEXT_COLOR = (255, 255, 255, 255)  # white
FONT_PATH = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public")


def _best_font_size(draw: ImageDraw.ImageDraw, size: int, padding: float) -> ImageFont.FreeTypeFont:
    """Find the largest font size that fits TEXT within the padded canvas."""
    target = size * (1 - 2 * padding)
    font_size = max(8, int(size * 0.6))
    font = ImageFont.truetype(FONT_PATH, font_size)
    # Grow/shrink so the wider of width/height matches the target box.
    while font_size > 6:
        bbox = draw.textbbox((0, 0), TEXT, font=font)
        w, h = bbox[2] - bbox[0], bbox[3] - bbox[1]
        if max(w, h) <= target:
            break
        font_size -= 1
        font = ImageFont.truetype(FONT_PATH, font_size)
    return font


def create_favicon(size: int, padding: float = 0.14) -> Image.Image:
    canvas = Image.new("RGBA", (size, size), ORANGE + (255,))
    draw = ImageDraw.Draw(canvas)
    font = _best_font_size(draw, size, padding)

    # Center using the text's actual bounding box (accounts for bearings).
    bbox = draw.textbbox((0, 0), TEXT, font=font)
    w, h = bbox[2] - bbox[0], bbox[3] - bbox[1]
    x = (size - w) / 2 - bbox[0]
    y = (size - h) / 2 - bbox[1]
    draw.text((x, y), TEXT, font=font, fill=TEXT_COLOR)
    return canvas


def main():
    out_dir = os.path.abspath(OUT_DIR)

    sizes = {
        "favicon-16x16.png": 16,
        "favicon-32x32.png": 32,
        "apple-touch-icon.png": 180,
        "icon-192.png": 192,
        "icon-512.png": 512,
    }

    for filename, size in sizes.items():
        # Tighter padding at tiny sizes keeps "GB" legible.
        pad = 0.1 if size <= 32 else 0.16
        out = create_favicon(size, padding=pad)
        out.save(os.path.join(out_dir, filename), "PNG")
        print(f"Generated {filename}")

    # Multi-size favicon.ico from a crisp 64px render.
    ico = create_favicon(64, padding=0.12)
    ico.save(
        os.path.join(out_dir, "favicon.ico"),
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48), (64, 64)],
    )
    print("Generated favicon.ico")


if __name__ == "__main__":
    main()
