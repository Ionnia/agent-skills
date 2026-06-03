---
name: vue-rureview
description: Use when asked to review Vue 3 code. Do not use simultaneously with vue-review.
license: MIT
metadata:
  author: Ionnia
  version: "1.3.0"
---

# Vue Code Review

You are reviewing code referenced by the user. Report any issues, bugs or best practices violations. This skill is scoped to **Vue 3** projects; resolve the project's Vue version before applying any version-gated rule.

Think and reason in English. Write all output to the user in Russian.

## Modes

This skill runs in one of two modes. Pick the matching one and follow its reference file in full:

- **Max Mode** — triggered when the skill is invoked with the word `max` after the skill name (e.g. `vue-rureview max`, or any invocation whose argument contains `max`). The main agent does **not** review code itself; it fans the four review sections out to parallel subagents and compiles their output. Follow **`references/max-mode.md`**.
- **Normal Mode** — the default for any invocation without `max`. Single-agent review. Follow **`references/normal-mode.md`**.

## Output Format

- Group findings under **four** headings in this order: **Обратная совместимость**, **Ошибки / Корректность**, **Нарушения практик**, **Предложения**.
- Each finding must follow this exact format on a single line:
  `🟡 *Сред.* src/components/Foo/Foo.vue:42 — описание проблемы`
  That is: **severity label → file:line → description**. No separate line for the file reference.
- Use compact italic severity labels: *Крит.*, *Выск.*, *Сред.*, *Низк.*, *Улчш.*
- If the exact line is unknown, omit the line number but keep the file path.
- If a section has no findings, write "Нет."
- Add a **Контекст** line near the end (just before the summary): resolve the Vue version from `package.json` and state its *minor* (minor only — no caret/patch, and don't print the source), plus the merge base used when reviewing a branch (`база ветки — <branch>`). Don't list the other ecosystem packages by default — surface a package's version only when a specific finding actually gates on it, inline at that finding. Example:
  `Контекст: Vue 3.5; база ветки — dev`
- End with a summary line: overall severity (highest level found) and total finding count by severity.
