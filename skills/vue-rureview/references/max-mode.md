# Max Mode — parallel subagents

In Max Mode the main agent does **not** review code itself. It fans the four review sections out to separate subagents that run in parallel, then compiles their output.

**Resolve the review target once.** Figure out exactly what is under review — the file paths, and/or, for a branch review, the resolved git diff range. Resolve it here so every subagent reviews the identical target.

1. **Launch four subagents, one per section, in parallel where the environment allows it.** For each subagent:
   - Read the matching template from this skill's `templates/` directory and put its full contents into the subagent's prompt as its instructions.
   - Append the **review target** you resolved. Be explicit so the subagent reviews precisely the same code.

   | Section                   | Template                              |
   | ------------------------- | ------------------------------------- |
   | Backward Compatibility    | `templates/backward-compatibility.md` |
   | Bugs / Correctness Issues | `templates/bugs-correctness.md`       |
   | Best Practices Violations | `templates/best-practices.md`         |
   | Suggestions               | `templates/suggestions.md`            |

2. **Curate and compile.** Assemble the final report from the subagents' findings. This is an _editorial_ pass, not a fresh review — do not hunt for new issues or re-derive findings the subagents didn't surface. You may and should: place each finding under the correct heading, merge duplicates, route each finding to its best-fit category, normalize severity across sections, keep the clearest wording, and drop findings that are out of scope or contradicted by the resolved version context. Format the whole report exactly per the **Output Format** section in `SKILL.md`. The subagent findings are in English; translate them into Russian as you compile.
