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
- **Cycle C1 plan** — `foundation/phases/phase-C1-functional-production.md`
  (master) + execution briefs `c1/c1-backend.md`, `c1/c1-frontend.md`,
  `c1/c1-ui-ux.md`, `c1/c1-qa.md`. C1 brings SliceUI to local functional
  production: stands the backend up live (migrations + edge function + secrets),
  ships a dedicated History page + entitlement indicator + regenerate flow, and
  tightens UX/a11y.

### Changed
- Refreshed `foundation/status.md` to reflect the `feat/sliceui-mvp-cleanup`
  branch: route protection is enforced, the metered `/convert` edge function +
  `credits`/`usage_log` tables exist, and CI (lint · tsc · test · build) +
  Vitest/Playwright are in place. Marked guest-mode and no-CI risks resolved;
  flagged leaked-key history + unverified-live-backend as the open risks.
- Updated `foundation/phases/index.md` registry to make **C1** the active cycle
  (P1 largely covered by C1.1; P2 partially by C1.4).
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
