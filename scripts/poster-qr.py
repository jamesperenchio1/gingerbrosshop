#!/usr/bin/env python3
"""Stamp a unique, trackable QR code on each page of the GingerBros poster PDF.

Each code points at https://gingerbrosshop.com/q/<slug>, which counts the scan and
redirects with ?src=qr-<slug> (see api/_lib/handlers/links.ts). Register the same
slugs on the live site with scripts/seed-poster-qr.mjs.

Usage (needs `pip install pymupdf segno`):
  python3 scripts/poster-qr.py <in.pdf> <out.pdf> [--svg-dir public/qr/posters]

The original PDF is never modified. QR modules are drawn as vectors on a cream plate
(dark-on-light scans far more reliably than the old light-on-orange codes).
"""
import argparse
import sys
from pathlib import Path

import fitz  # PyMuPDF
import segno

BASE = "https://gingerbrosshop.com/q/"
DARK = (0x2B / 255, 0x21 / 255, 0x18 / 255)  # deep brown
CREAM = (1.0, 0.957, 0.878)  # #fff4e0

# page index -> placement. `old` is the existing QR+label area (pt) that the plate must
# fully cover; None where the page has no code yet. `plate` is the (x0, y0) of the new plate.
PLATE_W, PLATE_H = 80, 98
POSTERS = [
    # page 1: promo popcorn deals — no code yet, bottom centre between the price boxes
    dict(page=0, slug="poster-promo-popcorn", name="Poster: Promo popcorn deals", label="Follow Us At:",
         target="https://link.gingerbrosshop.com/?src=qr", plate=(266, 722)),
    # page 2: promo popcorn + 6-packs — no code yet
    dict(page=1, slug="poster-promo-6pack", name="Poster: Promo 6-packs", label="Follow Us At:",
         target="https://link.gingerbrosshop.com/?src=qr", plate=(266, 722)),
    dict(page=2, slug="poster-fizz-tea", name="Poster: Fizz + Tea", label="Follow Us At:",
         target="https://link.gingerbrosshop.com/?src=qr", plate=(22, 726)),
    dict(page=3, slug="poster-fizz", name="Poster: Ginger Fizz", label="Shop Online:",
         target="https://gingerbrosshop.com/product/ginger-fizz", plate=(486, 726)),
    dict(page=4, slug="poster-tea", name="Poster: Ginger Tea", label="Follow Us At:",
         target="https://link.gingerbrosshop.com/?src=qr", plate=(486, 722)),
]


def draw_qr(page, url, x, y, size):
    qr = segno.make(url, error="m", boost_error=False)
    n = qr.symbol_size(border=0)[0]
    mod = size / n
    shape = page.new_shape()
    for r, row in enumerate(qr.matrix):
        for c, dark in enumerate(row):
            if dark:
                # tiny overlap hides anti-aliasing seams between neighbouring modules
                shape.draw_rect(fitz.Rect(x + c * mod - 0.03, y + r * mod - 0.03,
                                          x + (c + 1) * mod + 0.03, y + (r + 1) * mod + 0.03))
    shape.finish(fill=DARK, color=None)
    shape.commit()
    return qr


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("src")
    ap.add_argument("dst")
    ap.add_argument("--svg-dir")
    a = ap.parse_args()

    doc = fitz.open(a.src)
    if len(doc) != len(POSTERS):
        sys.exit(f"expected {len(POSTERS)} pages, found {len(doc)}")

    for p in POSTERS:
        page = doc[p["page"]]
        px, py = p["plate"]
        plate = fitz.Rect(px, py, px + PLATE_W, py + PLATE_H)
        shape = page.new_shape()
        shape.draw_rect(plate, radius=0.08)
        shape.finish(fill=CREAM, color=None)
        shape.commit()
        fs = 7.2
        tw = fitz.get_text_length(p["label"], fontname="hebo", fontsize=fs)
        page.insert_text((px + (PLATE_W - tw) / 2, py + 14), p["label"], fontname="hebo", fontsize=fs, color=DARK)
        qr_size = 62
        url = BASE + p["slug"]
        qr = draw_qr(page, url, px + (PLATE_W - qr_size) / 2, py + 23, qr_size)
        if a.svg_dir:
            out = Path(a.svg_dir)
            out.mkdir(parents=True, exist_ok=True)
            qr.save(out / f"gingerbros-{p['slug']}.svg", scale=20, border=4,
                    dark="#2b2118", light="#fff4e0")
            qr.save(out / f"gingerbros-{p['slug']}.png", scale=20, border=4,
                    dark="#2b2118", light="#fff4e0")
        print(f"page {p['page'] + 1}: {url} -> {p['target']}")

    doc.save(a.dst, garbage=3, deflate=True)


if __name__ == "__main__":
    main()
