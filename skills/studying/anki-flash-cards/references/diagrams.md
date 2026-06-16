# Diagrams (prefer generating SVG)

Some ideas are carried by a picture, not a sentence — an anatomical part with its
location labelled, a state machine, the shape of a graph, the flow of a process,
the layers of a stack. When a diagram genuinely helps recall, **generate it as
inline SVG** and put it in the card. Don't force one: a diagram that just restates
the text adds clutter and review friction. One picture, one idea — same rule as the
cards themselves.

## Why SVG

- **Vector** — crisp at any zoom, on phone and desktop alike; no blurry raster.
- **Tiny and self-contained** — a few hundred bytes of text, no binary media file to
  ship or sync.
- **Lives in the field** — Anki renders fields as HTML (Chromium under the hood), so
  an inline `<svg>` element renders directly. No paperclip, no media folder, nothing
  to lose.
- **Theme-aware** — with `currentColor` it adapts to Anki's night mode for free
  (see [Make it survive night mode](#make-it-survive-night-mode)).

## How to put it in a card

**Inline in the field (preferred).** Drop the whole `<svg>…</svg>` straight into the
`Front`, `Back`, `Text`, or `Extra` HTML. Nothing else to manage:

```json
{
  "modelName": "Basic",
  "fields": {
    "Front": "Label the three layers of the OSI-style stack shown:",
    "Back": "<svg role=\"img\" aria-label=\"Three-layer stack\" viewBox=\"0 0 200 120\" width=\"200\" style=\"max-width:100%\"> … </svg>"
  }
}
```

**As a media file (only if reused across many cards).** Store the `.svg` once and
reference it. With the Anki MCP server use `storeMediaFile`; with AnkiConnect over
HTTP use the `storeMediaFile` action (`filename` + base64 `data`). Then reference it:

```html
<img src="my-diagram.svg" />
```

Either way the SVG **must be fully self-contained**: when an SVG is used as an `<img>`
source the browser sandboxes it — **JavaScript is disabled, and external stylesheets,
fonts, and images do not load**. Inline `<style>`/attributes only, system fonts only,
any raster embedded as a `data:` URL. (Inline-in-field SVG is laxer, but write it to
the sandbox rules anyway so it behaves identically everywhere.)

## SVG authoring rules

These are the non-negotiables for an SVG that renders correctly in every Anki client:

- **Always set `viewBox`** (`viewBox="0 0 W H"`). It defines the coordinate system and
  is what makes the image scale. Add a `width` (and `style="max-width:100%"`) so it
  never overflows a narrow phone card; let height follow the aspect ratio.
- **Style inline, never external.** Use presentation attributes (`fill`, `stroke`,
  `stroke-width`) or a single inline `<style>` block. External CSS will not load.
- **System fonts only.** `font-family="system-ui, sans-serif"`. Custom/web fonts won't
  load in the `<img>` sandbox; if you truly need text fidelity, convert text to paths.
- **No scripts, no animation deps.** JS won't run; you don't need it for a study figure.
- **Be accessible.** Give the root `role="img"` and `aria-label="…"`, and make
  `<title>` the **first child** (it also shows as a hover tooltip). Use `<desc>` for a
  longer description when the figure is complex:

  ```html
  <svg role="img" aria-label="Water cycle" viewBox="0 0 240 160" xmlns="http://www.w3.org/2000/svg">
    <title>Water cycle</title>
    <desc>Evaporation rising to clouds, condensation, then precipitation back to the sea.</desc>
    …
  </svg>
  ```

  Always include `xmlns="http://www.w3.org/2000/svg"` on the root when the SVG may be
  saved as a standalone `.svg` media file.

## Make it survive night mode

Anki users review in light **and** dark. A diagram with hard-coded `black` strokes
vanishes against a dark card. This is the single biggest reason to **inline the SVG in
the field** rather than reference it as an `<img>`:

- **`currentColor` — and inline the SVG.** Set strokes and text to
  `stroke="currentColor"` / `fill="currentColor"`. Inside an inline-in-field SVG these
  inherit the card's text colour, which Anki flips in night mode — so the diagram flips
  with it automatically. **This only works when the SVG is inlined in the field.** As an
  `<img src>` the SVG is an isolated document, so `currentColor` resolves to its own
  (black) colour and will *not* track the card — one more reason to prefer inlining. Use
  explicit colours only for genuinely meaningful accents (a highlighted node), picking
  ones with contrast on both backgrounds.
- **Don't rely on `prefers-color-scheme`.** It tracks the *operating system* theme, which
  is decoupled from Anki's manual night-mode toggle across desktop/AnkiMobile/AnkiDroid —
  so a card can be in Anki night mode while the SVG stays light. If you genuinely need
  themed *fills* (not just strokes/text), prefer driving them from `currentColor` too, or
  accept a single palette that has contrast on both backgrounds.

Test the card in both themes before you ship it.

## Making diagrams beautiful

A diagram is a teaching tool; legibility beats decoration. The principles that make
one read cleanly:

- **Breathing room.** Pad generously inside the `viewBox`; never let elements touch the
  edges or crowd each other. Empty space is what makes structure visible.
- **Align to a grid.** Snap positions and sizes to consistent increments (e.g. multiples
  of 8 or 10). Aligned, evenly-spaced elements look intentional; jitter looks broken.
- **Restrained palette.** One neutral for structure (lines, boxes) plus **one** accent
  for the thing the card is actually testing. More than ~3 colours and the eye loses the
  signal. Ensure every colour has contrast on its background.
- **Consistent line weight.** Pick one `stroke-width` (e.g. `2`) and reuse it; use a
  heavier weight only to signal genuine emphasis. Round line joins/caps
  (`stroke-linejoin="round"`) and slightly rounded box corners (`rx`) read as polished.
- **Clear hierarchy.** Show importance through size, weight, and colour — the main
  concept largest/boldest, supporting detail quieter. Don't make everything shout.
- **Readable type.** One sans-serif family, few sizes, generous size (it'll be viewed on
  a phone). Labels horizontal where possible; left-align related text.
- **Direct, labelled flow.** For processes, use arrowheads via `<marker>` and keep flow
  in one direction (top→bottom or left→right). Label the edges, not just the nodes, when
  the relationship matters.
- **One idea per figure.** If it needs a legend to decode, it's probably two diagrams.

## Reusable template

A self-contained starting point — night-mode-safe **when inlined in the field** (the
`currentColor` defaults track the card's text colour; see the night-mode section before
using it as an `<img>`). Replace the body; keep the root attributes and the
`currentColor` defaults.

```html
<svg role="img" aria-label="DESCRIBE THE FIGURE" viewBox="0 0 240 160"
     width="240" style="max-width:100%; height:auto"
     xmlns="http://www.w3.org/2000/svg"
     font-family="system-ui, sans-serif" font-size="12">
  <title>SHORT TITLE</title>

  <!-- arrowhead; fill currentColor so it matches the lines in light and dark -->
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5"
            markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="currentColor"/>
    </marker>
  </defs>

  <!-- structure: currentColor adapts to light/dark -->
  <g fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round">
    <rect x="20" y="20" width="80" height="40" rx="6"/>
    <rect x="140" y="20" width="80" height="40" rx="6"/>
    <line x1="100" y1="40" x2="140" y2="40" marker-end="url(#arrow)"/>
  </g>

  <!-- labels: fill with currentColor so they flip in night mode -->
  <g fill="currentColor" text-anchor="middle">
    <text x="60" y="44">Input</text>
    <text x="180" y="44">Output</text>
  </g>

  <!-- one meaningful accent (kept readable on both backgrounds) -->
  <circle cx="60" cy="100" r="8" fill="#3b82f6"/>
</svg>
```

## Worked example — a labelled flow on the back of a card

- Front: `What are the two phases of an HTTP request/response cycle, and what flows in each?`
- Back:
  ```html
  Client sends a <b>request</b>; server returns a <b>response</b>.
  <br>
  <svg role="img" aria-label="HTTP request and response between client and server"
       viewBox="0 0 260 130" width="260" style="max-width:100%; height:auto"
       xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="12">
    <title>HTTP request/response cycle</title>
    <defs>
      <marker id="a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
        <path d="M0,0 L10,5 L0,10 z" fill="currentColor"/>
      </marker>
    </defs>
    <g fill="none" stroke="currentColor" stroke-width="2">
      <rect x="20" y="45" width="70" height="45" rx="6"/>
      <rect x="170" y="45" width="70" height="45" rx="6"/>
      <line x1="92" y1="58" x2="168" y2="58" marker-end="url(#a)"/>
      <line x1="168" y1="78" x2="92" y2="78" marker-end="url(#a)"/>
    </g>
    <g fill="currentColor" text-anchor="middle">
      <text x="55" y="72">Client</text>
      <text x="205" y="72">Server</text>
      <text x="130" y="48">request</text>
      <text x="130" y="102">response</text>
    </g>
  </svg>
  ```
