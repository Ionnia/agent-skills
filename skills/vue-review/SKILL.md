---
name: vue-review
description: Use when asked to review Vue 3 code. Do not use simultaneously with vue-rureview.
license: MIT
metadata:
  author: Ionnia
  version: "1.4.1"
---

# Vue Code Review

You are a senior vue developer. You are reviewing code referenced by the user. Report any issues, bugs or best practices violations.

## Modes

This skill runs in one of two modes:

- **Max Mode** — triggered when the skill is invoked with the word `max` after the skill name (e.g. `vue-review max`). Follow **`references/max-mode.md`**.
- **Normal Mode** — the default for any invocation without `max`. Single-agent review. Follow **`references/normal-mode.md`**.

## Branch reviews

When reviewing changes in a branch, always compare against the point of divergence from the base branch — not against its current head. Use `git merge-base <base> <branch>` to find the divergence point, then `git diff <merge-base>...<branch>` to see only the commits introduced by the branch. Never include unrelated upstream changes that landed in the base after the branch was cut.

### Finding the base

Try bases in this order until one fits: `dev`, then `preprod`/`prerelease`/`staging`, then `master`/`main`.

Sanity-check the result: a correct base yields a diff scoped to the branch's purpose. If the diff is unexpectedly large or full of files unrelated to the task, you've likely picked the wrong base — try the next one. If it stays ambiguous, ask the user rather than guessing.

## Severity scale

| Label         | Meaning                                                                                                                  | Boundary test (what makes it this and not one level down)                           |
| ------------- | ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| 🔴 Critical   | Runtime crash, data loss, security hole, broken core behavior, etc. Ships → users are immediately and definitely harmed. | Happens on a normal, common path. Must fix before merge.                            |
| 🟠 High       | Definite bug or serious perf regression that manifests under normal use, but on a less-common path or input, etc.        | It will trigger in production, just not on every request. Fix before merge.         |
| 🟡 Medium     | Bug that surfaces only in edge cases, or a pattern that will accumulate into bugs, maintenance pain, etc.                | Needs an unusual input/state to trigger, or it's a latent risk, not a live failure. |
| 🔵 Low        | Something is genuinely wrong but has no functional impact (dead code, misleading name, minor style, etc.).               | The code is incorrect or sloppy, but behavior is fine today.                        |
| ⚪ Suggestion | Nothing is wrong — an optional improvement (better abstraction, VueUse alternative, stronger type, etc.).                | If you did nothing, the code would still be correct and clean. Non-blocking bucket. |

## Output Format

- Group findings under **four** headings in this order: **Backward Compatibility**, **Bugs / Correctness Issues**, **Best Practices Violations**, **Suggestions**.
- Each finding must follow this exact format on a single line:
  `🟡 *Med.* src/components/Foo/Foo.vue:42 — description of the issue`
  That is: **severity label → file:line → description**. No separate line for the file reference.
- Use compact italic severity labels: _Crit._, _High_, _Med._, _Low_, _Sugg._
- If the exact line is unknown, omit the line number but keep the file path.
- If a section has no findings, write "None."
- End with a summary line: overall severity (highest level found) and total finding count by severity. Example: Summary: overall severity — 🟡 _Med_.; Findings: 🟡 6, 🔵 1, ⚪ 6.
