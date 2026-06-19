# Conspect data format and rendering

The conspect is rendered by the bundled template at `templates/template.html`. You never edit the template's markup or scripts — the build script copies it and replaces one data expression. Pipeline:

1. Author the data as a single JS expression evaluating to the `window.CONSPECT` object (schema below), and write it to a temp file (e.g. `data.js`).
2. Run `node scripts/build.js <data.js> <conspect-name> [output-dir]`. The script copies the template, splices the data between the injection markers, validates the structure, and writes `<conspect-name>.html` only if validation passes.
3. Open the file in a browser to verify.

`templates/template.html` contains a built-in sample conspect, so you can open it as-is to preview the design before building anything.

## `window.CONSPECT` object

| Field | Type | Notes |
|---|---|---|
| `title` | string, required | Conspect name. Shown in the header and as `document.title`. Also seeds the auto-generated backlight palette and the localStorage namespace — a distinct title gets a distinct palette and its own saved reading position. |
| `lang` | `"ru"` \| `"en"`, optional | Language of the template's UI chrome (buttons, labels); also sets `<html lang>`. Default `"ru"`. |
| `topics` | `Topic[]`, required, ≥ 1 | Ordered — reading order is the pedagogical order. |

### Topic

| Field | Type | Notes |
|---|---|---|
| `id` | string, required | Unique across the **whole tree** (parents and children included). Kebab-case, `[a-z0-9-]` only. Used for hash routing and internal `<a href="#id">` links. |
| `title` | string, required | Plain text. |
| `blocks` | `Block[]`, required | The article content, rendered vertically in order. |
| `children` | `Topic[]`, optional | Subtopics; arbitrary nesting (typically 1–3 levels). |

### Blocks

A block is a discriminated union on `type`. Fields marked *html* accept the HTML subset described below; fields marked *plain* are plain text.

**`text` — main prose flow.**

```js
{ type: "text", html: /* html */ }
```

**`attention` — pitfalls / common-mistakes callout.**

```js
{ type: "attention", html: /* html */ }
```

**`image` — figure. Always carries a real figure, never a description.** Exactly one of `svg` / `canvas` / `src` is present.

```js
{ type: "image",
  svg:    /* html: raw <svg>…</svg> markup (DEFAULT — schematic figures)        */,
  canvas: { draw: /* js: source of a function (ctx, w, h, colors) for dense data */ },
  src:    /* string: "data:image/webp;base64,…" from scripts/image-to-inline.py  */,
  caption: /* optional plain */, aspect: /* optional, e.g. "16/9" — sizes canvas/src */ }
```

Choose the mechanism by the decision rule in [diagrams.md](diagrams.md): **SVG** for schematic figures (default), **canvas** only for genuinely dense procedural data (thick scatter, heatmaps, fractals), **src** (inlined WebP via `scripts/image-to-inline.py`) only for real imagery that cannot be drawn as vector. The legacy `placeholder` field still renders for old conspects but must not be used in new ones.

**`formula` — display formula with an on-demand intuitive explanation.** Renders the centered formula with a small `?` icon beside it; clicking the icon opens a dialog showing the formula on top, a divider, then the explanation.

```js
{ type: "formula",
  tex:     /* string: plain LaTeX body, NO delimiters — the template wraps it in $$…$$ */,
  explain: /* html: the intuitive explanation (analogy, prose, math allowed) */,
  caption: /* optional plain: shown under the formula in-flow */ }
```

