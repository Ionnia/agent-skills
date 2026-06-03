# Normal Mode — single-agent review

Run this review yourself (this is the default path when the skill is **not** invoked with `max`).

Use the following skills when applicable:
- `vue-best-practices` — Vue 3 Composition API patterns, SFC structure, component design, reactivity, data flow
- `vue` — Vue 3 built-in components, script setup macros, reactivity primitives, Transition/Teleport/Suspense/KeepAlive
- `vueuse-functions` — VueUse composables usage and opportunities
- `vue-router-best-practices` — Vue Router 4 patterns, navigation guards, route params
- `pinia` — Pinia store definitions, state/getters/actions patterns
- `vue-testing-best-practices` — Vitest, Vue Test Utils, component testing patterns
- `vitest` — Test correctness, mocking, coverage
- `vite` — Vite config, plugin usage, build setup
- `typescript-advanced-types` — TypeScript type safety, generics, utility types
- `web-design-guidelines` — Accessibility, UI best practices, semantic HTML

## Review Process

1. **Read the code** the user references in full before forming any conclusions.

> **Branch reviews:** When reviewing changes in a branch, always compare against the point of divergence from the base branch — not against its current head. Use `git merge-base <base> <branch>` to find the divergence point, then `git diff <merge-base>...<branch>` to see only the commits introduced by the branch. Never include unrelated upstream changes that landed in the base after the branch was cut.
>
> **Pick the right base branch.** If the merge-base diff against your assumed base is huge or full of clearly unrelated changes, you probably chose the wrong base — the branch was most likely cut from a different, less-stable integration branch. Teams usually branch off an integration branch rather than the production branch; integration branches tend to flow from least to most stable (commonly `dev` → `preprod`/staging → `master`/`main`), and only hotfixes branch directly off the production branch. So a large diff against `master` is a strong hint the branch came off `dev` (or the next branch down the chain). Try each candidate base and use the one that yields the smallest, most relevant diff — confirm with the user if it's ambiguous.

2. **Resolve Vue version context first.** Before applying any version-gated rule, check `package.json` (and the lockfile if it's ambiguous) for the installed versions of Vue and the relevant ecosystem packages (Vue Router, Pinia, VueUse, Vitest). If Vue 2 is detected, state that this skill is Vue-3-scoped and stop — unless the user explicitly asked for migration notes. If a version is unclear, state the assumption you're making rather than presenting version-gated behavior as certain. For which features require which Vue version, consult the loaded `vue` / `vue-best-practices` skills — they document feature-version support inline.
3. **Check backward compatibility first** — scan for anything that breaks the public API surface or changes observable behavior (see section below). Report these before anything else.
4. **Apply relevant skills** based on what the code contains (components → vue-best-practices + vue, stores → pinia, router files → vue-router-best-practices, tests → vue-testing-best-practices + vitest, etc.).
5. **Tag every finding with a severity label** (see scale below).
6. **Report findings** grouped into four buckets (Backward Compatibility first, then the three standard buckets).

> The category descriptions and bullet lists in the sections below are **examples, not exhaustive checklists.** They illustrate the kinds of issues that qualify in each section. Report anything that fits a category, including issues not listed; use your judgement and do not limit yourself to the listed items.

## Severity Scale

| Label | Meaning |
|-------|---------|
| 🔴 **Critical** | Runtime crash, data loss, security hole, or broken core behavior. Must fix before shipping. |
| 🟠 **High** | Likely bug or serious performance regression; will cause user-visible problems under normal use. |
| 🟡 **Medium** | Best-practice violation or pattern that will cause maintenance pain or subtle bugs over time. |
| 🔵 **Low** | Minor style or convention issue; no immediate impact. |
| ⚪ **Suggestion** | Non-blocking improvement — better abstraction, VueUse alternative, type improvement, etc. |

> **Severity scope per bucket:** `⚪ Suggestion` is emitted **only** in the Suggestions bucket. Backward Compatibility, Bugs / Correctness Issues, and Best Practices Violations use only `Critical / High / Medium / Low`. A defect is never a Suggestion — route it to the appropriate blocking bucket.

## Backward Compatibility Check

**Run this before all other checks.** Look for any change that could break consumers of this component/composable without a major version bump.

### Props & Emits API Surface
- Removed or renamed props (including required → optional changes that remove the old name)
- Changed prop types in a breaking way (e.g. `String` → `Number`, narrowing a union)
- New required props added without a default (forces all callers to update)
- Removed or renamed emits
- Changed emit payload shape (extra/missing fields, type changes)

### Slots API Surface
- Removed or renamed named slots
- Changed slot scope shape (fields removed or renamed that consumers may destructure)
- Default slot replaced with a named slot or vice versa

### Exposed API (`defineExpose`)
- Methods or refs removed from `defineExpose`
- Renamed exposed symbols
- Changed method signatures (different arguments or return type)

### Observable Behavior Changes
- Default values of props changed in a way that alters behavior for existing consumers
- Event timing or ordering changes (e.g. emit now fires before vs. after a side effect)
- v-model binding semantics changed (different modelValue type, different update event name)
- Component now conditionally renders where it previously always rendered (or vice versa)
- Scoped slot data shape changed even if the slot name is the same

### DOM Structure Changes
Lower priority than behavior changes — report only when a structural change is likely to break external selectors or test queries.
- CSS class names removed or renamed
- Structural DOM changes (element type changed, nesting altered, element removed) that callers may target via selectors or in tests

### How to Rate Backward Compatibility Findings
| Severity | Condition |
|----------|-----------|
| 🔴 Critical | Silent break — callers will malfunction at runtime with no warning |
| 🟠 High | Break that causes a Vue warning or behavioral regression in common usage |
| 🟡 Medium | Break only in edge-case usage or easily caught by TypeScript |
| 🔵 Low | DOM/class changes that may break selectors or tests but have no runtime behavior impact |

If a breaking change is intentional (e.g. a major version bump), note it explicitly so the reviewer can confirm and document it in a changelog.

---

## Bugs / Correctness Issues
Problems that cause incorrect behavior, runtime errors, or silent failures. Be specific: include the line/symbol and explain why it breaks.

## Best Practices Violations
Deviations from Vue 3, TypeScript, or ecosystem conventions that will hurt maintainability, performance, or team consistency.

**`$attrs` / `v-bind="$attrs"` passthrough** — flag any use of `$attrs` that forwards arbitrary attributes directly to a third-party or underlying library component. This creates tight coupling: consumers start depending on the internal library's prop API, and any library upgrade can silently break them. Prefer an explicit prop interface; if passthrough is intentional, it must be documented and scoped.

## Suggestions
Non-blocking improvements worth considering — better composable extractions, type improvements, VueUse alternatives, etc.

## Output Format

Format the final report exactly per the **Output Format** section in `SKILL.md`.
