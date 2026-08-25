# Phase P2 — Deploy & Webmu Cash Engine

## Phase Goal
Make the business able to *take money*: deploy to a live URL, produce sellable demo pages, and stand up the Webmu one-pager (Bahasa, WhatsApp CTA, QRIS). The SliceUI tool is the invisible production engine here — this phase does **not** require persistence or live auth.

## Timeline
Start → End: **Next (first revenue-critical phase).** Do not block on Supabase — the app runs local-only today and that is sufficient for the cash engine.

## Feature Summary & Core Functions
- Rotate committed API keys (Gemini/Groq/Supabase) out of the repo; move to gitignored `.env.local`.
- Decide ADR-001 (client-side vs server-side AI keys) for the deployed app.
- Deploy the Vite SPA to Vercel (static; no Supabase wiring needed yet).
- Produce 3 demo pages (bakery, clinic, wedding vendor) using the tool — doubles as portfolio and QA.
- Build the Webmu one-pager (separate from the SliceUI landing): hero, 3 demos, pricing, WhatsApp CTA, QRIS placeholder.
- Stand up a QRIS merchant entity (NPWP/UMKM) — user-owned non-code workstream.
- Prepare a sales motion: DM templates + before/after assets.

## Sub-Functions / Tasks
- [x] Rotate committed Gemini/Groq/Supabase keys; scrub from root `CLAUDE.md` and any tracked `.env`; move to gitignored `.env.local` *(scrub done 2026-08-25 — `.env` untracked+deleted, keys moved to `.env.local`, `CLAUDE.md` rewritten to pointer. Gemini rotation = user action, pending at STOP gate)*
- [ ] Decide + record ADR-001 (client-side keys vs backend proxy) in `foundation/architecture.md`
- [ ] Deploy Vite SPA to Vercel (static host)
- [ ] Generate demo #1 (bakery) with the tool; hand-fix to production quality
- [ ] Generate demo #2 (clinic) with the tool; hand-fix to production quality
- [ ] Generate demo #3 (wedding vendor) with the tool; hand-fix to production quality
- [ ] Build Webmu one-pager (Bahasa: hero, 3 demos, pricing Rp 400k–1.2jt, WhatsApp CTA, QRIS placeholder)
- [ ] Register QRIS merchant entity (NPWP/UMKM) — user-owned, non-code
- [ ] Write DM/WhatsApp outreach templates + prepare before/after assets

## Sprint Tracker
| Sprint | Scope | Status |
| :--- | :--- | :--- |
| — | (not started) | ⏳ |

## Acceptance Criteria
- [ ] Webmu one-pager is live at a URL a non-coder can open and share.
- [ ] 3 demo pages are visible and production-quality.
- [ ] WhatsApp CTA and a payment path (QRIS placeholder or link) are present.
- [ ] Zero committed secrets — `git grep` finds no live keys; keys live only in gitignored `.env.local`.

## Dependencies & Blockers
- Key rotation (security blocker) must precede deploy.
- QRIS merchant entity is user-owned (NPWP/UMKM); code can proceed with a placeholder.
- No Supabase dependency — persistence is deliberately deferred to P3.

## Status
**Not Started.**

## Deprecated Features
- None. (Persistence/auth, formerly "P2", moves to P3.)
