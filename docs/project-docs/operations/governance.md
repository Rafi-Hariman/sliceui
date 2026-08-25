# Governance — SliceUI

## 1. Description
Governance rules for the SliceUI repository: versioning, release cadence, code ownership, and contribution guidelines.

## 2. Important
- **Inferred from repo state:** this is a solo/small team project with no formal governance yet — no tags, `version: 0.0.0`, no CONTRIBUTING, no branch protection. Rules below are the recommended baseline.
- Keep governance light; the goal is predictability without bureaucracy.

## 3. Table of Contents
- [1. Description](#1-description)
- [2. Important](#2-important)
- [3. Table of Contents](#3-table-of-contents)
- [4. Scope](#4-scope)
- [5. Goals](#5-goals)
- [6. Non Goals](#6-non-goals)
- [7. Versioning Policy](#7-versioning-policy)
- [8. Release Cadence](#8-release-cadence)
- [9. Code Ownership](#9-code-ownership)
- [10. Contribution Guidelines](#10-contribution-guidelines)
- [11. Success Metrics](#11-success-metrics)
- [12. Related Documents](#12-related-documents)
- [13. Open Questions](#13-open-questions)

## 4. Scope
Covers how SliceUI versions, releases, and accepts contributions.

## 5. Goals
Make releases reproducible, history auditable, and contributions consistent.

## 6. Non Goals
Does not cover the CI pipeline mechanics (see `ci-cd.md`) or operational runbooks (see `production-runbook.md`).

## 7. Versioning Policy
- **Current:** `version: 0.0.0` — pre-release.
- **Recommended:** [SemVer](https://semver.org/) (`major.minor.patch`) once the first release is cut.
  - `major` — breaking change (e.g., switching AI architecture, schema breaking changes).
  - `minor` — new feature (e.g., new framework output, new options).
  - `patch` — bug fixes, non-breaking improvements.
- Track in `package.json` + `foundation/changelog.md`; tag git releases.

## 8. Release Cadence
- **Currently:** none — everything lives in `[Unreleased]`.
- **Recommended:** release when a batch of features/fixes is verified, not on a fixed clock. Each release: update changelog, bump version, tag, deploy, run smoke checks (see `production-runbook.md`).

## 9. Code Ownership
| Area | Owner | Notes |
| :--- | :--- | :--- |
| Slice pipeline (`src/lib/*`, `src/hooks/useConvert*`) | TBD | Core conversion logic |
| AI integration (`aiService`, `prompts`) | TBD | Gemini/Groq behavior |
| Auth + data (`AuthContext`, `conversionService`, `storageService`) | TBD | Supabase contracts |
| UI (`components/`, `pages/`, design tokens) | TBD | shadcn/ui usage |
| Docs (`docs/project-docs/`) | TBD | Owning doc wins on conflicts |

## 10. Contribution Guidelines
- Branch: `feat/<desc>` or `fix/<desc>` off `main` (see `foundation/workflow.md`).
- Conventional Commit messages (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`).
- PR checks: lint → test → build green.
- **No unilateral architecture/naming/tool changes** without discussion (EHA agent rule 1.1).
- Keep `docs/project-docs/` in sync for any cross-cutting change.

## 11. Success Metrics
- First release tagged with SemVer.
- Changelog + version bump accompany each release.
- Every contributor follows branch + commit conventions.

## 12. Related Documents
- [Workflow](../foundation/workflow.md)
- [Changelog](../foundation/changelog.md)
- [CI/CD](ci-cd.md)

## 13. Open Questions
- Who is the project owner / release approver?
- Is public contribution intended (CONTRIBUTING file), or is this private?
