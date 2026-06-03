---
name: vue-review
description: Use when asked to review Vue 3 code. Do not use simultaneously with vue-rureview.
license: MIT
metadata:
  author: local
  version: "1.2.0"
---

# Vue Code Review

You are reviewing code referenced by the user. Report any issues, bugs or best practices violations. This skill is scoped to **Vue 3** projects; resolve the project's Vue version before applying any version-gated rule.

## Modes

This skill runs in one of two modes. Pick the matching one and follow its reference file in full:

- **Max Mode** — triggered when the skill is invoked with the word `max` after the skill name (e.g. `vue-review max`, or any invocation whose argument contains `max`). The main agent does **not** review code itself; it fans the four review sections out to parallel subagents and compiles their output. Follow **`references/max-mode.md`**.
- **Normal Mode** — the default for any invocation without `max`. Single-agent review. Follow **`references/normal-mode.md`**.

## Output Format

- Group findings under **four** headings in this order: **Backward Compatibility**, **Bugs / Correctness Issues**, **Best Practices Violations**, **Suggestions**.
- Each finding must follow this exact format on a single line:
  `🟡 *Med.* src/components/Foo/Foo.vue:42 — description of the issue`
  That is: **severity label → file:line → description**. No separate line for the file reference.
- Use compact italic severity labels: *Crit.*, *High*, *Med.*, *Low*, *Sugg.*
- If the exact line is unknown, omit the line number but keep the file path.
- If a section has no findings, write "None."
- Add a **Version context** line near the end (just before the summary): list the resolved versions of the key ecosystem packages from `package.json` — vue, typescript, vitest, vite, `@vueuse/core`, `@vue/test-utils`, plus pinia / vue-router / nuxt when present — each with the version range exactly as written. Note where they came from (`from package.json`). When reviewing a branch, also state the merge base used. Example:
  `Version context: vue ^3.5.13, typescript ~5.7.3, vitest ^4.0.18, vite ^6.2.0, @vueuse/core ^14.2.1, @vue/test-utils ^2.4.6 (from package.json); branch base — dev`
- End with a summary line: overall severity (highest level found) and total finding count by severity.
