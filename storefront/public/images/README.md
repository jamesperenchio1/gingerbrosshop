# Gingerbros public images

Drop files here and reference them from the storefront via `/images/...`.

## Recognized photo slots

| File (any of these) | Where it shows |
|---|---|
| `fermenter.jpg` / `.webp` / `.png` | Story-strip section ("One guy. One stubborn recipe.") — replaces the SVG fermenter illustration next to the "Day 9 · active ferment" badge. |

Recommended size: 1000×1200 or larger, portrait-ish (taller than wide) looks best in the card. The component uses object-cover and will crop to fill.

After adding a file, rebuild the storefront container:

```
cd /opt/gingerbros
sudo docker compose build storefront && sudo docker compose up -d storefront
```
