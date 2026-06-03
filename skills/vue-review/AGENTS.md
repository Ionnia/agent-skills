# Maintainer notes — `vue-review`

Read this before editing this skill. It exists because the skill has **deliberate duplication**
that is easy to break.

## File layout

`SKILL.md` is a thin **dispatcher**: an intro, a Modes section that routes to one of two references,
and the shared **Output Format** (kept here because both modes emit the same report and `SKILL.md`
is always in context). Both references are loaded by the **main** agent (which still has `SKILL.md`
in context, so they may reference it and each other freely):

- `references/normal-mode.md` — the single-agent review path: relevant-skills list, Review Process
  (incl. branch/merge-base guidance and the base-picking heuristic), Severity Scale, Backward
  Compatibility Check, and the section definitions. Defers formatting to `SKILL.md`'s Output Format.
- `references/max-mode.md` — the parallel-subagents orchestration; its compile step formats per the
  Output Format in `SKILL.md`.

## Why blocks are duplicated (don't "fix" it by extracting)

The four files in `templates/` are each loaded **standalone** into a Max Mode subagent's prompt —
the subagent never sees `SKILL.md` or the references. So every template must be **self-contained**:
it repeats the "Apply relevant skills" list, the "Read the code first" / "Branch reviews" guidance,
the severity scale, and the output format. `references/normal-mode.md` repeats the same blocks for
the normal single-agent path.

This duplication is intentional. Do **not** replace it with `@import`/include indirection —
subagent prompts can't follow cross-file references reliably. (The two `references/` files are the
exception: they're read by the main agent, so they cross-reference each other rather than duplicate.)

## Sync points — edit a shared block, update it EVERYWHERE it appears

| Shared block | Lives in |
|---|---|
| Relevant-skills list (`vue`, `vue-best-practices`, conditional rest) | `references/normal-mode.md` + all 4 templates |
| "Read the code first" + branch-review **merge-base mechanic** | `references/normal-mode.md` (Review Process) + all 4 templates |
| Version-gating guidance (resolve version first; defer to loaded skills) | `references/normal-mode.md` step 2 + `bugs-correctness.md` + `suggestions.md` |
| Severity scale | `references/normal-mode.md` + each template's per-section scale |
| Per-finding output format (italic labels, `file:line`, "None.") | `SKILL.md` Output Format + each template's Output section |

**Branch handling — mind the split.** The merge-base *mechanic* (review the point-of-divergence
diff) is repeated in `references/normal-mode.md` and all 4 templates, so keep it consistent. But the
base-*picking heuristic* (which base to choose when it's ambiguous — the `dev → preprod → master`
reasoning) lives **only** in `references/normal-mode.md`, by design: base selection is the
orchestrator's job. In Max Mode the main agent resolves
the diff range once and passes it down; the templates must **not** pick a base — they review the
range they're handed and stop to ask the orchestrator if no range was given. Do not copy the
heuristic into the templates (it would risk four subagents diverging on the base).

## Invariants

- **Vue 3 only.** Resolve the project's Vue version before applying any version-gated rule.
- **Severity labels are compact *italic*** — `*Crit.*`, `*High*`, `*Med.*`, `*Low*`, `*Sugg.*`.
  Not bold, not Unicode-underline (older versions used underline; do not reintroduce it).
- **Severity scope per bucket:** only the Suggestions bucket emits `*Sugg.*`. The other three
  buckets emit only `*Crit.* / *High.* / *Med.* / *Low*`.
- **Bump the version on every change.** Any substantive edit to this skill (output format, prompts,
  references, templates) must bump `metadata.version` in `SKILL.md` per semver. Mirror the same bump
  in the sibling `vue-rureview` so the twins stay in lockstep.

## Sibling skill — keep in sync

`vue-rureview` is the Russian-output twin of this skill. **Mirror every substantive change to both.**
The ONLY intended divergence is output language:

- This skill emits English headings/labels and a `Context:` line.
- `vue-rureview` emits Russian headings (Обратная совместимость, Ошибки / Корректность, …),
  Russian italic labels (`*Крит.*`, `*Выск.*`, `*Сред.*`, `*Низк.*`, `*Улчш.*`), and a
  `Контекст:` line.
- The `templates/` files are **identical** between the two skills — subagents work in English and
  the compile step translates to Russian. So a template edit here must be copied verbatim to
  `vue-rureview/templates/`.

`CLAUDE.md` in this folder is a symlink to this file.
