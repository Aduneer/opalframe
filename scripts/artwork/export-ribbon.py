"""Convert the original Blender PNGs to small, alpha-preserving web assets.
Requires Pillow. Run after render-ribbon.py.
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
output = ROOT / 'apps/docs/public/artwork'
output.mkdir(parents=True, exist_ok=True)
for theme in ['charcoal', 'pearl']:
    for variant in ['', '-reflection']:
        image = Image.open(ROOT / f'artifacts/blender/ribbon-{theme}{variant}.png')
        image.resize((720, 480), Image.Resampling.LANCZOS).save(
            output / f'ribbon-{theme}{variant}.webp', quality=88, method=6)
        print(f'Exported ribbon-{theme}{variant}.webp')
