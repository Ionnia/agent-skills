---
name: paper-brief
description: Use when the user wants a clear, self-contained explainer of a single academic paper (PDF, arXiv link/ID, or pasted text) — a "paper brief". Reads the paper, reorganizes it into a pedagogical through-line, explains it intuitively as the best teacher would, prefers the paper's own figures (extracted from the PDF), and renders a standalone HTML file from the bundled template.
license: MIT
metadata:
  author: Ionnia
  version: "0.2.0"
---

# Paper Brief

Approach this as the **best teacher in the world** explaining one paper to a capable newcomer — not a summarizer. A paper brief is a self-contained set of notes that explains the paper's ideas intuitively (never simplistically), reorganized so a reader who has never seen the paper can follow the argument. The deliverable is a single `<brief-name>.html` file built from the bundled `templates/template.html`.

Write all brief content in the **language of the user's request and the paper** (Russian request → Russian brief). This workflow applies regardless of language.

The paper is the **source of truth**. Your job is to explain what it says faithfully and clearly — not to audit it against the wider literature. Look things up only to understand the paper, not to second-guess it.

## Workflow

### 1. Get the paper

- **A PDF URL** (including arXiv `…/pdf/…`): **download it first** with `curl`, then read the local file. Never read a PDF straight from a URL.
  ```bash
  curl -L -o paper.pdf "https://arxiv.org/pdf/1706.03762"
  ```
  Read the local `paper.pdf` with the Read tool's `pages` parameter (it renders the pages visually, so you also see the figures and their locations).
- **An arXiv abstract link or ID** (e.g. `arXiv:1706.03762`): turn it into the `…/pdf/…` URL and download as above.
- **A local PDF path**: read it directly with the Read tool.
- **Pasted text**: use it as-is (no figures will be extractable — fall back to SVG figures where one carries an idea).

### 2. Understand the paper end to end

Read the whole paper before structuring anything: the problem it attacks, the core idea, the method, the key results, and the stated limitations. Note which figures and tables actually carry the argument — those are the ones worth reproducing.

### 3. Outline for clarity, not paper order

Reorganize the paper into a **pedagogical through-line**, not a section-by-section mirror. A reliable spine: **motivation → core idea → method → results → significance/limitations**. Collapse, reorder, and merge the paper's sections wherever that teaches better. Decide the nesting depth the paper needs (1–3 levels) and plan the full outline before writing any topic. Topics are ordered so each builds on what came before; there is no separate prerequisites block — fold any needed background into the prose where the reader first needs it.

### 4. Light background research only

Where the paper assumes a concept or piece of jargon the target reader won't know, look it up just enough to explain it in one or two sentences. Do **not** run the multi-source fact-checking pass that a from-scratch study note would — the paper defines its own claims, notation, and results. If the paper itself is unclear or you must fill a gap from outside it, say so in the brief rather than presenting a guess as the paper's claim.

### 5. Write each topic

Hold the bar: intuitively clear, never oversimplified. The core rules (full set with rationale in [references/pedagogy.md](references/pedagogy.md) — apply it throughout):

