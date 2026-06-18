# Normal Mode — single-agent review

## Review dimensions

Examine the code across these dimensions. They are not output sections — fold whatever you find into the four sections below by severity. Cover every dimension; if a change touches an area you're unsure about, examine it anyway.

- **Correctness** — logic errors, edge cases, error handling, concurrency/ordering, resource lifecycle (open/close, subscribe/unsubscribe).
- **Security** — input validation, injection, auth/authorization, secrets handling, unsafe deserialization, dependency risk.
- **Performance** — unnecessary work or allocations, N+1 access patterns, blocking calls on hot paths, avoidable complexity.
- **Types** — type safety, unsound casts, missing or weak types, nullability, public API signatures.
- **Tests** — coverage of the change, correctness of assertions, missing edge cases, brittle or tautological tests.
- **Docs** — public API documentation, comments that match behavior, changelog/migration notes for breaking changes.

## Review Process

1. **Read the code** the user references in full before forming any conclusions.
2. **Cover every review dimension** above based on what the code contains. If you're unsure whether a dimension applies, examine it anyway.
3. **Before stating any version-gated finding**, check the project's dependency manifest and lockfile — e.g. `package.json`, `go.mod`, `Cargo.toml`, `pyproject.toml` / `requirements.txt`, `*.csproj`, `Gemfile.lock` — for the installed versions of the language/runtime, framework, and relevant libraries (consult the lockfile when the declared range spans a feature boundary). If the project has no manifest or the finding is not version-dependent, skip this step.

## Backward Compatibility Check

**Run first.** Flag changes that break existing callers or consumers — exported/public API signatures, serialized or persisted formats, DB schemas, config/CLI contracts, network protocols. For a published package this means a breaking change without a major version bump; for application code it means breaking an existing internal caller or persisted data without a migration. If the code under review exposes no such contract, this section is "None."

## Bugs / Correctness

Behavior that's incorrect, throws, or fails silently. Cite the line/symbol and explain why it breaks.

## Best Practices

Deviations from the project's language, framework, and ecosystem conventions that hurt maintainability, performance, or consistency.

## Suggestions

Non-blocking improvements: shared-logic extractions, type refinements, standard-library or well-supported alternatives, etc.

## Attention to detail

Surface-level review misses the bugs that matter. Before finalizing any finding — or concluding there's nothing to report — slow down and interrogate your own reading of the code.

**Trace, don't skim.** Follow each changed value through its full lifecycle: where it's created, mutated, passed, and consumed. An argument that looks safe at its declaration may be destructured unsafely three calls down.

**Run an internal adversarial dialogue.** Pose concrete questions and answer them from the code, not from assumption:

- "What happens if this argument is `undefined` / `null` / an empty collection?"
- "This callback fires on click — but can it fire twice? After teardown? Before initialization completes?"
- "The author says this is backward-compatible. What's the exact call site that would break? Can I construct one?"
- "This value is derived from `x` — does it actually update when `x` changes, or did I assume it?"
- "This value reaches a query / shell / filesystem / HTTP call — is it attacker-controllable, and is it validated or escaped before it gets there?"

**Distrust the comfortable conclusion.** If a change looks obviously correct, that's the moment to push harder — name the one input, ordering, or lifecycle timing that would falsify it. If you can't construct a failing case after genuinely trying, _then_ it's clear.

**Prefer specific over plausible.** Don't report "this might cause issues." Either pin it to a line, an input, and a concrete consequence — or don't report it. Vague findings waste the author's time and erode trust in the real ones.

**Re-read once more for what isn't there.** Missing null checks, absent default values, an unhandled branch, an error path that's silently swallowed. Omissions don't announce themselves — you have to ask what _should_ be present and confirm it is.

A few notes on the design:

- The bulleted self-questions model the adversarial dialogue concretely rather than just instructing "be adversarial" — the example questions give the model a pattern to imitate.
- The "distrust the comfortable conclusion" framing specifically counters the failure mode where a model rubber-stamps code that looks clean.
- The last item targets omission bugs, which skim-reading systematically misses.
