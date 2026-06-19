#!/usr/bin/env python3
"""Tests for pdf-figures.py. Functional tests are skipped if PyMuPDF is absent."""
import os, subprocess, sys, tempfile, unittest

HERE = os.path.dirname(os.path.abspath(__file__))
SCRIPT = os.path.join(HERE, "pdf-figures.py")

try:
    import fitz  # noqa: F401
    HAVE_FITZ = True
except ImportError:
    HAVE_FITZ = False


def make_pdf(path):
    """A 2-page PDF: page 1 has text + an embedded raster image; page 2 has text."""
    import fitz
    doc = fitz.open()
    p1 = doc.new_page(width=300, height=300)
    p1.insert_text((40, 40), "Figure 1")
    pix = fitz.Pixmap(fitz.csRGB, fitz.IRect(0, 0, 100, 80))
    pix.set_rect(pix.irect, (200, 120, 60))  # fill so it is a real image
    p1.insert_image(fitz.Rect(40, 60, 240, 220), pixmap=pix)
    p2 = doc.new_page(width=300, height=300)
    p2.insert_text((40, 40), "Page 2")
    doc.save(path)
    doc.close()


class DependencyMessage(unittest.TestCase):
    def test_choose_one_mode(self):
        # Argument validation happens before PyMuPDF is loaded, so this runs anywhere.
        with tempfile.NamedTemporaryFile(suffix=".pdf") as f:
            r = subprocess.run([sys.executable, SCRIPT, f.name],
                               capture_output=True, text=True)
        self.assertNotEqual(r.returncode, 0)
        self.assertIn("exactly one of", r.stderr)


@unittest.skipUnless(HAVE_FITZ, "PyMuPDF not installed")
class Functional(unittest.TestCase):
    def setUp(self):
        self.dir = tempfile.mkdtemp(prefix="pdf-figs-")
        self.pdf = os.path.join(self.dir, "paper.pdf")
        make_pdf(self.pdf)

    def run_script(self, *extra):
        out = os.path.join(self.dir, "figs")
        r = subprocess.run([sys.executable, SCRIPT, self.pdf, "--out", out, *extra],
                           capture_output=True, text=True)
        return r, out

    def test_images_mode(self):
        r, out = self.run_script("--images", "--min-size", "10")
        self.assertEqual(r.returncode, 0, r.stderr)
        pngs = [f for f in os.listdir(out) if f.endswith(".png")]
        self.assertTrue(pngs, "expected at least one extracted image")

    def test_pages_mode(self):
        r, out = self.run_script("--pages", "1-2")
        self.assertEqual(r.returncode, 0, r.stderr)
        self.assertTrue(os.path.exists(os.path.join(out, "page-1.png")))
        self.assertTrue(os.path.exists(os.path.join(out, "page-2.png")))

    def test_rect_mode(self):
        r, out = self.run_script("--rect", "1,0,0,150,150")
        self.assertEqual(r.returncode, 0, r.stderr)
        self.assertTrue(os.path.exists(os.path.join(out, "p1-rect.png")))


if __name__ == "__main__":
    unittest.main()