1. **Intuition first, formalism second.** Open with a concrete instance, picture, or analogy; only then the general statement. Say where the analogy breaks.
2. **One new idea at a time.** Sequence so each paragraph adds a single new element on top of what's already established.
3. **Anchor new to known.** Begin each topic by connecting it to what the reader already has and stating what they'll understand by the end.
4. **Explain why, not just what.** Mechanism and motivation beat bare facts; connect ideas back to earlier topics explicitly.
5. **Several concrete examples with different surface features**, woven into the prose, so an idea transfers instead of binding to one case.
6. **Refute misconceptions head-on** where they really exist — the misreadings a newcomer to *this* paper actually makes: state the wrong belief, why it's tempting, why it's wrong, then the correct version. That's what `attention` blocks are for.
7. **Dual coding.** Pair prose with a figure where a picture genuinely carries the idea (see step 6). A well-built comparison **`table`** block is also dual coding — use it when several items differ along the same few dimensions.
8. **Define every term at first use** — tooltips for in-place definitions; keep terminology consistent (match the paper's notation).
9. **For a load-bearing formula** a reader would genuinely stumble on, use a `formula` block (display formula + clickable `?` with an intuitive explanation), not a bare `$$…$$`. Don't apply it to routine formulas.
10. **Simplify the path, not the destination.** Never dumb down the paper's actual claim; build up to it.
11. **Cut tangents.** Everything serves the brief's goal of explaining this paper.

### 6. Figures — the paper's own first

A paper brief should show the paper's real figures wherever one carries the idea. Order of preference (read [references/diagrams.md](references/diagrams.md) for the full rule):

1. **The paper's real figure** — extract it from the PDF with `scripts/pdf-figures.py`, then inline it:
   - `python3 scripts/pdf-figures.py paper.pdf --images --out figs` — pull embedded raster figures, or
   - `python3 scripts/pdf-figures.py paper.pdf --pages 4 --out figs` then crop, or `--rect "4,x0,y0,x1,y1"` to render a single figure region (good for vector charts).
   - Inline the chosen PNG: `python3 scripts/image-to-inline.py figs/p4-1.png` → paste the `data:image/webp;base64,…` into an `image` block's `src`. Attribute it in the `caption` (e.g. "Рис. 1 из статьи").
2. **A redrawn SVG** — only to *simplify* a figure too cluttered to reuse, or when the paper has none. Default mechanism for schematic figures otherwise.
3. **Canvas** — only for genuinely dense procedural data.

### 7. Render the HTML

**Read [references/format.md](references/format.md) before producing any data** — it defines the exact `window.CONSPECT` schema, block types, math/tooltip conventions, the injection markers, and the build command. Then:

1. Build the data object and write it to a temp file (e.g. `data.js`) as a single JS expression.
2. Run `node scripts/build.js data.js <brief-name> [output-dir]`. It copies the template, splices the data, validates the structure, and writes `<brief-name>.html` only if validation passes.
3. If the build reports a validation error, fix `data.js` and re-run.
4. Deliver the file where the user expects output.

`templates/template.html` ships with a built-in sample brief, so it can be opened directly for a design preview before building.

### 8. Clean up

The spliced `<brief-name>.html` is fully self-contained — figures are inlined, no assets referenced. Once it is validated and delivered, **delete every temporary file the process produced**, leaving the `.html` as the only new artifact:

- the downloaded `paper.pdf` (unless it was the user's own input file);
- extracted/intermediate images (the `figs/` directory, any source PNGs fed to `image-to-inline.py`);
- the data expression temp file (`data.js`);
- any other scratch files created during the build.

Do **not** touch the user's own input materials or anything in the skill directory itself.

## Hard rules

- Always read `references/format.md` before writing any brief data.
- The paper is the source of truth: explain it faithfully, don't audit it. Where you fill a gap from outside the paper or the paper is unclear, flag it rather than presenting a guess as the paper's claim.
- For a PDF URL, always `curl` it to a local file and read that — never read a PDF through a URL.
- Always plan the full outline (step 3) before writing topic content; reorganize for clarity, don't mirror the paper's section order.
- There is **no `prereq`, `example`, or `selfcheck` block** — the build rejects them. Fold background into prose; weave examples into `text`; the retained block types are `text`, `image`, `formula`, `table`, `attention`, `resources`.
- Prefer the paper's real figures (extracted via `scripts/pdf-figures.py`, inlined via `scripts/image-to-inline.py`); redraw as SVG only to simplify or when the paper has none. Every `image` block carries a real figure (`svg`/`canvas`/`src`) — never the legacy text `placeholder`.
- Formulas are always LaTeX via MathJax — never unicode pseudo-math (`x²`, `→`, `∑`) and never images of formulas. Use a `formula` block only for a load-bearing formula a reader would stumble on.
- Brief language matches the user's paper/request; template UI language is set via the `lang` field.
- The deliverable is `<brief-name>.html` built by `scripts/build.js` from the bundled `templates/template.html` — never hand-write the HTML shell, never modify `templates/template.html` itself.
- After the `.html` is validated and delivered, delete all temporary files (downloaded PDF, extracted figures, data expression, scratch files). Never remove the user's input materials or the skill's own files.

## References

- [references/pedagogy.md](references/pedagogy.md) — evidence-based writing rules: planning, explaining, examples, common-mistakes callouts.
- [references/format.md](references/format.md) — data schema, injection procedure, validation, template behaviors.
- [references/diagrams.md](references/diagrams.md) — figure decision rule (paper's figure first) and authoring rules for raster, SVG, and canvas.
