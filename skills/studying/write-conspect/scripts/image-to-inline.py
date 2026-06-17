#!/usr/bin/env python3
"""Convert a local or remote image into an inline WebP data URI.

Keeps the conspect a single self-contained HTML file: the image is resized to a
max width, re-encoded as WebP, base64-encoded, and printed to stdout as
`data:image/webp;base64,...` — ready to paste into an `image` block's `src`.

Usage:
    python3 image-to-inline.py <url-or-path> [--max-width 1200] [--quality 80]

stdout: the data URI. stderr: encoded size + a warning if it exceeds the budget.
"""
import argparse, base64, io, os, shutil, subprocess, sys, tempfile, urllib.request

SIZE_WARN_BYTES = 150 * 1024  # budget for one inline figure


def fetch_to_temp(url):
    fd, path = tempfile.mkstemp(suffix=".img")
    os.close(fd)
    req = urllib.request.Request(url, headers={"User-Agent": "conspect-image/1.0"})
    with urllib.request.urlopen(req, timeout=30) as r, open(path, "wb") as f:
        shutil.copyfileobj(r, f)
    return path


def _encode_with_cwebp(png_bytes, target_width, quality):
    """Encode PNG bytes to WebP via the cwebp binary. Returns bytes or None."""
    if not shutil.which("cwebp"):
        return None
    in_fd, in_path = tempfile.mkstemp(suffix=".png")
    out_fd, out_path = tempfile.mkstemp(suffix=".webp")
    os.close(in_fd); os.close(out_fd)
    try:
        with open(in_path, "wb") as f:
            f.write(png_bytes)
        subprocess.run(
            ["cwebp", "-quiet", "-q", str(quality),
             "-resize", str(target_width), "0", in_path, "-o", out_path],
            check=True,
        )
        with open(out_path, "rb") as f:
            return f.read()
    except Exception:
        return None
    finally:
        for p in (in_path, out_path):
            if os.path.exists(p):
                os.unlink(p)


def to_webp_data_uri(src_path, max_width=1200, quality=80):
    """Return (data_uri, size_bytes) for a local image file."""
    from PIL import Image

    im = Image.open(src_path).convert("RGBA")
    target_width = min(im.width, max_width)

    buf = io.BytesIO()
    im.save(buf, format="PNG")
    webp = _encode_with_cwebp(buf.getvalue(), target_width, quality)

    if webp is None:  # Pillow fallback
        if target_width < im.width:
            h = round(im.height * target_width / im.width)
            im = im.resize((target_width, h), Image.LANCZOS)
        buf = io.BytesIO()
        im.save(buf, format="WEBP", quality=quality, method=6)
        webp = buf.getvalue()

    uri = "data:image/webp;base64," + base64.b64encode(webp).decode("ascii")
    return uri, len(webp)


def main(argv=None):
    ap = argparse.ArgumentParser(description="Image -> inline WebP data URI")
    ap.add_argument("source", help="image URL or local path")
    ap.add_argument("--max-width", type=int, default=1200)
    ap.add_argument("--quality", type=int, default=80)
    args = ap.parse_args(argv)

    tmp = None
    try:
        if args.source.startswith(("http://", "https://")):
            tmp = fetch_to_temp(args.source)
            path = tmp
        else:
            path = args.source
            if not os.path.exists(path):
                print("error: file not found: " + path, file=sys.stderr)
                return 2
        uri, size = to_webp_data_uri(path, args.max_width, args.quality)
    finally:
        if tmp and os.path.exists(tmp):
            os.unlink(tmp)

    print("[image-to-inline] {:.1f} KB".format(size / 1024), file=sys.stderr)
    if size > SIZE_WARN_BYTES:
        print("[image-to-inline] WARNING: exceeds {} KB budget — lower --max-width "
              "or --quality".format(SIZE_WARN_BYTES // 1024), file=sys.stderr)
    print(uri)
    return 0


if __name__ == "__main__":
    sys.exit(main())
