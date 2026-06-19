#!/usr/bin/env python3
"""Extract real figures from a paper's PDF for a paper-brief.

Three modes (pick one per run):
  --images            extract embedded raster images (one PNG per image)
  --pages  RANGE      render whole pages to PNG  (e.g. "3", "2-5", "1,4,7")
  --rect   SPEC       render one cropped region   ("page,x0,y0,x1,y1" in PDF points)

Output PNGs are written under --out (default: figs/). Feed a chosen PNG into
scripts/image-to-inline.py to inline it as a WebP data URI in an `image` block.

Coordinates for --rect are PDF points (72 per inch), origin at the page's
top-left, matching what the Read tool shows when you view the PDF.
"""
import argparse, os, sys


def _load_fitz():
    try:
        import fitz  # PyMuPDF
        return fitz
    except ImportError:
        print("error: PyMuPDF not installed — run: pip install pymupdf", file=sys.stderr)
        sys.exit(3)


def parse_pages(spec, page_count):
    """'3' -> [3]; '2-5' -> [2,3,4,5]; '1,4' -> [1,4]. 1-based, clamped."""
    pages = []
    for part in spec.split(","):
        part = part.strip()
        if not part:
            continue
        if "-" in part:
            lo, hi = part.split("-", 1)
            pages.extend(range(int(lo), int(hi) + 1))
        else:
            pages.append(int(part))
    return [p for p in pages if 1 <= p <= page_count]


def extract_images(fitz, doc, out, min_size):
    written = []
    for pno in range(len(doc)):
        page = doc[pno]
        for i, img in enumerate(page.get_images(full=True), start=1):
            xref = img[0]
            pix = fitz.Pixmap(doc, xref)
            if pix.n - pix.alpha >= 4:  # CMYK or other -> convert to RGB
                pix = fitz.Pixmap(fitz.csRGB, pix)
            if min(pix.width, pix.height) < min_size:
                continue
            path = os.path.join(out, "p{}-{}.png".format(pno + 1, i))
            pix.save(path)
            written.append(path)
    return written


def render_pages(fitz, doc, out, spec, dpi):
    written = []
    for p in parse_pages(spec, len(doc)):
        pix = doc[p - 1].get_pixmap(dpi=dpi)
        path = os.path.join(out, "page-{}.png".format(p))
        pix.save(path)
        written.append(path)
    return written


def render_rect(fitz, doc, out, spec, dpi):
    parts = [float(x) for x in spec.split(",")]
    if len(parts) != 5:
        print("error: --rect needs 'page,x0,y0,x1,y1'", file=sys.stderr)
        sys.exit(2)
    p = int(parts[0])
    rect = fitz.Rect(parts[1], parts[2], parts[3], parts[4])
    pix = doc[p - 1].get_pixmap(dpi=dpi, clip=rect)
    path = os.path.join(out, "p{}-rect.png".format(p))
    pix.save(path)
    return [path]


def main(argv=None):
    ap = argparse.ArgumentParser(description="Extract figures from a PDF")
    ap.add_argument("pdf", help="path to the PDF")
    ap.add_argument("--images", action="store_true", help="extract embedded raster images")
    ap.add_argument("--pages", help="render these pages, e.g. '3' '2-5' '1,4'")
    ap.add_argument("--rect", help="render one region: 'page,x0,y0,x1,y1' (PDF points)")
    ap.add_argument("--out", default="figs", help="output directory (default: figs)")
    ap.add_argument("--dpi", type=int, default=150, help="render DPI (default: 150)")
    ap.add_argument("--min-size", type=int, default=64,
                    help="skip embedded images smaller than this many px (default: 64)")
    args = ap.parse_args(argv)

    if sum(bool(x) for x in (args.images, args.pages, args.rect)) != 1:
        print("error: choose exactly one of --images / --pages / --rect", file=sys.stderr)
        return 2
    if not os.path.exists(args.pdf):
        print("error: file not found: " + args.pdf, file=sys.stderr)
        return 2

    fitz = _load_fitz()
    os.makedirs(args.out, exist_ok=True)
    doc = fitz.open(args.pdf)

    if args.images:
        written = extract_images(fitz, doc, args.out, args.min_size)
    elif args.pages:
        written = render_pages(fitz, doc, args.out, args.pages, args.dpi)
    else:
        written = render_rect(fitz, doc, args.out, args.rect, args.dpi)

    for p in written:
        print(p)
    print("[pdf-figures] wrote {} file(s) to {}".format(len(written), args.out), file=sys.stderr)
    return 0 if written else 1


if __name__ == "__main__":
    sys.exit(main())
