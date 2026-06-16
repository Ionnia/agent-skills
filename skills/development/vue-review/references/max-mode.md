# Max Mode — parallel subagents

In Max Mode the main agent does **not** review code itself. It narrows down exactly what is under review, fans the four review sections out to separate subagents that run in parallel, then compiles their findings.

**Resolve the review target once.** Figure out exactly what is under review — the specific file paths, and/or, for a branch review, the resolved git diff range. Resolve it here so every subagent reviews the identical, already-narrowed target — the subagents neither pick a base nor widen the scope.

1. **Launch four subagents, one per section, in parallel where the environment allows it.** Give each subagent:
   - An instruction to **apply the `vue-review` skill** to the review target as a normal mode review.
   - The **review target** you resolved: the exact file paths and/or git diff range. Be explicit so every subagent reviews precisely the same code.
   - Tell it to exhaustively analyze one of four section mentioned below. No overlap. Not prohibiting from exploring different sections just not mentioning them.

   Sections, one per subagent:
   - Backward Compatibility
   - Bugs / Correctness Issues
   - Best Practices Violations
   - Suggestions

2. **Curate and compile.** Assemble the final report from the subagents' findings. This is an _editorial_ pass, not a fresh review — do not hunt for new issues or re-derive findings the subagents didn't surface. You may and should: place each finding under the correct heading, merge duplicates, route each finding to its best-fit category, normalize severity across sections, keep the clearest wording, and drop findings that are out of scope or contradicted by the resolved version context. Format the whole report exactly per the **Output Format** section in `SKILL.md`.
