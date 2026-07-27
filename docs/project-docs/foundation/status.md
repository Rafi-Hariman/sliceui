# Status - SliceUI

## 1. Description

Snapshot of what SliceUI currently is, what was recently accomplished, what is
in flight, and the delta between the implemented product and the older
`CLAUDE.md` plan. Accurate as of 2026-07-24 (Inferred from codebase + git).

## 2. Important

- **Active branch:** `feat/sliceui-mvp-cleanup` - 13 commits ahead of `main`,
  not merged. A large cleanup + hardening pass landed here (rebrand, route
  protection, metered `/convert` edge function, `credits`/`usage_log` + RLS,
  WCAG 2.2 AA remediation, Vitest + Playwright smoke + CI). See the
  [session handoff (2026-07-26)](./session-handoff-2026-07-26.md).
- **Active cycle:** [**C1 - Functional Production (Local)**](./phases/phase-C1-functional-production.md)
  stands the backend up live and ships the History page + entitlement UX +
  targeted polish. Public deploy + key scrub are deferred to the next cycle.
- The top-level `CLAUDE.md` describes a Next.js design that was **never built**
  (the real app is Vite/React). It is non-authoritative; this file + the
  codebase are truth. The original build spec lives in
  [`reference/prompt.md`](../reference/prompt.md).

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

- Not a release log (no `changelog.md` yet - see Step 2.5 decision pending).
- Not per-sprint burndown (no phases set up yet).

## Current State

- **Working app** on the cleanup branch: `/` landing, `/auth` (email/password
  signup/login/logout + forgot-password), `/slice` upload → generate → code,
  `/dashboard` (analytics + conversions table), `/settings`. Routes protected by
  `ProtectedRoute`.
- **AI pipeline** dual-mode: client-side Gemini/Groq for local dev, or the
  **metered `/convert` edge function** (keys hidden, free=Gemini/Pro=Claude,
  `credits`/`usage_log` metering) when `VITE_CONVERT_PROXY_URL` is set.
- **Backend:** edge function + 2 migrations exist in-repo; **not yet verified
  live** (C1.1 applies migrations, deploys the function, sets secrets, and
  introspects RLS). Supabase MCP read calls returned permission errors in the
  2026-07-26 planning session - re-auth at execution.
- **Tests + CI:** 15 Vitest cases + Playwright smoke; `.github/workflows/ci.yml`
  runs lint · tsc · test · build (+ non-blocking Playwright).
- **Not deployed:** the app has no public host; backend deploy is the C1.1 step.

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

- TBD - no telemetry/dashboards configured. Candidate metrics listed in
  `prd.md` → Success Metrics.

## Roadmap

1. **[Active - C1] Functional production, local:** stand backend up live, ship
   the History page + entitlement UX + regenerate, tighten UX/a11y. See
   [phase-C1](./phases/phase-C1-functional-production.md).
2. **Next cycle - go public:** rotate leaked keys + scrub git history; deploy
   the app to a host (Vercel/Netlify) + minimal analytics.
3. **Then - monetize:** Phase 1 Stripe billing (Pro $19/mo + credit packs) +
   Chrome extension.
4. **Ongoing hardening:** signed URLs (B2), idempotency (B6), token/COGS capture
   (B7), observability (B14) - gate on real usage.

## Epics

- **E1 - Security & production-readiness:** hide AI keys, add rate limiting,
  enforce auth, tighten Supabase policies.
- **E2 - Reliability & QA:** test coverage, error-state coverage, CI gates.
- **E3 - Output quality:** prompt/model tuning, framework parity (flutter),
  preview fidelity.

## Risks/Blockers

| Risk | Severity | Detail |
| :--- | :--- | :--- |
| **Leaked keys in `main` git history** | High | Gemini/Groq/Supabase keys were committed on `main`. Redacted on the branch tip, but history still holds them. Rotate + scrub history before any public push (next cycle). |
| **AI keys exposed client-side** | Med → mitigated | The metered `/convert` edge function hides keys when `VITE_CONVERT_PROXY_URL` is set (C1.1 deploys it). Client-side keys remain only as a local-dev fallback when the proxy is unset. |
| **Backend not verified live** | Med | Migrations + edge function exist in-repo but were never applied/deployed. C1.1 applies them, sets secrets, and introspects RLS. Supabase MCP read calls errored in planning - re-auth at execution. |
| **Supabase types drift** | Med | `src/integrations/supabase/types.ts` predates `conversions`/`credits`/`usage_log`. C1.1 regenerates it. |
| **~~Guest mode in dev~~** | Resolved | `ProtectedRoute` now enforces auth on `/dashboard`, `/slice`, `/settings`. |
| **~~No CI / thin tests~~** | Resolved | `.github/workflows/ci.yml` runs lint · tsc · test · build; 15 Vitest cases + Playwright smoke. `data-testid` hooks present on the slice flow. |
| **Planning docs ↔ code mismatch** | Low | Top-level `CLAUDE.md` still describes the unbuilt Next.js design; treat as non-authoritative (SDD docs + codebase are truth). |
| **Framework drift** | Low | `flutter` was dropped from the `Framework` type + picker (7 web frameworks remain); `Dashboard` `FRAMEWORK_COLORS` still has a harmless `flutter` entry. |

## Success Metrics

- All High-severity risks closed before any public deploy.
- Green CI (lint + type-check + tests) on `main`.
- Generated-types file matches the live Supabase schema.

## Related Documents

- [architecture.md](./architecture.md) - ADRs behind the current state.
- [ci-cd.md](../operations/ci-cd.md) - pipeline gap.
- [database.md](../development/database.md) - schema drift detail.
- [api-contract.md](../development/api-contract.md) - provider constraints.

## Open Questions

- Commit the pending working-tree changes, or finish them first?
- Adopt phases (`foundation/phases/`) and a changelog? (Step 2.5.)
- Keep CLAUDE.md, rewrite it to match reality, or archive it?
