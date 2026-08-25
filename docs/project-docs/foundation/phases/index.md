# Phases — SliceUI

## 1. Description
Registry of the active development phases for SliceUI. Each phase file tracks goal, scope, tasks, sprint tracker, and status.

## 2. Important
- **Inferred from codebase (2026-08-24):** phases are inferred from the current repo state, confirmed by the user via the Refresh workflow. Adjust scope as reality shifts.
- Persistence + live auth are **not provisioned** — this drives Phase P2's scope.
- Root `CLAUDE.md` and `prompt.md` describe the (superseded) Next.js plan; this phases registry reflects the actual Vite SPA roadmap.

## 3. Table of Contents
- [1. Description](#1-description)
- [2. Important](#2-important)
- [3. Table of Contents](#3-table-of-contents)
- [4. Scope](#4-scope)
- [5. Goals](#5-goals)
- [6. Non Goals](#6-non-goals)
- [7. Project Type](#7-project-type)
- [8. Overall Timeline](#8-overall-timeline)
- [9. Phase Registry](#9-phase-registry)
- [10. How to Add New Phases](#10-how-to-add-new-phases)
- [11. Success Metrics](#11-success-metrics)
- [12. Related Documents](#12-related-documents)
- [13. Open Questions](#13-open-questions)

## 4. Scope
Covers the execution plan for the SliceUI app from its current state to first release.

## 5. Goals
Track development cycles concretely so anyone (human or agent) can see what's done, what's active, and what's next.

## 6. Non Goals
Does not hold product requirements (see `foundation/prd.md`) or architecture decisions (see `foundation/architecture.md`).

## 7. Project Type
**Brownfield** — the repo contains a functional Vite + React SPA with a working slice pipeline; phases are named `phase-P{N}`.

## 8. Overall Timeline
| Phase | Theme | Status | Timeline |
| :--- | :--- | :--- | :--- |
| P1 | Foundation & MVP | 🟢 Functional | Complete via prior commits |
| P2 | Deploy & Webmu Cash Engine | 🟡 In progress | 8/9 done — deploy, demos, one-pager, sales. Remaining: QRIS (user) + WA number |
| P3 | SliceUI Tool Productization | 🟢 Complete | 10/10 — persistence + live auth + RLS verified |
| P4 | Quality, Security & Release | 🟡 In progress | 6/8 — proxy, CI, scrub, README, changelog. Remaining: launch + release tag (STOP) |

## 9. Phase Registry
| Phase | File | Status | Summary |
| :--- | :--- | :--- | :--- |
| P1 | [phase-P1-foundation-mvp.md](phase-P1-foundation-mvp.md) | 🟢 Functional | Dev loop, design system, slice pipeline, AI fallback |
| P2 | [phase-P2-deploy-webmu-cash-engine.md](phase-P2-deploy-webmu-cash-engine.md) | 🟡 In progress | Tasks 1–3 done (scrub, ADR-001, Vercel prod live); next: 3 demo pages, Webmu one-pager, QRIS, sales motion |
| P3 | [phase-P3-sliceui-tool-productization.md](phase-P3-sliceui-tool-productization.md) | 🔴 Not started | Provision persistence + live auth, id-consistency, dead-path fix, Svelte preview, naming |
| P4 | [phase-P4-quality-security-release.md](phase-P4-quality-security-release.md) | 🔴 Not started | Backend proxy, CI, security scrub, i18n, free launch, first release |

> **Superseded phase files (removed):** `phase-P2-persistence-auth.md`, `phase-P3-polish-completion.md`, `phase-P4-quality-release.md`. Their remaining scope was re-sequenced into the corrected-C phases above (P3 now owns persistence/auth/polish; P4 owns quality/security/release).

## 10. How to Add New Phases
1. Create `phase-P{N}-<short-description>.md` using the phase file template (Phase Goal, Timeline, Feature Summary, Sub-Functions/Tasks, Sprint Tracker, Acceptance Criteria, Dependencies & Blockers, Status, Deprecated Features).
2. Add a row to the Phase Registry table above.
3. Update `foundation/status.md` roadmap to cross-reference the new phase.

## 11. Success Metrics
Every phase file is up to date with its status, and the registry matches `foundation/status.md` epics/roadmap.

## 12. Related Documents
- [Status](../status.md)
- [PRD](../prd.md)
- [Architecture](../architecture.md)

## 13. Open Questions
- None.
