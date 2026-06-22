# Conspect data format and rendering

The conspect is rendered by the bundled template at `templates/template.html`. You never edit the template's markup or scripts, and you never hand-write the data. Pipeline:

1. Build a durable store (`conspect.json`) with the `scripts/conspect.js` toolkit — one command per topic/block (see [Authoring via the toolkit](#authoring-via-the-toolkit) below for the schema each command produces and the full command reference).
2. Run `node scripts/conspect.js build <conspect-name> [output-dir]`. It serializes the store into the `window.CONSPECT` object (schema below), splices it between the injection markers in a copy of the template, validates the structure, and writes `<conspect-name>.html` only if validation passes.
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

**`prereq` — prerequisites.** Must be the **first block of every topic**, no exceptions.

```js
{ type: "prereq", items: [ { title: /* html */, url: /* optional string */, note: /* optional html */ } ] }
```

- `url: "#<topic-id>"` — internal link to an earlier topic; `url: "https://..."` — external link.
- An item **without** `url` is plain external knowledge, e.g. `{ title: "Линейная алгебра — умножение матриц" }`.
- `items: []` is valid and renders a "no prerequisites" stub — use it for the very first, foundation topics.

**`text` — main prose flow.**

```js
{ type: "text", html: /* html */ }
```

**`attention` — pitfalls / common-mistakes callout.**

```js
{ type: "attention", html: /* html */ }
```

**`example` — worked example.**

```js
{ type: "example", title: /* optional plain */, html: /* html */ }
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

**`selfcheck` — self-check questions with collapsible answers.**

```js
{ type: "selfcheck", items: [ { q: /* html */, a: /* optional html */ } ] }
```

The question number (`1.`, `2.`, …) is prepended automatically via a CSS counter as **inline** content. So `q` must **start with inline content — do not wrap it in `<p>`** (or any block element): a leading block pushes the number onto its own line. Inline markup (`<em>`, `<code>`, tooltips) and math `\( … \)` are fine. The answer `a` renders without a counter, so it may use `<p>` and other block elements freely.

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

## Authoring via the toolkit

You never hand-write the data. `scripts/conspect.js` builds and validates a durable JSON store (`conspect.json` by default; override with `--store <path>` on every command) one node at a time, then renders the HTML from it. The store mirrors the schema above, plus an internal `_id` on every block (e.g. `b3`) used for addressing; `_id` is stripped before the data is spliced into the template, so it never reaches the HTML.

**The escaping rule that makes this safe:** every HTML / LaTeX / SVG / canvas-source field is passed as a **raw literal via stdin or a `--*-in <file>` flag** — never typed into JSON. The tool stores it through `JSON.stringify`, which escapes backslashes correctly. So `\frac`, `\lim`, `\nabla` are written exactly as in TeX and the `String.raw`/JSON-backslash bug class **cannot occur**. Small scalars (`--id`, `--title`, `--caption`, `--tex`, `--url`, `--aspect`, `--lang`, `--align`) are ordinary flags; wrap shell-hostile values in single quotes.

**Multi-item blocks are built one item at a time** (`prereq`, `selfcheck`, `table`, `resources`): a create command makes the block, then repeated item/row commands add each entry — so each cell/answer still passes as a raw literal.

**Two validation tiers.** Each mutating command validates the affected block in isolation (e.g. a `formula` needs non-empty `tex`+`explain`; a `table` row must match the header count) and refuses the change with a precise error. `build`/`validate` then run the full pass over the whole store.

### Command reference

`node scripts/conspect.js <command> [flags]` — all commands accept `--store <path>`.

| Command | Purpose |
|---|---|
| `init --title <t> [--lang ru\|en]` | Create the store. |
| `set-meta [--title <t>] [--lang …]` | Change title / lang. |
| `tree` | Print structure only (ids, titles, block types + block ids). |
| `show <topic-id\|block-id>` | Print one node's full content. |
| `validate` | Full structural check without building. |
| `build <name> [outdir]` | Validate + render `<name>.html`. |
| `add-topic --title <t> [--id] [--parent <id>] [--pos end\|<n>\|before:<id>\|after:<id>]` | Add a topic/subtopic; auto-creates its first `prereq` block. |
| `edit-topic <id> [--title] [--id <new>]` | Rename / re-id (rewrites `#id` links). |
| `move-topic <id> [--parent <id>] [--pos …]` | Reparent / reorder. |
| `remove-topic <id>` | Delete topic + subtree (reports dangling links). |
| `set-prereq --topic <id> [--clear]` · `add-prereq-item --topic <id> --title <t> [--url] [--note]` | Fill the prereq block. |
| `add-text` · `add-attention` · `add-example [--title]` `--topic <id>` | Prose blocks; html via stdin/`--in`. |
| `add-formula --topic <id> --tex '…' [--explain-in <f>\|stdin] [--caption]` | Formula block. |
| `add-image --topic <id> (--svg <f>\|--canvas <f>\|--src <f>\|--raster <img>) [--caption] [--aspect]` | Figure block. |
| `add-selfcheck --topic <id>` · `add-selfcheck-item <block-id> [--a <ans>]` (q via stdin) | Self-check items. |
| `add-table --topic <id> --headers <h> … [--align …] [--row-header] [--caption]` · `add-table-row <block-id> --cell … --cell …` | Table rows. |
| `add-resources --topic <id>` · `add-resource-item <block-id> --title --url [--note]` | Further-reading list. |
| `add-block --type <t> --topic <id>` · `edit-block <block-id>` · `move-block <block-id> --topic <id>` · `remove-block <block-id>` | Generic block ops (escape hatch). |

`build` validates the whole store before writing: non-empty `title`, valid `lang`, ≥ 1 topic, unique kebab-case ids, `prereq` as each topic's first block, known block types, `formula` blocks with non-empty `tex`+`explain`, valid `table` shape, resolvable internal `#id` links, and a control-character scan. **On any failure it prints the error and writes no file (non-zero exit).** An `image` block with no `svg`/`canvas`/`src` prints a non-fatal `WARN` but still builds. On success it prints `OK: "<title>" — N topics → <path>`. The build is idempotent and repeatable.

## Template behaviors worth knowing

- **Theme toggle** — light/dark switch built in; both themes are styled, no data needed.
- **Per-conspect resume** — the last visited topic is stored in localStorage namespaced by `title` and restored on reopen. Changing the title resets the reading position (and the palette).
- **Reader settings** — font, size, and column width are user-adjustable and persisted globally across all conspects.
- **Backlight palette** — auto-generated deterministically from `title`. There is no palette field; distinct titles get distinct palettes.
- **Prev/next navigation** — follows depth-first topic order (parent, then its children, then the next sibling), i.e. exactly the order of your outline.
- **Unknown block types** — render as a visible warning box rather than failing silently; if you see one, you misspelled a `type`.

## Complete example

Two top-level topics, one child topic, every block type used, real LaTeX. This is the **resulting data shape** the toolkit assembles in `conspect.json` and splices between the markers (shown with `String.raw` literals for readability) — you don't type it by hand; you produce it with `conspect.js` commands, which store each field as plain JSON.

```js
{
  title: "Производная: интуиция и техника",
  lang: "ru",
  topics: [
    {
      id: "limit-idea",
      title: "Предел функции",
      blocks: [
        {
          type: "prereq",
          items: [
            { title: "Школьная алгебра — функции и их графики" }
          ]
        },
        {
          type: "text",
          html: String.raw`
<p>Иногда нас интересует не значение функции в точке, а то, к чему она
<strong>стремится</strong> вблизи точки. Это и есть
<span class="tip" data-tip='Число, к которому значения f(x) подходят сколь угодно близко, когда x приближается к a.'>предел</span>:
запись \( \lim_{x \to a} f(x) = L \) читается как «при x, стремящемся к a,
f(x) стремится к L».</p>
<p>Ключевая интуиция: предел описывает <em>поведение рядом с точкой</em>,
а не в самой точке — значение \( f(a) \) может вообще не существовать.</p>`
        },
        {
          type: "image",
          svg: `<svg role="img" aria-label="График функции с выколотой точкой в x = a; ветви слева и справа сходятся к высоте L" viewBox="0 0 240 160" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif" font-size="11">
  <title>Предел существует, хотя значения в точке нет</title>
  <line x1="32" y1="18" x2="32" y2="140" stroke="#888"/>
  <line x1="32" y1="140" x2="222" y2="140" stroke="#888"/>
  <line x1="32" y1="62" x2="124" y2="62" stroke="#bbb" stroke-dasharray="3 3"/>
  <line x1="124" y1="62" x2="124" y2="140" stroke="#bbb" stroke-dasharray="3 3"/>
  <path d="M42 122 Q104 64 124 62" fill="none" stroke="#4060c0" stroke-width="2"/>
  <path d="M124 62 Q150 60 204 104" fill="none" stroke="#4060c0" stroke-width="2"/>
  <circle cx="124" cy="62" r="3.6" fill="#fff" stroke="#4060c0" stroke-width="2"/>
  <text x="18" y="66">L</text>
  <text x="120" y="153">a</text>
</svg>`,
          caption: "Предел существует, хотя значения в точке нет"
        },
        {
          type: "selfcheck",
          items: [
            {
              q: String.raw`Чему равен \( \lim_{x \to 2} \frac{x^2 - 4}{x - 2} \), хотя функция в точке 2 не определена?`,
              a: String.raw`<p>Сократите: \( \frac{(x-2)(x+2)}{x-2} = x + 2 \) при \( x \neq 2 \), значит предел равен 4.</p>`
            }
          ]
        }
      ]
    },
    {
      id: "derivative",
      title: "Производная",
      blocks: [
        {
          type: "prereq",
          items: [
            { title: "Предел функции", url: "#limit-idea", note: "вся конструкция производной — это один предел" }
          ]
        },
        {
          type: "text",
          html: String.raw`
<p>Средняя скорость изменения функции на отрезке — это наклон секущей:
\( \frac{f(x+h) - f(x)}{h} \). Сужая отрезок, получаем мгновенную скорость:</p>
$$ f'(x) = \lim_{h \to 0} \frac{f(x+h) - f(x)}{h} $$
<p>Это предел из темы <a href="#limit-idea">«Предел функции»</a>,
применённый к наклону секущей.</p>`
        },
        {
          type: "attention",
          html: String.raw`<p><strong>Непрерывность не означает дифференцируемость.</strong>
Кажется, что у непрерывной функции всегда есть производная — но
\( f(x) = |x| \) непрерывна в нуле, а производной там не имеет: пределы
наклонов слева и справа равны −1 и 1 и не совпадают.</p>`
        },
        {
          type: "example",
          title: "Производная x² по определению",
          html: String.raw`
<p>Шаг 1 — подставляем в определение (другого инструмента пока нет):</p>
$$ f'(x) = \lim_{h \to 0} \frac{(x+h)^2 - x^2}{h} $$
<p>Шаг 2 — раскрываем квадрат, чтобы выделить и сократить h:</p>
$$ \lim_{h \to 0} \frac{2xh + h^2}{h} = \lim_{h \to 0} (2x + h) $$
<p>Шаг 3 — после сокращения подстановка h = 0 уже законна: \( f'(x) = 2x \).</p>`
        },
        {
          type: "table",
          headers: ["Функция", "Производная"],
          rows: [
            [String.raw`\( x^n \)`, String.raw`\( n x^{n-1} \)`],
            [String.raw`\( \sin x \)`, String.raw`\( \cos x \)`],
            [String.raw`\( e^x \)`, String.raw`\( e^x \)`]
          ],
          rowHeader: true,
          caption: "Производные основных функций"
        },
        {
          type: "resources",
          items: [
            {
              title: "3Blue1Brown — Essence of Calculus",
              url: "https://www.3blue1brown.com/topics/calculus",
              note: "визуальная интуиция производной"
            }
          ]
        }
      ],
      children: [
        {
          id: "chain-rule",
          title: "Производная сложной функции",
          blocks: [
            {
              type: "prereq",
              items: [
                { title: "Производная", url: "#derivative" }
              ]
            },
            {
              type: "text",
              html: String.raw`<p>Если \( y = f(g(x)) \), скорости умножаются:
внешняя функция «растягивает» изменение внутренней. Отсюда
\( \bigl(f(g(x))\bigr)' = f'(g(x)) \cdot g'(x) \).</p>`
            },
            {
              type: "selfcheck",
              items: [
                {
                  q: String.raw`Найдите производную \( \sin(x^2) \).`,
                  a: String.raw`<p>\( \cos(x^2) \cdot 2x \) — производная внешней функции в точке «внутренняя», умноженная на производную внутренней.</p>`
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```
