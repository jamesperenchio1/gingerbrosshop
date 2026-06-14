from PIL import Image
import os

# Config
ORANGE = (212, 119, 33)  # warm orange
SRC = "/Users/jamesperenchio/Desktop/GingerBros Site/Kimi_Agent_姜啤电商功能扩展/app/public/source-keg.png"
OUT_DIR = "/Users/jamesperenchio/Desktop/GingerBros Site/Kimi_Agent_姜啤电商功能扩展/app/public"

def remove_white_background(img: Image.Image) -> Image.Image:
    """Convert white-ish background to transparent."""
    img = img.convert("RGBA")
    data = img.getdata()
    new_data = []
    for r, g, b, a in data:
        # If pixel is close to white and not already transparent, make it transparent
        if a > 0 and r > 240 and g > 240 and b > 240:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append((r, g, b, a))
    img.putdata(new_data)
    return img

def create_favicon(size: int, keg: Image.Image, padding: float = 0.1) -> Image.Image:
    canvas = Image.new("RGBA", (size, size), ORANGE + (255,))
    # Scale keg to fit with padding
    keg_size = int(size * (1 - 2 * padding))
    keg_resized = keg.resize((keg_size, keg_size), Image.LANCZOS)
    # Paste centered
    x = (size - keg_size) // 2
    y = (size - keg_size) // 2
    canvas.paste(keg_resized, (x, y), keg_resized)
    return canvas

def main():
    src = Image.open(SRC)
    keg = remove_white_background(src)

    sizes = {
        "favicon-16x16.png": 16,
        "favicon-32x32.png": 32,
        "apple-touch-icon.png": 180,
        "icon-192.png": 192,
        "icon-512.png": 512,
    }

    for filename, size in sizes.items():
        out = create_favicon(size, keg)
        out.save(os.path.join(OUT_DIR, filename), "PNG")
        print(f"Generated {filename}")

    # Generate multi-size favicon.ico
    ico = create_favicon(64, keg)
    ico.save(os.path.join(OUT_DIR, "favicon.ico"), format="ICO", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
    print("Generated favicon.ico")

if __name__ == "__main__":
    main()
