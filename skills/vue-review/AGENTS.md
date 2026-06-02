# Maintainer notes — `vue-review`

Read this before editing this skill. It exists because the skill has **deliberate duplication**
that is easy to break.

## Why blocks are duplicated (don't "fix" it by extracting)

The four files in `templates/` are each loaded **standalone** into a Max Mode subagent's prompt —
the subagent never sees `SKILL.md`. So every template must be **self-contained**: it repeats the
"Apply relevant skills" list, the "Read the code first" / "Branch reviews" guidance, the severity
scale, and the output format. `SKILL.md` repeats the same blocks for the normal single-agent path.

This duplication is intentional. Do **not** replace it with `@import`/include indirection —
subagent prompts can't follow cross-file references reliably.

## Sync points — edit a shared block, update it EVERYWHERE it appears

| Shared block | Lives in |
|---|---|
| Relevant-skills list (`vue`, `vue-best-practices`, conditional rest) | `SKILL.md` + all 4 templates |
| "Read the code first" + branch-review **merge-base mechanic** | `SKILL.md` (Review Process) + all 4 templates |
| Version-gating guidance (resolve version first; defer to loaded skills) | `SKILL.md` step 2 + `bugs-correctness.md` + `suggestions.md` |
| Severity scale | `SKILL.md` + each template's per-section scale |
| Per-finding output format (italic labels, `file:line`, "None.") | `SKILL.md` Output Format + each template's Output section |

**Branch handling — mind the split.** The merge-base *mechanic* (review the point-of-divergence
diff) is repeated in all five files, so keep it consistent. But the base-*picking heuristic* (which
base to choose when it's ambiguous — the `dev → preprod → master` reasoning) lives **only** in
`SKILL.md`, by design: base selection is the orchestrator's job. In Max Mode the main agent resolves
the diff range once and passes it down; the templates must **not** pick a base — they review the
range they're handed and stop to ask the orchestrator if no range was given. Do not copy the
heuristic into the templates (it would risk four subagents diverging on the base).

## Invariants

- **Vue 3 only.** Resolve the project's Vue version before applying any version-gated rule.
- **Severity labels are compact *italic*** — `*Crit.*`, `*High*`, `*Med.*`, `*Low*`, `*Sugg.*`.
  Not bold, not Unicode-underline (older versions used underline; do not reintroduce it).
- **Severity scope per bucket:** only the Suggestions bucket emits `*Sugg.*`. The other three
  buckets emit only `*Crit.* / *High.* / *Med.* / *Low*`.

## Sibling skill — keep in sync

`vue-rureview` is the Russian-output twin of this skill. **Mirror every substantive change to both.**
The ONLY intended divergence is output language:

- This skill emits English headings/labels and a `Version context:` line.
- `vue-rureview` emits Russian headings (Обратная совместимость, Ошибки / Корректность, …),
  Russian italic labels (`*Крит.*`, `*Выск.*`, `*Сред.*`, `*Низк.*`, `*Улчш.*`), and a
  `Версии пакетов:` line.
- The `templates/` files are **identical** between the two skills — subagents work in English and
  the compile step translates to Russian. So a template edit here must be copied verbatim to
  `vue-rureview/templates/`.

`CLAUDE.md` in this folder is a symlink to this file.
