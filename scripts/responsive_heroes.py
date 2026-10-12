#!/usr/bin/env python3
"""Make every sub-page hero image responsive, matching the homepage treatment.

For each page whose hero <img> carries fetchpriority="high":
  * generate WebP variants of the hero JPG at 640 / 960 / 1280 / native width
    (public/assets/img/<name>-<w>.webp — skipped when already present)
  * wrap the <img> in <picture> with a WebP srcset + sizes="100vw"
  * add a <link rel="preload" as="image"> with imagesrcset right after the
    font preloads, so the browser starts the hero fetch before CSS parses
  * correct the intrinsic width/height attributes to the real image size

Idempotent: pages already wrapped in <picture> are left alone.
Run from the repo root:  python3 scripts/responsive_heroes.py
"""
import glob
import os
import re
import sys

from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), '..', 'public')
WIDTHS = (640, 960, 1280)

IMG_RE = re.compile(r'<img src="(/assets/img/[^"]+\.jpg)"([^>]*)fetchpriority="high"([^>]*)>')
PRELOAD_ANCHOR = '<link rel="preload" href="/assets/fonts/Switzer-400.woff2" as="font" type="font/woff2" crossorigin>'


def variants_for(jpg_url):
    """Return [(url, width), ...] for the WebP set, generating files as needed."""
    src = os.path.join(ROOT, jpg_url.lstrip('/'))
    base, _ = os.path.splitext(src)
    im = Image.open(src).convert('RGB')
    native_w, native_h = im.size
    out = []
    for w in [*WIDTHS, native_w]:
        if w > native_w:
            continue
        dest = f'{base}-{w}.webp'
        if not os.path.exists(dest):
            h = round(native_h * w / native_w)
            im.resize((w, h), Image.LANCZOS).save(dest, 'WEBP', quality=78, method=6)
        url = '/' + os.path.relpath(dest, ROOT).replace(os.sep, '/')
        out.append((url, w))
    # de-dupe in case native width equals one of WIDTHS
    seen, uniq = set(), []
    for u, w in out:
        if w not in seen:
            seen.add(w)
            uniq.append((u, w))
    return uniq, native_w, native_h


def process(path):
    html = open(path, encoding='utf-8').read()
    m = IMG_RE.search(html)
    if not m:
        return False
    jpg = m.group(1)
    # Already wrapped by a previous run (or hand-built like the homepage)?
    before = html[max(0, m.start() - 400):m.start()]
    if '<picture' in before and '</picture>' not in before:
        return False

    variants, nw, nh = variants_for(jpg)
    srcset = ', '.join(f'{u} {w}w' for u, w in variants)
    smallest = variants[0][0]

    attrs = (m.group(2) + m.group(3)).strip()
    attrs = re.sub(r'\s*width="\d+"', '', attrs)
    attrs = re.sub(r'\s*height="\d+"', '', attrs)
    attrs = re.sub(r'\s+', ' ', attrs).strip()
    new_img = (
        '<picture>\n'
        f'          <source type="image/webp" srcset="{srcset}" sizes="100vw">\n'
        f'          <img src="{jpg}" {attrs} width="{nw}" height="{nh}" fetchpriority="high">\n'
        '        </picture>'
    )
    html = html[:m.start()] + new_img + html[m.end():]

    if 'rel="preload" as="image"' not in html and PRELOAD_ANCHOR in html:
        preload = (
            PRELOAD_ANCHOR + '\n'
            '  <link rel="preload" as="image" type="image/webp"\n'
            f'        href="{smallest}"\n'
            f'        imagesrcset="{srcset}"\n'
            '        imagesizes="100vw" fetchpriority="high">'
        )
        html = html.replace(PRELOAD_ANCHOR, preload, 1)

    open(path, 'w', encoding='utf-8').write(html)
    return True


def main():
    pages = sorted(glob.glob(os.path.join(ROOT, '*.html')) + glob.glob(os.path.join(ROOT, '*', '*.html')))
    changed = [p for p in pages if process(p)]
    for p in changed:
        print('updated', os.path.relpath(p, ROOT))
    print(f'{len(changed)} pages updated')


if __name__ == '__main__':
    sys.exit(main())
