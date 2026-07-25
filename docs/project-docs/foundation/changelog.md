# Changelog — SliceUI

All notable changes to SliceUI are recorded here.

This project has not yet cut a formal release (version `0.0.0`, no git tags).
This file starts with an `[Unreleased]` section to begin capturing changes from
here on. Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- Initial SDD documentation set under `docs/project-docs/` (Tier 2 — Standard):
  foundation, development, operations docs, a phase registry (P1–P4), technical
  guidelines (ai-providers, data-access, code-style), and this changelog.
- Folded the full QA plan (20 test cases, 8 Gherkin ACs, cross-browser /
  security / performance checklists) into `development/testing.md` as the
  target verification matrix.
- Documented the intended `POST /api/convert` contract (planned, not
  implemented) in `development/api-contract.md`.

### Changed
- Migrated original planning artifacts to `docs/project-docs/reference/` as
  non-authoritative migration source: `prompt.md` (original Next.js build spec)
  and `QA_TEST_DOCUMENT.md` (QA plan). SDD docs are now the single source of
  truth.
- E2E target standardized on **Playwright** (already installed); the QA plan's
  Cypress suite is superseded. `data-testid` hooks to be added.
- Auth-gate target set to **login-required generation**; current guest mode
  (disabled guard) is a local-dev shortcut to be removed in Phase P1.
- `foundation/status.md` risks and `foundation/architecture.md` ADR-1 updated to
  reference the migrated planning docs.

### Fixed
- _TBD_

### Security
- **(Pending)** Rotate Gemini, Groq, and Supabase keys and remove live secrets
  from `CLAUDE.md`. See `foundation/phases/phase-P1-security-hardening.md`.

### Deprecated
- _TBD_

### Removed
- _TBD_

---

<!-- Release template — uncomment when you cut a version + git tag.
## [0.1.0] — YYYY-MM-DD
### Added
### Changed
### Fixed
### Security
-->
