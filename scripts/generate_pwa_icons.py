"""Generate PWA icons for COGNIGUIDE (gradient rounded square + heart + pulse line)."""

from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"

BRAND_TOP = (20, 135, 245)   # brand blue
BRAND_BOT = (16, 189, 133)   # mint green


def lerp(a: tuple, b: tuple, t: float) -> tuple:
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))


def make_icon(size: int, maskable: bool = False) -> Image.Image:
    scale = 4  # supersample for smooth edges
    s = size * scale
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Diagonal gradient background
    for y in range(s):
        color = lerp(BRAND_TOP, BRAND_BOT, y / s)
        draw.line([(0, y), (s, y)], fill=color + (255,))

    # Rounded-corner mask (full bleed if maskable)
    radius = int(s * (0.0 if maskable else 0.22))
    mask = Image.new("L", (s, s), 0)
    mdraw = ImageDraw.Draw(mask)
    mdraw.rounded_rectangle([0, 0, s - 1, s - 1], radius=radius, fill=255)
    img.putalpha(mask)

    # White heart, centered (shrunk a bit more when maskable for safe zone)
    shrink = 0.62 if maskable else 0.72
    cx, cy = s / 2, s / 2 - s * 0.02
    hw = s * shrink / 2
    heart = Image.new("L", (s, s), 0)
    hdraw = ImageDraw.Draw(heart)
    steps = 400
    pts = []
    import math

    for i in range(steps + 1):
        t = math.pi * (i / steps) * 2
        x = 16 * math.sin(t) ** 3
        y = 13 * math.cos(t) - 5 * math.cos(2 * t) - 2 * math.cos(3 * t) - math.cos(4 * t)
        pts.append((cx + x * hw / 18, cy - y * hw / 18))
    hdraw.polygon(pts, fill=255)

    white = Image.new("RGBA", (s, s), (255, 255, 255, 235))
    img.paste(white, (0, 0), heart)

    # Pulse line across the heart (brand gradient color, drawn as gaps in white)
    line_w = max(2, int(s * 0.035))
    yb = cy + s * 0.01
    seg = hw * 0.9
    pulse = [
        (cx - seg, yb),
        (cx - seg * 0.35, yb),
        (cx - seg * 0.18, yb - hw * 0.32),
        (cx - seg * 0.02, yb + hw * 0.42),
        (cx + seg * 0.14, yb - hw * 0.18),
        (cx + seg * 0.28, yb),
        (cx + seg, yb),
    ]
    pulse_color = lerp(BRAND_TOP, BRAND_BOT, 0.5) + (255,)
    draw = ImageDraw.Draw(img)
    draw.line(pulse, fill=pulse_color, width=line_w, joint="curve")

    return img.resize((size, size), Image.LANCZOS)


def main() -> None:
    PUBLIC.mkdir(exist_ok=True)
    make_icon(192).save(PUBLIC / "pwa-192.png")
    make_icon(512).save(PUBLIC / "pwa-512.png")
    make_icon(512, maskable=True).save(PUBLIC / "pwa-512-maskable.png")
    make_icon(180).save(PUBLIC / "apple-touch-icon.png")
    print("Icons written to", PUBLIC)


if __name__ == "__main__":
    main()
