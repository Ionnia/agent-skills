---
name: write-conspect
description: Use when writing study notes (a conspect / конспект) on a topic or from user-provided materials — lecture notes, textbook passages, slides, or an exam question list. Plans a pedagogically ordered outline, researches and fact-checks each topic against high-quality sources, writes teacher-grade explanations, and renders them as a standalone HTML file from the bundled template.
license: MIT
metadata:
  author: Ionnia
  version: "0.2.0"
---

# Write Conspect

Approach this as the **best teacher in the world**, not a summarizer. A conspect is a self-contained set of study notes that explains complex things intuitively — never simplistically — and adds complexity bit by bit, assuming sensible prerequisites. The deliverable is a single `<conspect-name>.html` file built from the bundled `templates/template.html`.

Write all conspect content in the **language of the user's request and materials** (Russian request → Russian conspect). This file's workflow applies regardless of that language.

## Workflow

### 1. Understand the subject

Ingest everything the user provided (notes, textbook excerpts, slides, question lists). Get enough of a grip on the subject to structure it correctly: if your knowledge is thin, the field moves fast, or the materials reference things you can't ground, do **orientation-level research now** — a quick pass over authoritative sources (the quality bar is detailed in step 4) to map the subject's main parts and their dependencies. Never outline a subject you don't understand end to end. This pass is for _structure_ only; the deep, topic-by-topic fact-checking happens _after_ the outline, in step 4.

### 2. Decide the depth of elaboration

Choose how many levels of topic nesting the subject needs (1, 2, 3+):

- 2 levels: planimetry → triangles; recurrent networks → RNN.
- 3 levels: Deep Learning → CNN → Faster R-CNN.

Pick what is logical for the subject area. The smallest topic must not be trivially tiny, but it may be fairly large — one coherent idea a student would sit down and study in one go.

### 3. Outline top-down — before writing anything

Go from general to specific: define the high-level topics, then their subtopics, down to the smallest unit. Then order so that **every topic's prerequisites appear earlier** in the conspect. Each topic explicitly declares its prerequisites: internal links to earlier topics plus required external knowledge (e.g., "linear algebra — matrix multiplication"). Plan the complete outline before writing any topic content; the order is a teaching decision, not an afterthought.

### 4. Research each topic — before writing it

The outline maps the subject's _structure_; this step verifies its _content_. With the outline fixed, research every topic individually before you write it, rather than from memory. Research at **topic depth, not the whole subject at once** — targeted research keeps sources relevant to what you're about to write and surfaces the worked examples, edge cases, and misconceptions specific to that topic. For each topic:

- **Consult high-quality sources.** Prefer primary and authoritative ones — standard textbooks, peer-reviewed papers, official documentation/specifications, and reputable educational material. **Actively search educational websites**, especially **university course pages and their published lecture notes / study notes** (e.g. MIT OpenCourseWare, Stanford, CMU, HSE, ITMO course sites, `.edu`/`.ac.*` department pages, Khan Academy, Brilliant, and similar) — these are written to _teach_ the topic, so they surface the same intuitions, worked examples, and common misconceptions a conspect needs. Treat such material as authoritative for explanation and pedagogy, but still cross-check hard facts (formulas, constants, dates) against a primary source. Distrust SEO content farms, anonymous blogs, and AI-generated summaries.
- **Fact-check every claim you will teach** — definitions, formulas, constants, numbers, dates, cause-and-effect — against a source rather than trusting recall; for contested or fast-moving topics, go to the primary source.
- **Scale the effort to the stakes.** Corroborate load-bearing or contested claims across two independent sources; a single authoritative source is enough for settled, well-known facts. Don't burden a short conspect on a trivially familiar subject with ceremonial citation.
- **Handle gaps honestly.** Resolve contradictions before writing. If a claim genuinely can't be settled — or sources are offline, paywalled, or simply don't exist for a niche topic — write from best knowledge but flag it in the conspect and tell the user which topics weren't source-checked. Never present an unverified claim as established fact.

Record the key sources you relied on in a `resources` block (see [references/format.md](references/format.md)) so the reader can trace the material. Carry the verified facts — and the real misconceptions worth refuting (the misconceptions rule in step 5) — into the writing of that topic. Treat any examples you sketched at outline time as **provisional**: this research is where they get confirmed, corrected, or replaced.

### 5. Write each topic

Hold the bar: intuitively clear, never oversimplified. The core rules (full set with rationale in [references/pedagogy.md](references/pedagogy.md) — apply it throughout):

