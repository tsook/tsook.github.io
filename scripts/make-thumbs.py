"""Generate 16:10 thumbnails for the publication list.

For each paper in src/data/publications.json with a teaser image, find the
drawn content (non-white pixels), crop a 16:10 window around it, resize to
320x200, and write public/images/thumbs/<id>.png. Also sets the "thumb"
field on each paper. Run from the repo root: python3 scripts/make-thumbs.py
"""
import json, os
from PIL import Image, ImageChops

DATA = 'src/data/publications.json'
OUT = 'public/images/thumbs'
os.makedirs(OUT, exist_ok=True)
data = json.load(open(DATA))

def source(p):
    if p.get('stillImage'):
        return 'public' + p['stillImage']
    t = p.get('cardImage') or p.get('teaserImage') or ''
    if not t or t.endswith('.json'):
        return None
    return 'public' + t

for p in data['publications']:
    src = source(p)
    if not src or not os.path.exists(src):
        continue
    im = Image.open(src).convert('RGB')
    white = Image.new('RGB', im.size, (255, 255, 255))
    mask = ImageChops.difference(im, white).convert('L').point(lambda v: 255 if v > 18 else 0)
    x0, y0, x1, y1 = mask.getbbox() or (0, 0, im.width, im.height)
    bw, bh = x1 - x0, y1 - y0
    ratio = 16 / 10
    if bw / bh >= ratio:
        cw, ch = bw, int(bw / ratio)
    else:
        ch, cw = bh, int(bh * ratio)
    cw, ch = min(cw, im.width), min(ch, im.height)
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    left = int(max(0, min(im.width - cw, cx - cw / 2)))
    top = int(max(0, min(im.height - ch, cy - ch / 2)))
    thumb = im.crop((left, top, left + cw, top + ch)).resize((320, 200), Image.LANCZOS)
    thumb.save(f'{OUT}/{p["id"]}.png', optimize=True)
    p['thumb'] = f'/images/thumbs/{p["id"]}.png'

with open(DATA, 'w') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
    f.write('\n')
print('done')
