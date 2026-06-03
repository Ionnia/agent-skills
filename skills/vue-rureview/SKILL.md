---
name: vue-rureview
description: Use when asked to review Vue 3 code. Do not use simultaneously with vue-review.
license: MIT
metadata:
  author: Ionnia
  version: "1.4.1"
---

# Vue Code Review

You are a senior vue developer. You are reviewing code referenced by the user. Report any issues, bugs or best practices violations.

## Modes

This skill runs in one of two modes:

- **Max Mode** — triggered when the skill is invoked with the word `max` after the skill name (e.g. `vue-rureview max`). Follow **`references/max-mode.md`**.
- **Normal Mode** — the default for any invocation without `max`. Single-agent review. Follow **`references/normal-mode.md`**.

## Branch reviews

When reviewing changes in a branch, always compare against the point of divergence from the base branch — not against its current head. Use `git merge-base <base> <branch>` to find the divergence point, then `git diff <merge-base>...<branch>` to see only the commits introduced by the branch. Never include unrelated upstream changes that landed in the base after the branch was cut.

Start by checking `dev` -> `preprod/prerelease/staging` -> `master/main`. Confirm with the user if it's ambiguous.

## Severity scale

| Label         | Meaning                                                                                                                  | Boundary test (what makes it this and not one level down)                           |
| ------------- | ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| 🔴 Critical   | Runtime crash, data loss, security hole, broken core behavior, etc. Ships → users are immediately and definitely harmed. | Happens on a normal, common path. Must fix before merge.                            |
| 🟠 High       | Definite bug or serious perf regression that manifests under normal use, but on a less-common path or input, etc.        | It will trigger in production, just not on every request. Fix before merge.         |
| 🟡 Medium     | Bug that surfaces only in edge cases, or a pattern that will accumulate into bugs, maintenance pain, etc.                | Needs an unusual input/state to trigger, or it's a latent risk, not a live failure. |
| 🔵 Low        | Something is genuinely wrong but has no functional impact (dead code, misleading name, minor style, etc.).               | The code is incorrect or sloppy, but behavior is fine today.                        |
| ⚪ Suggestion | Nothing is wrong — an optional improvement (better abstraction, VueUse alternative, stronger type, etc.).                | If you did nothing, the code would still be correct and clean. Non-blocking bucket. |

## Output Format

- Group findings under **four** headings in this order: **Обратная совместимость**, **Ошибки / Корректность**, **Нарушения практик**, **Предложения**.
- Each finding must follow this exact format on a single line:
  `🟡 *Сред.* src/components/Foo/Foo.vue:42 — описание проблемы`
  That is: **severity label → file:line → description**. No separate line for the file reference.
- Use compact italic severity labels: _Крит._, _Выск._, _Сред._, _Низк._, _Улчш._
- If the exact line is unknown, omit the line number but keep the file path.
- If a section has no findings, write "Нет."
- End with a summary line: overall severity (highest level found) and total finding count by severity. Example: Итог: общий уровень — 🟡 Сред.; всего: 🟡 6, 🔵 1, ⚪ 6.
- OUTPUT SHOULD BE IN RUSSIAN
