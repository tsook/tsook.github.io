#!/usr/bin/env python3
"""Regenerate public/images/thumbs/<id>.png for every paper in src/data/publications.json.

Each teaser (the paper's `teaserImage`, or an override below) is trimmed of white
margins and fitted whole onto a 360 by 225 white canvas, so nothing is cropped or
stretched. Run from the repo root: python3 scripts/make-thumbs.py
"""
import json, os
from PIL import Image, ImageOps, ImageChops

W, H, PAD = 360, 225, 8
OVERRIDE = {  # paper id -> source image, when the teaser is not the right picture
    'evallm': 'public/images/evallm-still.png',
    'cells-generators-lenses': 'public/images/llm-objects.png',
    'one-vs-many': 'public/images/onevsmany.png',
}

def flatten(im):
    if im.mode in ('RGBA', 'LA', 'P'):
        im = im.convert('RGBA'); bg = Image.new('RGBA', im.size, (255, 255, 255, 255))
        return Image.alpha_composite(bg, im).convert('RGB')
    return im.convert('RGB')

def trim(im):
    bg = Image.new('RGB', im.size, (255, 255, 255))
    box = ImageChops.difference(im, bg).convert('L').point(lambda v: 255 if v > 18 else 0).getbbox()
    return im.crop(box) if box else im

pubs = json.load(open('src/data/publications.json'))['publications']
for p in pubs:
    src = OVERRIDE.get(p['id']) or ('public' + p['teaserImage'] if p.get('teaserImage') else None)
    if not src or not os.path.isfile(src):
        print(p['id'], 'skipped (no teaser)'); continue
    im = trim(flatten(Image.open(src)))
    fit = ImageOps.contain(im, (W - 2 * PAD, H - 2 * PAD), Image.LANCZOS)
    canvas = Image.new('RGB', (W, H), (255, 255, 255))
    canvas.paste(fit, ((W - fit.width) // 2, (H - fit.height) // 2))
    out = f'public/images/thumbs/{p["id"]}.png'
    canvas.save(out, optimize=True); print(p['id'], fit.size, '->', out)