1. **Intuition first, formalism second.** Open with a concrete instance, picture, or analogy; only then the general definition. Say where the analogy breaks.
2. **One new idea at a time.** Working memory holds ~4 items; sequence so each paragraph adds a single new element on top of what's already established.
3. **Anchor new to known.** Begin each topic by connecting it to its prerequisites and stating what the reader will be able to do by the end.
4. **Explain why, not just what.** Mechanism and motivation beat bare facts; connect back to earlier topics explicitly.
5. **Worked examples for procedural and formula material** — every step shown and annotated with _why_; fade guidance in later examples (leave steps for the reader).
6. **Several concrete examples with different surface features**, so the idea transfers instead of binding to one case.
7. **Refute misconceptions head-on** where they really exist: state the wrong belief, why it's tempting, why it's wrong, then the correct version — that's what `attention` blocks are for.
8. **Self-check means retrieval, not recognition.** Questions force recall or application, answers included, an occasional question reaching back to earlier topics. Add them where a concept boundary warrants it — not mechanically everywhere.
9. **Dual coding.** Pair prose with a figure where a picture genuinely carries the idea. **Always generate a real figure**, never a text description — inline SVG by default, canvas for dense data, or an inlined WebP raster as a last resort. See [references/diagrams.md](references/diagrams.md) for the decision rule and authoring rules.
10. **Define every term at first use** — tooltips for in-place definitions; keep terminology consistent thereafter.
11. **Simplify the path, not the destination.** Never dumb down the final claim; build up to it.
12. **Cut tangents.** Everything must serve the topic's learning objective; extraneous detail is cognitive load.

### 6. Render the HTML

**Read [references/format.md](references/format.md) before producing any data** — it defines the exact `window.CONSPECT` schema, block types, math/tooltip conventions, the injection markers, and the build command. Then:

1. Build the data object for the whole conspect and write it to a temp file (e.g. `data.js`) as a single JS expression. For each `image` block, generate a real figure per [references/diagrams.md](references/diagrams.md) — SVG (default), canvas (dense data), or an inlined WebP from `scripts/image-to-inline.py` (real imagery only).
2. Run `node scripts/build.js data.js <conspect-name> [output-dir]`. It copies the template, splices the data, validates the structure, and writes `<conspect-name>.html` only if validation passes (it warns on any `image` block left without a figure).
3. If the build reports a validation error, fix `data.js` and re-run.
4. Deliver the file where the user expects output — pass the directory as `[output-dir]` or run the command there.

`templates/template.html` ships with a built-in sample conspect, so it can be opened directly for a design preview before building.

### 7. Clean up

The spliced `<conspect-name>.html` is fully self-contained — figures are inlined, no assets are referenced. So once it is validated and delivered, **delete every temporary file the build produced**, leaving the `.html` as the only artifact in the output location. Remove:

- the data expression temp file (`data.js` or whatever you named it);
- any source/intermediate images fed to `scripts/image-to-inline.py` (the WebP is already inlined into the HTML);
- any other scratch files, caches, or partial copies created in the output directory during the build.

Do **not** touch the user's own input materials or anything in the skill directory itself (`templates/template.html`, `scripts/`, `references/`). Verify after deletion that the output location contains the `.html` and nothing else the build created.

## Hard rules

- Always read `references/format.md` before writing any conspect data.
- Always plan the full outline (step 3) before writing any topic content.
- Always research each topic in high-quality sources and fact-check every taught claim before writing it (step 4), scaling effort to the stakes. Prefer primary/authoritative sources. Never present an unverified claim as established fact: if it can't be verified, flag it in the conspect rather than guessing.
- Prerequisite ordering is non-negotiable: no topic may depend on a later one. Every topic's first block is its `prereq` block.
- Formulas are always LaTeX via MathJax — never unicode pseudo-math (`x²`, `→`, `∑` in prose-math) and never images of formulas.
- For a load-bearing formula a student would genuinely stumble on, use a `formula` block (display formula + clickable `?` opening an intuitive explanation), not a bare `$$…$$`. Don't apply it to routine formulas. See [references/format.md](references/format.md).
- Every `image` block renders a real figure (`svg`/`canvas`/`src`) — never ship the legacy text `placeholder` in a new conspect. Default to inline SVG; see `references/diagrams.md`.
- `selfcheck` and `attention` blocks only where they earn their place; an attention block with no real pitfall is noise.
- Conspect language matches the user's materials/request; template UI language is set via the `lang` field.
- The deliverable is `<conspect-name>.html` built by `scripts/build.js` from the bundled `templates/template.html` — never hand-write the HTML shell, never modify `templates/template.html` itself.
- After the `.html` is validated and delivered, delete all temporary build files (data expression, intermediate/source images, scratch files). The `<conspect-name>.html` must be the only artifact left in the output location; never remove the user's input materials or the skill's own files.

## References

- [references/pedagogy.md](references/pedagogy.md) — evidence-based writing rules by phase: planning, explaining, examples, self-check design, common-mistakes callouts.
- [references/format.md](references/format.md) — data schema, injection procedure, validation, template behaviors.
- [references/diagrams.md](references/diagrams.md) — figure decision rule and authoring rules for SVG, canvas, and inlined raster.