- `tex` is the **LaTeX body only** — write `\frac{1}{m}\sum …`, not `$$ \frac{1}{m}\sum … $$`. The template adds the `$$ … $$`.
- `explain` is an html-with-math field — same subset as a `text` block: paragraphs, lists, `<blockquote>`, inline `\( … \)` and display `$$ … $$`, tooltips. This is where the analogy-driven, plain-words explanation lives. Required and non-empty (an empty `explain` defeats the block's purpose — use a plain `$$…$$` in a `text` block instead).
- Use it **only for a load-bearing formula a student would genuinely stumble on**, not for every formula. Ordinary formulas stay as `$$…$$` inside `text` blocks. Display formulas only; one block holds exactly one formula.

**`table` — tabular data (comparison tables, parameter lists, lookup grids).**

```js
{ type: "table",
  headers: [ /* html */, … ],          // required, ≥1 — the top header row
  rows:    [ [ /* html */, … ], … ],   // required, ≥1 — each row length === headers.length
  align:   [ "left" | "center" | "right", … ],  // optional — length === headers.length
  rowHeader: true,                      // optional, default false
  caption: /* optional plain text */ }
```

- **Cells are html** — same subset as a `text` block (inline math `\( … \)`, tooltips, `<code>`, `<strong>`/`<em>`, links). Author each cell with `` String.raw`…` ``. Keep cells compact — a large display formula belongs in a `formula` block, not a cell.
- `rows` are **positional arrays**; every row must have exactly `headers.length` cells (the build fails otherwise).
- `align` (optional) sets per-column alignment; a right-aligned column also gets tabular figures. `rowHeader: true` renders each row's first cell as a `<th scope="row">` with header emphasis — use it for comparison tables where every row is a labeled item.
- `caption` is plain text, shown under the table like a figure caption. Wide tables scroll horizontally on narrow screens automatically — you never author overflow markup.

**`resources` — further reading. Place last in a topic's blocks.**

```js
{ type: "resources", items: [ { title: /* plain */, url: /* string */, note: /* optional plain */ } ] }
```

## HTML fields

Allowed tags in *html*-typed fields: `p`, `ul`, `ol`, `li`, `strong`, `em`, `a`, `br`, `code`, `pre`, `sub`, `sup`, `table`/`thead`/`tbody`/`tr`/`th`/`td`, `blockquote`, and the tooltip span below.

- **Tooltips (term definitions):** `<span class="tip" data-tip='tooltip HTML, math allowed'>term</span>` — shows the definition on hover/tap. Quote `data-tip` with single quotes and use double quotes (or none) inside it.
- **Math (MathJax v3):** inline `\( ... \)`, display `$$ ... $$`. All formulas go through MathJax — never unicode pseudo-math, never images of formulas.
- **Internal topic links:** `<a href="#topic-id">` where `topic-id` is an existing topic `id`.
- **Code:** `<pre><code>...</code></pre>` for blocks, `<code>` inline. Escape HTML inside code as usual (`&lt;`, `&amp;`).

> Raw `<table>` markup inside a `text` block still works and inherits the same styling, but for real tabular data prefer the dedicated **`table` block** (above) — it validates row/column counts, supports alignment and row headers, and adds the responsive scroll container for you.

## Authoring the data expression

The data is **one JS expression** (what goes between the markers — see below). Two legal styles:

### Recommended: object literal with `String.raw`

Write a plain JS object literal and wrap **every html field** in `` String.raw`...` ``. Inside `String.raw`, backslashes are literal, so LaTeX needs no escaping at all — `\frac`, `\lim`, `\nabla` are written exactly as in TeX.

Two characters to avoid inside `String.raw` strings (they still have meaning in template literals):

- backtick — would terminate the string; write `&#96;` in HTML content instead;
- `${` — would start interpolation; write `&#36;{` instead. (A lone `$`, including `$$ ... $$` math delimiters, is fine.)

### Legal but dangerous: pure JSON

Pure JSON is also a valid JS expression — but then **every LaTeX backslash must be doubled** (`\\frac`, `\\lim`).

> **WARNING — the #1 authoring bug.** `\f`, `\n`, `\t`, `\b`, `\r` are *valid JSON escapes*. If you write `"\frac{a}{b}"`, `"\nabla"`, `"\theta"`, `"\beta"`, `"\rho"` with single backslashes, JSON parses them **without any error** into form-feed + `rac{a}{b}`, newline + `abla`, tab + `heta`, backspace + `eta`, carriage-return + `ho`. The file renders with silently broken formulas and no diagnostic. If you author in JSON, double every single backslash and re-read every formula afterwards. Better: use the `String.raw` route and the problem cannot occur.

## Building the file

`templates/template.html` contains, exactly once:

```
window.CONSPECT =
/*__CONSPECT_DATA_START__*/
{ ...built-in sample... }
/*__CONSPECT_DATA_END__*/
;
```

`scripts/build.js` replaces everything strictly **between** the two marker comments with your data expression, preserving both markers (so the file can be rebuilt later), then validates the result. Do not add a trailing semicolon to the expression — the `;` after the end marker already terminates the statement.

```bash
node scripts/build.js <data.js> <conspect-name> [output-dir]
```

- `<data.js>` — a file containing **only** the data expression (the object literal, no `window.CONSPECT =`, no trailing semicolon).
- `<conspect-name>` — the output filename stem; the script writes `<conspect-name>.html`. Independent of the data's `title`.
- `[output-dir]` — optional; writes there if given, else the current directory.

The script validates structure before writing: non-empty `title`, valid `lang`, ≥ 1 topic, each topic's `blocks` a non-empty array, unique kebab-case ids, only retained block types (a `prereq`, `example`, or `selfcheck` block is rejected with a clear error), `formula` blocks with non-empty `tex` + `explain`, valid `table` shape, and a control-character scan that catches the JSON-backslash bug above (reported with the exact field path). **On any validation failure it prints the error and writes no file (non-zero exit)** — so a broken build never produces an HTML file. An `image` block with no `svg`/`canvas`/`src` prints a non-fatal `WARN` but still builds. On success it prints `OK: "<title>" — N topics → <path>`.

If validation fails, fix `data.js` and re-run — the build is idempotent and repeatable.

## Template behaviors worth knowing

- **Theme toggle** — light/dark switch built in; both themes are styled, no data needed.
- **Per-conspect resume** — the last visited topic is stored in localStorage namespaced by `title` and restored on reopen. Changing the title resets the reading position (and the palette).
- **Reader settings** — font, size, and column width are user-adjustable and persisted globally across all conspects.
- **Backlight palette** — auto-generated deterministically from `title`. There is no palette field; distinct titles get distinct palettes.
- **Prev/next navigation** — follows depth-first topic order (parent, then its children, then the next sibling), i.e. exactly the order of your outline.
- **Unknown block types** — render as a visible warning box rather than failing silently; if you see one, you misspelled a `type`.

## Complete example

Two topics, every retained block type, real LaTeX, `String.raw` form. This whole object literal is what goes between the markers.

```js
{
  title: "Dropout — кратко",
  lang: "ru",
  topics: [
    {
      id: "idea",
      title: "Идея: выключаем нейроны случайно",
      blocks: [
        {
          type: "text",
          html: String.raw`
<p>Большие сети переобучаются: нейроны «сговариваются», подстраиваясь друг под друга.
<span class="tip" data-tip='Регуляризация: во время обучения каждый нейрон с вероятностью p обнуляется.'>Dropout</span>
на каждом шаге обучения случайно выключает часть нейронов, заставляя сеть не полагаться
на отдельные связи.</p>` },
        {
          type: "formula",
          tex: String.raw`\tilde{h} = \frac{1}{1-p}\, m \odot h, \qquad m_i \sim \mathrm{Bernoulli}(1-p)`,
          explain: String.raw`<p>Маска \( m \) случайно зануляет компоненты \( h \); деление на \( 1-p \)
сохраняет средний масштаб активаций, чтобы на инференсе (где dropout выключен) ничего не сдвигалось.</p>`,
          caption: String.raw`Обучение с маской; на инференсе используется полный слой.` },
        {
          type: "image",
          svg: String.raw`<svg role="img" aria-label="Слева полная сеть, справа та же сеть с двумя выключенными нейронами" viewBox="0 0 240 120" width="240" style="max-width:100%;height:auto" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="11"><title>Dropout</title><g fill="currentColor"><circle cx="40" cy="30" r="7"/><circle cx="40" cy="60" r="7"/><circle cx="40" cy="90" r="7"/></g><g fill="currentColor"><circle cx="190" cy="30" r="7"/><circle cx="190" cy="60" r="7" fill="none" stroke="#e0823d"/><circle cx="190" cy="90" r="7"/></g><text x="40" y="112" text-anchor="middle">полная</text><text x="190" y="112" text-anchor="middle" fill="#e0823d">dropout</text></svg>`,
          caption: "Часть нейронов выключается на шаге обучения." }
      ]
    },
    {
      id: "effect",
      title: "Эффект и режимы",
      blocks: [
        {
          type: "attention",
          html: String.raw`<p><strong>Dropout не применяют на инференсе.</strong> Кажется логичным «усреднить шум»,
выключая нейроны и при предсказании, — но это добавляет дисперсию без пользы. На инференсе слой работает целиком,
а компенсация масштаба уже заложена в обучении делением на \( 1-p \).</p>` },
        {
          type: "table",
          headers: ["Режим", "Маска", "Масштаб"],
          rows: [
            [String.raw`Обучение`, String.raw`случайная`, String.raw`\( /(1-p) \)`],
            [String.raw`Инференс`, String.raw`нет`, String.raw`\( 1 \)`]
          ],
          align: ["left", "left", "center"],
          rowHeader: true,
          caption: "Поведение слоя в двух режимах." },
        {
          type: "resources",
          items: [
            { title: "Srivastava et al. — Dropout (JMLR 2014)", url: "https://jmlr.org/papers/v15/srivastava14a.html", note: "первоисточник" }
          ] }
      ]
    }
  ]
}
```
