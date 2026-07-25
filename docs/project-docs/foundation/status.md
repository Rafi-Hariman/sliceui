# Status — SliceUI

## 1. Description

Snapshot of what SliceUI currently is, what was recently accomplished, what is
in flight, and the delta between the implemented product and the older
`CLAUDE.md` plan. Accurate as of 2026-07-24 (Inferred from codebase + git).

## 2. Important

- **Last commit:** 2026-05-11. **Working tree:** uncommitted changes today to
  `src/App.tsx`, `src/components/CodeOutput.tsx`, `src/hooks/useConvert.ts`,
  plus an untracked `QA_TEST_DOCUMENT.md`. Development is active locally but has
  not been committed in ~2.5 months.
- Several items the v1 `CLAUDE.md` checklist marked "out of scope" (login,
  history) are **already implemented**, while items it assumed (server route,
  rate limiting, `sharp` normalization) are **not**. See [Risks/Blockers](#risksblockers).

## 3. Table of Contents

- [1. Description](#1-description)
- [2. Important](#2-important)
- [3. Table of Contents](#3-table-of-contents)
- [4. Scope](#4-scope)
- [5. Goals](#5-goals)
- [6. Non Goals](#6-non-goals)
- [Current State](#current-state)
- [Recent Accomplishments](#recent-accomplishments)
- [Upcoming Focus](#upcoming-focus)
- [Key Metrics](#key-metrics)
- [Roadmap](#roadmap)
- [Epics](#epics)
- [Risks/Blockers](#risksblockers)
- [Success Metrics](#success-metrics)
- [Related Documents](#related-documents)
- [Open Questions](#open-questions)

## 4. Scope

Project execution state: implemented features, gaps, risks, and near-term plan.

## 5. Goals

- Give an accurate, honest picture of shipped vs. planned.
- Make the CLAUDE.md-vs-codebase delta explicit so it can be resolved.

## 6. Non Goals

- Not a release log (no `changelog.md` yet — see Step 2.5 decision pending).
- Not per-sprint burndown (no phases set up yet).

## Current State

- **Working, end-to-end MVP** on `/slice`: upload → generate (Gemini, Groq
  fallback) → highlighted code + live preview + copy/download.
- **Auth + history** implemented (Supabase email/password, `conversions` table,
  dashboard) but the **login guard is disabled locally** (guest mode).
- **No server** of any kind; all AI calls are client-side.
- **Tests:** scaffolded only (one trivial Vitest case; Playwright installed but
  unconfigured).
- **CI/CD:** none configured (no `.github/workflows`). Deploy assumed via
  Lovable Publish or manual static host.

## Recent Accomplishments

(Inferred from git log + code)

- Conversion pipeline with Gemini + Groq fallback (`aiService.ts`).
- Framework-aware prompt builder with option toggles (`prompts.ts`).
- Multi-intake image upload: drag, click, paste; validation (`useImageUpload.ts`).
- Supabase auth context + profiles; conversion persistence + image storage.
- Live preview engine per framework in `CodeOutput.tsx` (Tailwind/Bootstrap CDN,
  React+Babel, Vue global, Svelte info card).
- Prompt refinement commit (`d4246cc`) for screenshot analysis rules.

## Upcoming Focus

- Decide architecture direction: keep client-side AI or move keys server-side.
- Re-enable/harden auth guard and RLS before any public exposure.
- Resolve Supabase generated-types drift (see `development/database.md`).
- Add real test coverage and a CI pipeline.

## Key Metrics

- TBD — no telemetry/dashboards configured. Candidate metrics listed in
  `prd.md` → Success Metrics.

## Roadmap

1. **Harden:** server-side key proxy + rate limiting; fix RLS/storage policies.
2. **Quality:** meaningful unit/component tests; CI on PRs.
3. **Schema integrity:** regenerate Supabase types; reconcile `flutter` drift.
4. **Polish:** unify preview runtime; revisit model pinning; a11y pass.

## Epics

- **E1 — Security & production-readiness:** hide AI keys, add rate limiting,
  enforce auth, tighten Supabase policies.
- **E2 — Reliability & QA:** test coverage, error-state coverage, CI gates.
- **E3 — Output quality:** prompt/model tuning, framework parity (flutter),
  preview fidelity.

## Risks/Blockers

| Risk | Severity | Detail |
| :--- | :--- | :--- |
| **AI keys exposed client-side** | High | Gemini/Groq keys ship in the bundle; abusable. No server-side rate limiting. |
| **Live secrets in `CLAUDE.md`** | High | Real-looking Gemini/Groq/Supabase keys are committed in the doc. Rotate + remove. |
| **Supabase types drift** | Med | `src/integrations/supabase/types.ts` describes a bug-tracker schema; `conversions` table is not typed. |
| **Guest mode in dev** | Med | Login guard commented out; persistence conditional. **Confirmed P1 target: re-enable required login** (QA TC-007/AC-004). |
| **No CI / thin tests** | Med | Only a trivial test; no pipeline; regressions slip silently. E2E target = **Playwright** (QA plan's Cypress superseded); `data-testid` hooks still missing. |
| **Planning docs ↔ code mismatch** | Low/Med | `CLAUDE.md` + original build spec `reference/prompt.md` + `reference/QA_TEST_DOCUMENT.md` describe the Next.js/server design; migrated to `docs/project-docs/reference/` as non-authoritative source. SDD docs are truth. |
| **Framework drift** | Low | `flutter` in `Framework` type but not in picker; `native-html` preview tab shows but has no preview renderer. |

## Success Metrics

- All High-severity risks closed before any public deploy.
- Green CI (lint + type-check + tests) on `main`.
- Generated-types file matches the live Supabase schema.

## Related Documents

- [architecture.md](./architecture.md) — ADRs behind the current state.
- [ci-cd.md](../operations/ci-cd.md) — pipeline gap.
- [database.md](../development/database.md) — schema drift detail.
- [api-contract.md](../development/api-contract.md) — provider constraints.

## Open Questions

- Commit the pending working-tree changes, or finish them first?
- Adopt phases (`foundation/phases/`) and a changelog? (Step 2.5.)
- Keep CLAUDE.md, rewrite it to match reality, or archive it?
