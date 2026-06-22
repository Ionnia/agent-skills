#!/usr/bin/env python3
"""Extract real figures from a paper's PDF for a paper-brief.

Five modes (pick one per run):
  --images            extract embedded raster images (one PNG per image)
  --pages  RANGE      render whole pages to PNG  (e.g. "3", "2-5", "1,4,7")
  --rect   SPEC       render one cropped region   ("page,x0,y0,x1,y1" in PDF points)
  --auto              auto-crop the region above each "Figure N" caption; pass the
                      paper's caption word(s) via --label (e.g. --label Figure
                      --label Рис.) or a full --caption-re. Prints a ready-to-tweak
                      --rect per figure, so a too-tall/too-tight crop is one edit away.
  --grid   RANGE      render page(s) with a labeled point ruler (origin top-left) to
                      inform a manual --rect when --auto finds no caption.

Output PNGs are written under --out (default: figs/). Feed a chosen PNG into
scripts/image-to-inline.py to inline it as a WebP data URI in an `image` block.

Coordinates for --rect/--auto are PDF points (72 per inch), origin at the page's
top-left, matching what the Read tool shows when you view the PDF. --images returns
only *embedded rasters*; vector composites (radar/architecture/loss charts) won't
appear there — use --auto or --rect for those.
"""
import argparse, os, re, sys

# Caption prefixes matched by --auto when the caller passes no --label.
DEFAULT_LABELS = ["Figure", "Fig.", "Рис."]


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
    page = doc[p - 1]
    rect = fitz.Rect(parts[1], parts[2], parts[3], parts[4])
    clamped = rect & page.rect  # intersect with the page so a slightly-too-large rect still renders
    if clamped.is_empty or clamped.width < 1 or clamped.height < 1:
        print("error: --rect {} does not overlap page {} ({:.0f}x{:.0f}) — nothing to render"
              .format(tuple(round(v, 1) for v in rect), p, page.rect.width, page.rect.height),
              file=sys.stderr)
        sys.exit(2)
    if clamped != rect:
        print("warning: --rect clipped to page bounds {}".format(
            tuple(round(v, 1) for v in clamped)), file=sys.stderr)
    pix = page.get_pixmap(dpi=dpi, clip=clamped)
    path = os.path.join(out, "p{}-rect.png".format(p))
    pix.save(path)
    return [path]


def _caption_matcher(labels, caption_re):
    """Regex matching a caption's start. Caller-supplied --label/--caption-re win."""
    if caption_re:
        return re.compile(caption_re)
    alt = "|".join(re.escape(x) for x in (labels or DEFAULT_LABELS))
    return re.compile(r"^\s*(?:" + alt + r")\s*\.?\s*\d+", re.IGNORECASE)


def render_auto(fitz, doc, out, labels, caption_re, dpi):
    """Crop the region above each 'Figure N' caption; print a ready --rect per figure."""
    rx = _caption_matcher(labels, caption_re)
    written = []
    for pno in range(len(doc)):
        page = doc[pno]
        pr = page.rect
        blocks = sorted(page.get_text("blocks"), key=lambda b: b[1])  # (x0,y0,x1,y1,text,...)
        for b in blocks:
            x0, y0, x1, y1, text = b[0], b[1], b[2], b[3], b[4].strip()
            if not rx.match(text):
                continue
            # Figure region: column-width strip from the previous text block's
            # bottom up to the caption's top.
            prev_bottom = pr.y0
            for o in blocks:
                if o[3] <= y0 - 1 and o[3] > prev_bottom:
                    prev_bottom = o[3]
            crop = fitz.Rect(pr.x0, prev_bottom, pr.x1, y0) & pr
            if crop.is_empty or crop.height < 10:
                continue
            n = re.search(r"\d+", text)
            tag = n.group(0) if n else str(len(written) + 1)
            # Page-qualified so two "Figure 1" captions on different pages don't collide.
            path = os.path.join(out, "fig-p{}-{}.png".format(pno + 1, tag))
            page.get_pixmap(dpi=dpi, clip=crop).save(path)
            rectspec = "{},{},{},{},{}".format(
                pno + 1, *(round(v, 1) for v in (crop.x0, crop.y0, crop.x1, crop.y1)))
            cap = " ".join(text[:60].split())
            print('{}\tpage={}\t--rect "{}"\t(caption: "{}")'.format(path, pno + 1, rectspec, cap))
            written.append(path)
    return written


def render_grid(fitz, doc, out, spec, dpi, step=50):
    """Render page(s) with a labeled point ruler (origin top-left) for informed cropping."""
    written = []
    for p in parse_pages(spec, len(doc)):
        page = doc[p - 1]
        pr = page.rect
        x = 0
        while x <= pr.x1:
            page.draw_line((x, 0), (x, pr.y1), color=(1, 0, 0), width=0.3)
            page.insert_text((x + 1, 10), str(int(x)), fontsize=6, color=(1, 0, 0))
            x += step
        y = 0
        while y <= pr.y1:
            page.draw_line((0, y), (pr.x1, y), color=(1, 0, 0), width=0.3)
            page.insert_text((1, y + 7), str(int(y)), fontsize=6, color=(1, 0, 0))
            y += step
        path = os.path.join(out, "page-{}-grid.png".format(p))
        page.get_pixmap(dpi=dpi).save(path)
        written.append(path)
    return written


def main(argv=None):
    ap = argparse.ArgumentParser(description="Extract figures from a PDF")
    ap.add_argument("pdf", help="path to the PDF")
    ap.add_argument("--images", action="store_true", help="extract embedded raster images")
    ap.add_argument("--pages", help="render these pages, e.g. '3' '2-5' '1,4'")
    ap.add_argument("--rect", help="render one region: 'page,x0,y0,x1,y1' (PDF points)")
    ap.add_argument("--auto", action="store_true",
                    help="auto-crop the region above each 'Figure N' caption")
    ap.add_argument("--grid", help="render page(s) with a labeled point ruler, e.g. '1' '2-3'")
    ap.add_argument("--label", action="append",
                    help="caption prefix to match for --auto (repeatable), e.g. Figure Fig. Рис.")
    ap.add_argument("--caption-re", dest="caption_re",
                    help="regex for the caption start for --auto (overrides --label)")
    ap.add_argument("--out", default="figs", help="output directory (default: figs)")
    ap.add_argument("--dpi", type=int, default=150, help="render DPI (default: 150)")
    ap.add_argument("--min-size", type=int, default=64,
                    help="skip embedded images smaller than this many px (default: 64)")
    args = ap.parse_args(argv)

    if sum(bool(x) for x in (args.images, args.pages, args.rect, args.auto, args.grid)) != 1:
        print("error: choose exactly one of --images / --pages / --rect / --auto / --grid",
              file=sys.stderr)
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
    elif args.auto:
        written = render_auto(fitz, doc, args.out, args.label, args.caption_re, args.dpi)
    elif args.grid:
        written = render_grid(fitz, doc, args.out, args.grid, args.dpi)
    else:
        written = render_rect(fitz, doc, args.out, args.rect, args.dpi)

    if not args.auto:  # --auto already prints a rich, copy-pasteable line per figure
        for p in written:
            print(p)
    print("[pdf-figures] wrote {} file(s) to {}".format(len(written), args.out), file=sys.stderr)
    return 0 if written else 1


if __name__ == "__main__":
    sys.exit(main())
