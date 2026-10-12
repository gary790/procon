#!/usr/bin/env python3
"""Serve every content JPG as WebP (JPG stays as the fallback).

For each <img src="/assets/img/…jpg"> in the HTML that is not already inside a
<picture>:
  * generate <name>.webp at native size (quality 78) and, for images wider than
    1100 px, a <name>-960.webp for phones
  * wrap the <img> in <picture> with a WebP <source>

Hero images are handled by responsive_heroes.py (run that first). Before/after
slider images (.ba__*) are left alone — the slider positions the <img> itself.
Idempotent. Run from the repo root:  python3 scripts/webp_images.py
"""
import glob
import os
import re

from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), '..', 'public')
IMG_RE = re.compile(r'<img src="(/assets/img/[^"?]+\.jpg)(\?[^"]*)?"([^>]*)>')
# a one-line wrapper this script produced on an earlier run — unwrapped, then re-generated
OWN_RE = re.compile(r'<picture><source type="image/webp"[^>]*>(<img src="/assets/img/[^"?]+\.jpg(?:\?[^"]*)?"[^>]*>)</picture>')
SKIP_CLASS = ('ba__',)


WIDTHS = (640, 960, 1280)


def webp_for(jpg_url):
    """[(url, width)] — 640/960/1280 + native, reusing any -<w>.webp already on disk."""
    src = os.path.join(ROOT, jpg_url.lstrip('/'))
    base, _ = os.path.splitext(src)
    im = Image.open(src).convert('RGB')
    nw, nh = im.size
    out = []
    for w in [*WIDTHS, nw]:
        if w > nw or any(w == ow for _, ow in out):
            continue
        dest = f'{base}-{w}.webp'
        plain = f'{base}.webp'
        if w == nw and os.path.exists(plain) and not os.path.exists(dest):
            dest = plain  # hand-made native WebP (e.g. the homepage hero)
        if not os.path.exists(dest):
            img = im if w == nw else im.resize((w, round(nh * w / nw)), Image.LANCZOS)
            img.save(dest, 'WEBP', quality=78, method=6)
        out.append(('/' + os.path.relpath(dest, ROOT).replace(os.sep, '/'), w))
    return out


def sizes_for(html, at):
    """Gallery grids are 3-up above 1100px and 2-up above 640px; else full width."""
    head = html[max(0, at - 600):at]
    if 'class="gal' in head or 'gal__media' in head:
        return '(min-width: 1100px) 33vw, (min-width: 640px) 50vw, 100vw'
    return '100vw'


def process(path):
    html = open(path, encoding='utf-8').read()
    original = html
    html = OWN_RE.sub(r'\1', html)
    changed = 0
    pos = 0
    while True:
        m = IMG_RE.search(html, pos)
        if not m:
            break
        pos = m.end()
        attrs = m.group(3)
        if any(c in attrs for c in SKIP_CLASS) or 'fetchpriority="high"' in attrs:
            continue
        start, end = m.start(), m.end()
        head = html[max(0, start - 3000):start]
        if head.rfind('<picture') > head.rfind('</picture>'):
            continue  # hand-built <picture> — leave it
        variants = webp_for(m.group(1))
        if len(variants) > 1:
            srcset = ', '.join(f'{u} {w}w' for u, w in variants)
            source = f'<source type="image/webp" srcset="{srcset}" sizes="{sizes_for(html, start)}">'
        else:
            source = f'<source type="image/webp" srcset="{variants[0][0]}">'
        new = f'<picture>{source}{m.group(0)}</picture>'
        html = html[:start] + new + html[end:]
        pos = start + len(new)
        changed += 1
    if html != original:
        open(path, 'w', encoding='utf-8').write(html)
    return changed


def main():
    pages = sorted(glob.glob(os.path.join(ROOT, '*.html')) + glob.glob(os.path.join(ROOT, '*', '*.html')))
    total = 0
    for p in pages:
        n = process(p)
        if n:
            total += n
            print(f'{n:3d} images  {os.path.relpath(p, ROOT)}')
    print(f'{total} images now served as WebP')


if __name__ == '__main__':
    main()
