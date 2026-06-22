# Figures in a conspect — generate them, don't describe them

Every `image` block renders a real figure. Never ship a text description as the final
figure. In a paper brief the priority is reversed from a from-scratch note: **the
paper's own figure comes first** when it carries the idea. Use the first that fits:

1. **The paper's real figure (raster, inlined as WebP)** — extract it from the PDF with
   `scripts/pdf-figures.py`, then inline via `scripts/image-to-inline.py` into the
   block's `src`. Attribute the source in the `caption` (e.g. "Рис. 3 из статьи"). This
   is the default whenever the paper has a usable figure for the point you're making.

   **Extraction modes and coordinates.** Coordinates for `--rect`/`--auto` are PDF
   points (72 per inch), origin at the page **top-left**, matching what the Read tool
   shows. `--images` returns only *embedded rasters* — vector composites (radar,
   architecture, loss curves) will **not** appear there; use `--auto`/`--rect` for those.
   - `--auto` — best first try for vector figures. Pass the paper's own caption
     word(s) you saw while reading it: `--label Figure` (repeatable, e.g.
     `--label Fig. --label Рис.`) or a full `--caption-re '<regex>'`. It crops the
     region above each caption and **prints a ready `--rect` per figure**; if a crop is
     too tall or too tight, tweak that printed rect and re-run with `--rect`.
   - `--rect "page,x0,y0,x1,y1"` — render one explicit region (good after `--auto`).
   - `--pages 4` then crop, or `--grid 4` to render a page with a labeled point ruler
     when `--auto` finds no caption to anchor on.
   - `--images` — only when the figure you need is a genuine embedded raster.
2. **SVG** — a redrawn schematic, used to *simplify* a figure too cluttered to reuse, or
   when the paper has none. Inline `<svg>` markup in the block's `svg` field, up to ~300
   elements.
3. **Canvas + JS** — only for genuinely dense procedural figures the paper doesn't
   provide (thick scatter, heatmaps, fractals). A `draw(ctx, w, h, colors)` function
   source in the block's `canvas.draw` field.

One picture, one idea. A figure that just restates the prose adds clutter — cut it.

## Path 1 — SVG (default)

Drop raw `<svg>…</svg>` into the `svg` field (use `String.raw` so backslashes/`viewBox`
need no escaping). It is injected into the page DOM, so it themes for free.

Non-negotiable rules:

- **Always set `viewBox="0 0 W H"`** and `width` + `style="max-width:100%;height:auto"`
  so it scales and never overflows a narrow column.
- **Style inline** — presentation attributes (`fill`, `stroke`, `stroke-width`) or one
  inline `<style>`. External CSS does not apply.
- **System fonts only:** `font-family="system-ui, sans-serif"`.
- **Theme with the page:** use `stroke="currentColor"` / `fill="currentColor"` for all
  structure and text — it resolves to the conspect's `--ink` and flips in dark mode.
  Use **one** explicit accent colour for the single thing the figure is really about,
  picking a hex with contrast on **both** backgrounds (e.g. a warm `#e0823d` or a
  teal `#2f9e8f`). Never hard-code `black`/`white` for structure.
- **Be accessible:** root `role="img"` + `aria-label="…"`, and `<title>` as the first
  child.

Make it read cleanly: pad inside the `viewBox`, snap to a grid (multiples of 8/10),
one `stroke-width` reused, labels horizontal, arrowheads via `<marker>` for flows.

Reusable starting point (themes correctly when inlined in a block):

```html
<svg role="img" aria-label="DESCRIBE THE FIGURE" viewBox="0 0 240 160"
     width="240" style="max-width:100%;height:auto"
     xmlns="http://www.w3.org/2000/svg"
     font-family="system-ui, sans-serif" font-size="12">
  <title>SHORT TITLE</title>
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5"
            markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="currentColor"/>
    </marker>
  </defs>
  <g fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round">
    <rect x="20" y="20" width="80" height="40" rx="6"/>
    <rect x="140" y="20" width="80" height="40" rx="6"/>
    <line x1="100" y1="40" x2="140" y2="40" marker-end="url(#arrow)"/>
  </g>
  <g fill="currentColor" text-anchor="middle">
    <text x="60" y="44">Input</text>
    <text x="180" y="44">Output</text>
  </g>
  <circle cx="60" cy="100" r="8" fill="#e0823d"/> <!-- one meaningful accent -->
</svg>
```

