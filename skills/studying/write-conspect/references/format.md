# Conspect data format and rendering

The conspect is rendered by the bundled `template.html`. You never edit the template's markup or scripts — you copy it and replace one data expression. Pipeline:

1. Author the data as a single JS expression evaluating to the `window.CONSPECT` object (schema below).
2. Copy `template.html` (from this skill's directory) to `<conspect-name>.html`.
3. Splice the expression between the injection markers (procedure below).
4. Validate (command below) and open the file in a browser to verify.

`template.html` contains a built-in sample conspect, so you can open it as-is to preview the design before injecting anything.

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

**`selfcheck` — self-check questions with collapsible answers.**

```js
{ type: "selfcheck", items: [ { q: /* html */, a: /* optional html */ } ] }
```

The question number (`1.`, `2.`, …) is prepended automatically via a CSS counter as **inline** content. So `q` must **start with inline content — do not wrap it in `<p>`** (or any block element): a leading block pushes the number onto its own line. Inline markup (`<em>`, `<code>`, tooltips) and math `\( … \)` are fine. The answer `a` renders without a counter, so it may use `<p>` and other block elements freely.

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

## Injection

`template.html` contains, exactly once:

```
window.CONSPECT =
/*__CONSPECT_DATA_START__*/
{ ...built-in sample... }
/*__CONSPECT_DATA_END__*/
;
```

Replace everything strictly **between** the two marker comments with your data expression. Both markers must survive the splice (so the file can be re-injected later). Do not add a trailing semicolon to the expression — the `;` after the end marker already terminates the statement.

### Splice procedure

1. Write the data expression (just the expression, nothing else) to a temp file, e.g. `data.js`.
2. Copy the template and splice:

```bash
cp /path/to/skill/write-conspect/template.html "<conspect-name>.html"

python3 - "<conspect-name>.html" data.js <<'PYEOF'
import sys
out_path, data_path = sys.argv[1], sys.argv[2]
START = "/*__CONSPECT_DATA_START__*/"
END = "/*__CONSPECT_DATA_END__*/"
src = open(out_path, encoding="utf-8").read()
data = open(data_path, encoding="utf-8").read().strip()
assert src.count(START) == 1 and src.count(END) == 1, "markers must appear exactly once"
pre, rest = src.split(START)
_mid, post = rest.split(END)
open(out_path, "w", encoding="utf-8").write(pre + START + "\n" + data + "\n" + END + post)
print("spliced", len(data), "chars into", out_path)
PYEOF
```

### Validation

Run this against the spliced file. It extracts the expression between the markers, evaluates it, and asserts the structural invariants (non-empty topics, unique kebab-case ids, `prereq` first, known block types). It also fails on control characters inside content strings — the symptom of the JSON-backslash bug above, reported with the exact field path.

```bash
node -e '
const fs = require("fs");
const src = fs.readFileSync(process.argv[1], "utf8");
const a = src.split("/*__CONSPECT_DATA_START__*/");
const b = a.length === 2 ? a[1].split("/*__CONSPECT_DATA_END__*/") : [];
if (a.length !== 2 || b.length !== 2) throw new Error("injection markers missing or duplicated");
const data = new Function("return (" + b[0] + ")")();
if (typeof data.title !== "string" || !data.title) throw new Error("title must be a non-empty string");
if (data.lang !== undefined && !["ru", "en"].includes(data.lang)) throw new Error("lang must be ru or en");
if (!Array.isArray(data.topics) || data.topics.length === 0) throw new Error("topics must be a non-empty array");
const known = ["prereq", "text", "attention", "example", "image", "selfcheck", "resources"];
const ids = [];
(function walk(topics) {
  for (const t of topics) {
    if (!/^[a-z0-9-]+$/.test(t.id || "")) throw new Error("bad topic id: " + JSON.stringify(t.id));
    ids.push(t.id);
    if (typeof t.title !== "string" || !t.title) throw new Error(t.id + ": title missing");
    if (!Array.isArray(t.blocks) || t.blocks.length === 0 || t.blocks[0].type !== "prereq")
      throw new Error(t.id + ": first block must be type prereq");
    for (const blk of t.blocks) {
      if (!known.includes(blk.type)) throw new Error(t.id + ": unknown block type " + JSON.stringify(blk.type));
      if (blk.type === "image" && !blk.svg && !blk.canvas && !blk.src)
        console.warn("WARN " + t.id + ": image block has no svg/canvas/src (placeholder is deprecated)");
    }
    if (t.children) walk(t.children);
  }
})(data.topics);
if (new Set(ids).size !== ids.length) throw new Error("duplicate topic ids");
(function scan(v, path) {
  if (typeof v === "string") {
    if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(v))
      throw new Error("control character in " + path + " - a LaTeX backslash was eaten by JSON escaping (e.g. \"\\frac\" parsed as formfeed+rac). Fix the formulas or switch to String.raw.");
  } else if (v && typeof v === "object") {
    for (const k of Object.keys(v)) scan(v[k], path + "." + k);
  }
})(data, "data");
console.log("OK:", JSON.stringify(data.title), "-", ids.length, "topics, ids unique, structure valid");
' "<conspect-name>.html"
```

If validation fails, fix `data.js` and re-run the splice (the markers survive, so splicing is repeatable).

## Template behaviors worth knowing

- **Theme toggle** — light/dark switch built in; both themes are styled, no data needed.
- **Per-conspect resume** — the last visited topic is stored in localStorage namespaced by `title` and restored on reopen. Changing the title resets the reading position (and the palette).
- **Reader settings** — font, size, and column width are user-adjustable and persisted globally across all conspects.
- **Backlight palette** — auto-generated deterministically from `title`. There is no palette field; distinct titles get distinct palettes.
- **Prev/next navigation** — follows depth-first topic order (parent, then its children, then the next sibling), i.e. exactly the order of your outline.
- **Unknown block types** — render as a visible warning box rather than failing silently; if you see one, you misspelled a `type`.

## Complete example

Two top-level topics, one child topic, every block type used, real LaTeX, `String.raw` form. This entire object literal is what goes between the markers.

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
