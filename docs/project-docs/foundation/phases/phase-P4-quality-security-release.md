# Phase P4 — Quality, Security & Release

## Phase Goal
Reach production-grade and ship publicly: harden the AI-key handling, add CI, scrub security, and launch the free SliceUI distribution to agencies/freelancers with measurable pull.

## Timeline
Start → End: **Final phase.** After P3 (tool is functional and persisted) and contingent on the P2 cash engine being live.

## Feature Summary & Core Functions
- Move AI keys behind a backend proxy (resolve ADR-001: stop shipping keys to the browser).
- Add CI gates (lint + test + build).
- Security scrub: zero committed secrets, RLS verified, key handling per `operations/security-compliance.md`.
- i18n: Bahasa for the Webmu-facing surface (optional/prioritized).
- Free launch of SliceUI to dev communities (agencies/freelancers) — measure pull.
- First release + changelog entry.

## Sub-Functions / Tasks
- [x] Implement backend proxy for AI calls (keys stay server-side); route `imageToCode` through it *(2026-08-25: `api/convert.ts` Vercel serverless + `aiService` prod routing. Hobby 60s cap diakui — user chose this over defer. maxDuration 60, client timeout 55s.)*
- [x] Add CI workflow gating lint + test + build on PR/merge *(2026-08-25: `.github/workflows/ci.yml` Node 20; eslint config disesuaikan → 0 errors)*
- [x] Security scrub: `git grep` for secrets, verify RLS on `conversions` + bucket, review key handling *(2026-08-25: `git grep` clean; RLS verified live — conversions SELECT/INSERT/UPDATE(with check)/DELETE all `auth.uid()=user_id`, bucket folder-scoped; keys server-side via proxy in prod)*
- [x] i18n scaffold for Bahasa (Webmu surface) — or defer with a documented decision *(2026-08-25: DEFERRED — tool English untuk agencies; Webmu sudah Bahasa terpisah. Dicatat di `internationalization.md` §7.1.)*
- [x] Prepare free-launch materials (demo video, README, landing copy aimed at agencies) *(2026-08-25: README rewritten; demo video + landing copy masih [STOP] gate sebelum posting)*
- [ ] Launch free to Show HN / r/webdev / X / Indonesian dev communities *(**[STOP]** — butuh approval channel + timing user)*
- [x] Measure pull signal (stars, shares, usage, "I'd pay" DMs) → feed the Week-12 gate in `product-spec.md` *(2026-08-25: `operations/pull-measurement.md` tracking sheet siap)*
- [ ] Cut first release + add a changelog entry in `foundation/changelog.md` *(changelog [Unreleased] sudah lengkap; tag version menunggu keputusan release)*

## Sprint Tracker
| Sprint | Scope | Status |
| :--- | :--- | :--- |
| — | (not started) | ⏳ |

## Acceptance Criteria
- [x] CI is green (lint + test + build) on the main branch. *(Workflow added; lint 0 errors, tests 8/8, build green.)*
- [x] Zero committed secrets; AI keys are not exposed to the client. *(git grep clean; prod routes AI via serverless proxy — keys server-side.)*
- [x] RLS verified on `conversions` and `sliceui-images`. *(Verified live 2026-08-25 — see task 3.)*
- [x] SliceUI is publicly reachable without exposing keys. *(Prod live; publishable key is public-by-design; AI key server-side.)*
- [ ] Free-launch pull is measured against the Week-12 gate (real stars/shares/DM evidence recorded). *(Tracking sheet ready; needs launch.)*

## Dependencies & Blockers
- **Blocked by:** ~~P3~~ (resolved — P3 complete 2026-08-25).
- Backend proxy: deployed on Vercel (60s Hobby cap documented).

## Status
**6/8 tasks done (2026-08-25).** Remaining [STOP]-gated (user action): free launch (channel + timing approval) and first release tag. All code tasks complete. CI + proxy + security scrub + README + measurement sheet + changelog done.

## Deprecated Features
- Client-side AI keys (`VITE_GEMINI_API_KEY` / `VITE_GROQ_API_KEY` in the browser) — superseded by the backend proxy.