In the block:

```js
{ type: "image",
  svg: String.raw`<svg …>…</svg>`,
  caption: "What the reader should take from it",
  aspect: "16/9" }
```

## Path 2 — Canvas (dense data only)

Reach for canvas **only** when an SVG would mean hundreds–thousands of elements
(thick scatter clouds, density heatmaps, fractals). Otherwise use SVG.

Put the **body of a draw function** in `canvas.draw`. The template calls it as
`draw(ctx, w, h, colors)` and **re-calls it on every theme toggle and resize**, so:

- `ctx` — a 2D context already scaled for devicePixelRatio; draw in CSS pixels.
- `w`, `h` — the canvas size in CSS pixels (set the block's `aspect` to control shape).
- `colors` — theme colours resolved from the page, keys: `ink`, `muted`, `bg`,
  `accent`. Use these instead of literals so the figure flips with the theme.
- **Be deterministic.** The function runs again on theme/resize — do not use
  `Math.random()` (the figure would jump). Derive positions from a formula or a fixed
  integer seed.
- Always give the block a meaningful `caption` (canvas has no built-in accessibility).

Example — a "two moons" scatter, themed and deterministic:

```js
{ type: "image",
  aspect: "16/9",
  caption: "Два «полумесяца» — типичное нелинейно разделимое распределение",
  canvas: { draw: String.raw`
    var pts = 700, cx = w/2, cy = h/2, r = Math.min(w,h)*0.32;
    function rnd(i){ var x = Math.sin(i*12.9898)*43758.5453; return x - Math.floor(x); }
    ctx.globalAlpha = 0.8;
    for (var i = 0; i < pts; i++) {
      var moon = i % 2;
      var t = Math.PI * rnd(i);
      var jx = (rnd(i+pts)-0.5)*r*0.35, jy = (rnd(i+2*pts)-0.5)*r*0.35;
      var x, y;
      if (moon === 0) { x = cx - r*0.5 + r*Math.cos(t); y = cy - r*0.2 + r*Math.sin(t); ctx.fillStyle = colors.ink; }
      else            { x = cx + r*0.5 - r*Math.cos(t); y = cy + r*0.2 - r*Math.sin(t); ctx.fillStyle = colors.accent; }
      ctx.beginPath(); ctx.arc(x+jx, y+jy, 2, 0, 2*Math.PI); ctx.fill();
    }
  ` } }
```

## Path 3 — Raster from the web (last resort)

Only when the figure is real imagery that genuinely cannot be drawn as vector — a
photograph, a medical scan, a screenshot of an artwork. Keep the conspect a single
HTML file by inlining the image as a WebP `data:` URI produced by the helper script.

Pipeline:

1. Find a suitable image. **Prefer openly-licensed sources** (Wikimedia Commons, public
   domain, CC) and record the source — put it in the figure `caption` or a `resources`
   block.
2. Run the script with the image URL (it downloads, resizes, re-encodes to WebP,
   base64-encodes, and prints the data URI):

   ```bash
   python3 scripts/image-to-inline.py "https://…/photo.jpg" --max-width 1200 --quality 80
   ```

   It can also take a local path. It prints the encoded size to stderr and **warns if
   the figure exceeds ~150 KB** — if so, lower `--max-width` (e.g. 900) or `--quality`
   (e.g. 70) and re-run.
3. Paste the printed `data:image/webp;base64,…` string into the block's `src`:

   ```js
   { type: "image",
     src: "data:image/webp;base64,UklGR... ",
     caption: "Источник: Wikimedia Commons (CC BY-SA)",
     aspect: "4/3" }
   ```

Budget: max width **1200 px**, quality **80**, **≤ ~150 KB** per figure. Inline raster
is heavy — never use it for something a vector figure could express.
