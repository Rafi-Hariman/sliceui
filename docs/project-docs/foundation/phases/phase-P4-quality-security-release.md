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
- [ ] Implement backend proxy for AI calls (keys stay server-side); route `imageToCode` through it
- [ ] Add CI workflow gating lint + test + build on PR/merge
- [ ] Security scrub: `git grep` for secrets, verify RLS on `conversions` + bucket, review key handling
- [ ] i18n scaffold for Bahasa (Webmu surface) — or defer with a documented decision
- [ ] Prepare free-launch materials (demo video, README, landing copy aimed at agencies)
- [ ] Launch free to Show HN / r/webdev / X / Indonesian dev communities
- [ ] Measure pull signal (stars, shares, usage, "I'd pay" DMs) → feed the Week-12 gate in `product-spec.md`
- [ ] Cut first release + add a changelog entry in `foundation/changelog.md`

## Sprint Tracker
| Sprint | Scope | Status |
| :--- | :--- | :--- |
| — | (not started) | ⏳ |

## Acceptance Criteria
- [ ] CI is green (lint + test + build) on the main branch.
- [ ] Zero committed secrets; AI keys are not exposed to the client.
- [ ] RLS verified on `conversions` and `sliceui-images`.
- [ ] SliceUI is publicly reachable without exposing keys.
- [ ] Free-launch pull is measured against the Week-12 gate (real stars/shares/DM evidence recorded).

## Dependencies & Blockers
- **Blocked by:** P3 (persistence + live auth + preview + naming).
- Backend proxy requires a serverless function (Vercel) — depends on the P2 deploy target.

## Status
**Not Started.**

## Deprecated Features
- Client-side AI keys (`VITE_GEMINI_API_KEY` / `VITE_GROQ_API_KEY` in the browser) — superseded by the backend proxy.
