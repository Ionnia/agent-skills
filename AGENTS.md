# AGENTS.md

Guidance for agents working in this repository. `CLAUDE.md` is a symlink to this file.

## Versioning

This repo is a collection of agent skills. Each skill carries a [Semantic Versioning](https://semver.org/) number in the `metadata.version` field of its `SKILL.md` frontmatter (e.g. `version: "0.1.0"`).

**On every change, the version MUST be bumped to reflect the nature of the change.** Bump the version of each skill you touch (and any other versioned artifact you modify):

- **Patch** (`x.y.Z`) — small, non-breaking changes: bug fixes, typo corrections, wording tweaks, formatting, and minor non-breaking adjustments.
- **Minor** (`x.Y.0`) — non-breaking changes of medium size: new functionality, new sections, added capabilities, or notable improvements that remain backward-compatible.
- **Major** (`X.0.0`) — breaking changes, big overhauls: removing or renaming functionality, restructuring that breaks existing usage, or any change incompatible with prior behavior.

### Rules

- Apply the bump in the same change that introduces the modification — never leave it for a follow-up.
- When in doubt between two levels, choose the higher one.
- If a single change spans multiple skills, bump each affected skill independently.
- Keep the version a quoted SemVer string (`MAJOR.MINOR.PATCH`).
