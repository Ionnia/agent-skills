# Maintainer notes — `vue-review`

Read this before editing this skill.

## File layout

`SKILL.md` is a thin **dispatcher**: an intro, a Modes section that routes to one of two references,
the shared **Branch reviews** and **Severity scale** sections, and the shared **Output Format**
(kept in `SKILL.md` because both modes emit the same report and `SKILL.md` is always in context).
Both references are loaded by the **main** agent (which still has `SKILL.md` in context, so they may
reference it and each other freely):

- `references/normal-mode.md` — the single-agent review path and the **single source of truth** for
  the relevant-skills list, the Review Process (incl. the branch/merge-base mechanic and the
  base-picking heuristic), and the four section definitions (Backward Compatibility, Bugs /
  Correctness, Best Practices, Suggestions) plus the "Attention to detail" rigor pass. Defers the
  output format and severity scale to `SKILL.md`.
- `references/max-mode.md` — the parallel-subagents orchestration. The main agent resolves the
  review target once, then launches four subagents (one per section), **each of which invokes this
  same `vue-review` skill in Normal Mode** scoped to the resolved files and assigned a single section
  to analyze exhaustively. The compile step formats per the Output Format in `SKILL.md`.

## No templates — Max Mode subagents run the skill

There are intentionally **no `templates/`**. Earlier versions duplicated each section's prompt into a
standalone template that was loaded into a Max Mode subagent (which never saw `SKILL.md` or the
references). That duplication is **gone**: a Max Mode subagent now **applies the skill itself**
(Normal Mode) on the orchestrator-narrowed scope and is told to focus on one section. So the section
definitions, severity scale, and review guidance live in exactly **one** place —
`references/normal-mode.md` + `SKILL.md` — and are reused by both the single-agent path and the Max
Mode subagents.

Do **not** reintroduce per-section template files or otherwise re-fork the section guidance. If a
section needs sharper instructions, edit its definition in `references/normal-mode.md` so both paths
get it.

**Avoid recursion.** Max Mode subagents must run a **single-agent (Normal Mode)** review — they must
never re-enter Max Mode, or the fan-out would nest. `references/max-mode.md` states this explicitly;
keep it.

## Branch handling

The merge-base **mechanic** (review the point-of-divergence diff) and the base-**picking heuristic**
(`dev → preprod → master`) both live in `references/normal-mode.md` → Review Process. In Max Mode the
main agent resolves the diff range **once** and passes the already-narrowed scope to every subagent,
so the subagents neither pick a base nor widen the scope. Keep base selection in the
orchestrator/normal-mode path — never push it onto the subagents.

## Invariants

- **Vue 3 only.** Resolve the project's Vue version before applying any version-gated rule.
- **Severity labels are compact _italic_** — `_Crit._`, `_High_`, `_Med._`, `_Low_`, `_Sugg._`.
  Not bold, not Unicode-underline (older versions used bold/underline; do not reintroduce either).
- **Severity scope per bucket:** only the Suggestions bucket emits `_Sugg._`. The other three
  buckets emit only `_Crit._ / _High_ / _Med._ / _Low_`.
- **Bump the version on every change.** Any substantive edit to this skill (output format, prompts,
  references, orchestration) must bump `metadata.version` in `SKILL.md` per semver. Mirror the same
  bump in the sibling `vue-rureview` so the twins stay in lockstep.

## Sibling skill — keep in sync

`vue-rureview` is the Russian-output twin of this skill. **Mirror every substantive change to both.**
With templates gone, the files map one-to-one and differ **only** by output language:

- `references/normal-mode.md` is **byte-identical** between the twins (all-English review
  instructions; the reason-in-English/output-in-Russian directive lives only in `vue-rureview/SKILL.md`).
- `references/max-mode.md` differs **only** in the skill name the subagents are told to apply
  (`vue-review` vs `vue-rureview`) and the trailing note that `vue-rureview` subagents already return
  Russian findings.
- `SKILL.md` differs **only** by language: this skill emits English headings/labels; `vue-rureview`
  emits Russian headings (Обратная совместимость, Ошибки / Корректность, …), Russian italic labels
  (`_Крит._`, `_Выск._`, `_Сред._`, `_Низк._`, `_Улчш._`), and the `Нет.` empty-section marker.

Because each twin's subagents apply that twin's own skill, `vue-rureview` subagents already produce
Russian findings — there is no separate translate step at compile time.

`CLAUDE.md` in this folder is a symlink to this file (`AGENTS.md`).
