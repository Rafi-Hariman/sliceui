# Phase C1 — Functional Production (Local)

> **SDD note:** This is the master plan for cycle **C1**. Execution briefs per
> role live in [`c1/`](./c1/) —
> [`c1-backend.md`](./c1/c1-backend.md) · [`c1-frontend.md`](./c1/c1-frontend.md) ·
> [`c1-ui-ux.md`](./c1/c1-ui-ux.md) · [`c1-qa.md`](./c1/c1-qa.md).
> Sub-agents implement to pass these specs; the QA brief is the gate.

## Phase Goal

Take SliceUI from "MVP-cleanup branch, runtime-unverified" to **runs end-to-end
at production standard, locally**. Real auth (signup/login/logout/forgot), the
metered `/convert` edge function as the live AI path (keys hidden, usage
metered, free=Gemini / Pro=Claude), a proper authenticated app shell
(**Dashboard → Slice → History → Settings**, Dashboard as landing), a dedicated
rich **History** page, visible **entitlement** (quota/credits), and a tightened
UX. Public app deploy + leaked-key scrub are explicitly **deferred** to the next
cycle.

## Timeline (Start → End)

- **Start:** 2026-07-26 (planned).
- **End:** TBD (target: same week — local-only scope keeps the cycle short).

## Feature Summary & Core Functions

- **Authenticated app shell** — 4-item sidebar with Dashboard as the post-login
  landing page; Settings retained.
- **History page** (`/history`) — dedicated, filterable list extracted out of
  the Dashboard: filter by framework/date, search, regenerate, copy, download,
  export, delete. Shares the conversions cache with Dashboard via react-query.
- **Dashboard split** — Dashboard becomes analytics overview (stat cards +
  framework charts + a "Recent activity" panel that links to History); the full
  table moves to History.
- **Entitlement visibility** — a `UsageIndicator` (free: `used / 5 today`;
  Pro: `N credits left`) backed by a `useEntitlement` hook reading the existing
  `credits` + `usage_log` tables (no new RPC).
- **Backend stood up live** — the two existing migrations applied, the `convert`
  edge function deployed with secrets, Supabase types regenerated (fixes drift),
  and the money path verified against the real Supabase project.
- **Regenerate from history** — deep-link `/slice?conversion=<id>&rerun=1`
  re-runs a past conversion against the current model.
- **Targeted UX polish** — single theme control, desktop sign-out in the avatar
  popover, fix the `/auth → / → /dashboard` double-redirect.

## Sub-Functions / Tasks

Workstream rolls up; detail is in each `c1/*.md` brief.

- [ ] **Backend (A)** — re-auth Supabase; apply migrations 1 + 2; deploy `convert`;
      set secrets (`ANTHROPIC_API_KEY`, `GEMINI_API_KEY`, `ALLOWED_ORIGINS`,
      `MAX_IMAGE_BYTES`, model defaults); regenerate types; set
      `VITE_CONVERT_PROXY_URL`; introspect RLS; run the metering concurrency
      matrix.
- [ ] **Frontend (B)** — add `/history` route; reorder sidebar `navItems`; build
      `History.tsx`; refactor `Dashboard.tsx` to analytics + recent; add
      `usageService` + `useEntitlement` + `UsageIndicator`; wire regenerate;
      polish pass.
- [ ] **UI/UX (C)** — History wireframe + IA; Dashboard-split design; entitlement
      indicator design; WCAG 2.2 AA consistency pass; doc updates.
- [ ] **QA (D)** — 8 Gherkin ACs; layered test matrix; Vitest + Playwright C1
      specs; run the Definition-of-Done gate.

## Sprint Tracker

| Sprint | Scope | Status |
| :--- | :--- | :--- |
| C1.0 | Plan docs (this file + 4 briefs) + doc-sync | In Progress |
| C1.1 | Backend stood up + money path verified | Not Started |
| C1.2 | Frontend nav + History + entitlement + polish | Not Started |
| C1.3 | UI/UX design + a11y pass | Not Started |
| C1.4 | QA gate (lint · tsc · vitest · build · playwright · RLS · metering) | Not Started |

## Acceptance Criteria (summary — full Gherkin in [`c1-qa.md`](./c1-qa.md))

- AC-C1-01 Auth: signup → confirm → login → logout; protected routes redirect
  anonymous users to `/auth`.
- AC-C1-02 Slice happy path via the edge function: code returned, `usage_log`
  row written, conversion persisted and visible in History.
- AC-C1-03 Free daily limit: the 6th same-day success returns 429
  `daily_limit_reached`; the UI shows the exhausted state.
- AC-C1-04 Pro atomic credit: concurrent requests never over-spend.
- AC-C1-05 History: filter/search/regenerate/export/delete all work; regenerate
  creates a new conversion.
- AC-C1-06 Entitlement indicator reflects `used/5` (free) and `balance` (Pro),
  incrementing after a conversion.
- AC-C1-07 Deep-link open + `rerun=1` auto-generate.
- AC-C1-08 RLS: cross-user isolation on conversions / credits / usage_log.

## Definition of Done

- `npm run lint` · `npx tsc --noEmit -p tsconfig.app.json` · `npm run test` ·
  `npm run build` all green.
- Playwright C1 spec green against `npm run preview` talking to the deployed
  edge function.
- RLS introspection: `conversions`, `profiles`, `credits`, `usage_log` all
  `rowsecurity = true`; `get_advisors` (security) clean or triaged.
- Metering concurrency test passes (no over-spend).
- Manual smoke passes (signup → confirm → login → convert → History →
  regenerate → quota increments → logout).
- All new History controls carry `data-testid` + a11y labels.

## Dependencies & Blockers

- **Depends on:** valid `ANTHROPIC_API_KEY` + `GEMINI_API_KEY` supplied to set
  as Supabase secrets (else fall back to client-side keys, flagged non-prod).
- **Depends on:** Supabase MCP re-auth, or the `supabase` CLI linked to project
  `heaqfnzfxlrsxxckjsix` (read calls returned permission errors in the planning
  session).
- **Depends on:** a pre-seeded **confirmed** test user (email confirmation stays
  ON — D6).
- **Blocks:** the next cycle (public deploy + key scrub + Stripe billing).

## Status

**In Progress — C1.0 (plan docs).**

## Locked decisions

| # | Decision |
|---|----------|
| D1 | End-state = local end-to-end, production standard. No public deploy, no git key scrub. |
| D2 | AI path = metered edge function via `VITE_CONVERT_PROXY_URL`. |
| D3 | Sidebar: Dashboard (landing) → Slice → History → Settings. |
| D4 | History = dedicated, rich page (extract from Dashboard + filters/regenerate/export). |
| D5 | Entitlement indicator in the app (free `used/5`, Pro `balance`). |
| D6 | Email confirmation stays ON; E2E uses pre-seeded confirmed test users. |
| D7 | No schema change by default (optional migration 3 only if time allows). |
| D8 | Source of truth = real Vite/React codebase + SDD docs, not top-level `CLAUDE.md`. |

## Deprecated Features

- None removed. The conversions table is **moved** from Dashboard to History, not
  deleted. Guest-mode generation was already removed in the prior cleanup branch.
