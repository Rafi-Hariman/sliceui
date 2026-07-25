# Phase P1 — Security & Production Hardening

## Phase Goal

Make SliceUI safe to expose publicly: stop shipping AI API keys to the browser,
remove committed live secrets, enforce authentication, and lock down Supabase
access. This is the highest-priority phase — see Risks in `status.md`.

## Timeline (Start → End)

- **Start:** 2026-07-24 (planned)
- **End:** TBD

## Feature Summary & Core Functions

- Server-side (edge function) proxy for Gemini/Groq so keys never reach the
  client.
- SliceUI-owned rate limiting (replaces the never-implemented "5/day per IP"
  from `CLAUDE.md`).
- Secret hygiene: rotate all keys, purge them from `CLAUDE.md`.
- Auth enforcement: re-enable the login guard currently disabled in
  `useConvert`.
- Supabase hardening: verify/configure RLS on `conversions` and the
  `sliceui-images` bucket.

## Sub-Functions / Tasks

- [ ] Stand up an edge function (Vercel/Lovable/Supabase) wrapping
      `imageToCode`; migrate `aiService` calls to hit it.
- [ ] Implement server-side rate limiting (per user / per IP).
- [ ] Rotate Gemini, Groq, and Supabase keys; update host secret store.
- [ ] Remove live keys from `CLAUDE.md`; add a `.env.local.example`-only policy.
- [ ] Re-enable auth guard in `useConvert` (remove the commented-out check);
      decide guest-preview policy.
- [ ] Audit RLS policies for `conversions` (select/insert/delete by `user_id`)
      and storage bucket paths.
- [ ] Update `api-contract.md` + `architecture.md` ADR-2 to reflect the proxy.

## Sprint Tracker

| Sprint | Scope | Status |
| :--- | :--- | :--- |
| P1.1 | Edge function + key rotation | Not Started |
| P1.2 | Rate limiting + RLS + auth guard | Not Started |

## Acceptance Criteria

- AC: Gemini/Groq keys are absent from the production bundle (grep the built
  assets).
- AC: a deployed request is rate-limited server-side; abuse returns 429.
- AC: unauthenticated users cannot persist conversions (or cannot generate,
  per the chosen guest policy).
- AC: RLS prevents cross-user reads/writes on `conversions`.
- AC: `CLAUDE.md` contains no live secrets.

## Dependencies & Blockers

- **Depends on:** host decision (edge-function support varies).
- **Blocks:** public launch; reliable test targets in P2 (proxy stabilizes the
  AI contract).

## Status

**Not Started.**

## Deprecated Features

- Guest-mode generation (login guard disabled) — to be removed or explicitly
  re-scoped.
