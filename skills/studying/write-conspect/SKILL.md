---
name: write-conspect
description: Use when writing study notes (a conspect / конспект) on a topic or from user-provided materials — lecture notes, textbook passages, slides, or an exam question list. Plans a pedagogically ordered outline, writes teacher-grade explanations, and renders them as a standalone HTML file from the bundled template.
license: MIT
metadata:
  author: Ionnia
  version: "0.0.1"
---

# Write Conspect

Approach this as the **best teacher in the world**, not a summarizer. A conspect is a self-contained set of study notes that explains complex things intuitively — never simplistically — and adds complexity bit by bit, assuming sensible prerequisites. The deliverable is a single `<conspect-name>.html` file built from the bundled `template.html`.

Write all conspect content in the **language of the user's request and materials** (Russian request → Russian conspect). This file's workflow applies regardless of that language.

## Workflow

### 1. Understand the subject

Ingest everything the user provided (notes, textbook excerpts, slides, question lists). If your knowledge of the topic is thin, the field moves fast, or the user's materials reference things you can't ground — **web-search before planning**. Never outline a subject you don't understand end to end.

### 2. Decide the depth of elaboration

Choose how many levels of topic nesting the subject needs (1, 2, 3+):

- 2 levels: planimetry → triangles; recurrent networks → RNN.
- 3 levels: Deep Learning → CNN → Faster R-CNN.

Pick what is logical for the subject area. The smallest topic must not be trivially tiny, but it may be fairly large — one coherent idea a student would sit down and study in one go.

### 3. Outline top-down — before writing anything

Go from general to specific: define the high-level topics, then their subtopics, down to the smallest unit. Then order so that **every topic's prerequisites appear earlier** in the conspect. Each topic explicitly declares its prerequisites: internal links to earlier topics plus required external knowledge (e.g., "linear algebra — matrix multiplication"). Plan the complete outline before writing any topic content; the order is a teaching decision, not an afterthought.

### 4. Write each topic

Hold the bar: intuitively clear, never oversimplified. The core rules (full set with rationale in [references/pedagogy.md](references/pedagogy.md) — apply it throughout):

1. **Intuition first, formalism second.** Open with a concrete instance, picture, or analogy; only then the general definition. Say where the analogy breaks.
2. **One new idea at a time.** Working memory holds ~4 items; sequence so each paragraph adds a single new element on top of what's already established.
3. **Anchor new to known.** Begin each topic by connecting it to its prerequisites and stating what the reader will be able to do by the end.
4. **Explain why, not just what.** Mechanism and motivation beat bare facts; connect back to earlier topics explicitly.
5. **Worked examples for procedural and formula material** — every step shown and annotated with _why_; fade guidance in later examples (leave steps for the reader).
6. **Several concrete examples with different surface features**, so the idea transfers instead of binding to one case.
7. **Refute misconceptions head-on** where they really exist: state the wrong belief, why it's tempting, why it's wrong, then the correct version — that's what `attention` blocks are for.
8. **Self-check means retrieval, not recognition.** Questions force recall or application, answers included, an occasional question reaching back to earlier topics. Add them where a concept boundary warrants it — not mechanically everywhere.
9. **Dual coding.** Pair prose with a figure where a picture genuinely carries the idea; without an image source, write a precise placeholder describing the intended figure.
10. **Define every term at first use** — tooltips for in-place definitions; keep terminology consistent thereafter.
11. **Simplify the path, not the destination.** Never dumb down the final claim; build up to it.
12. **Cut tangents.** Everything must serve the topic's learning objective; extraneous detail is cognitive load.

### 5. Render the HTML

**Read [references/format.md](references/format.md) before producing any data** — it defines the exact `window.CONSPECT` schema, block types, math/tooltip conventions, the injection markers, and a validation command. Then:

1. Build the data object for the whole conspect.
2. Copy the bundled `template.html` to `<conspect-name>.html` and splice the data between the injection markers as described in format.md.
3. Validate with the command from format.md.
4. Deliver the file where the user expects output — ask or infer from context.

`template.html` ships with a built-in sample conspect, so it can be opened directly for a design preview before injection.

## Hard rules

- Always read `references/format.md` before writing any conspect data.
- Always plan the full outline (step 4) before writing any topic content.
- Prerequisite ordering is non-negotiable: no topic may depend on a later one. Every topic's first block is its `prereq` block.
- Formulas are always LaTeX via MathJax — never unicode pseudo-math (`x²`, `→`, `∑` in prose-math) and never images of formulas.
- `selfcheck` and `attention` blocks only where they earn their place; an attention block with no real pitfall is noise.
- Conspect language matches the user's materials/request; template UI language is set via the `lang` field.
- The deliverable is `<conspect-name>.html` built from a copy of the bundled `template.html` — never hand-write the HTML shell, never modify `template.html` itself.

## References

- [references/pedagogy.md](references/pedagogy.md) — evidence-based writing rules by phase: planning, explaining, examples, self-check design, common-mistakes callouts.
- [references/format.md](references/format.md) — data schema, injection procedure, validation, template behaviors.
