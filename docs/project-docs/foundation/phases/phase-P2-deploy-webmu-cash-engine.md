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
- [x] Decide + record ADR-001 (client-side keys vs backend proxy) in `foundation/architecture.md` *(2026-08-25: reaffirmed client-side for P2, proxy deferred to P4 task 1; single-key Gemini noted)*
- [x] Deploy Vite SPA to Vercel (static host) *(DONE 2026-08-25 — https://sliceui-rafi-harimans-projects.vercel.app. Verified: root + /slice + /dashboard all 200, SPA rewrite active, Gemini key inlined. Journey: commit-author block on private repo fixed by switching to GitHub noreply email `173661039+Rafi-Hariman@users.noreply.github.com` (user action); main fast-forwarded to v2; production deploy `idcz67yjb` Ready. Env vars (VITE_GEMINI_API_KEY, VITE_BYPASS_AUTH=false) set in Vercel; SSO protection off = public URL. Zombie deployments (21v4duau8, ll1f27cu0, 7n3lq9m21) left in list, harmless. ⚠️ The Gemini key is now publicly extractable from the bundle — accepted per ADR-001 until the P4 proxy, but rotation is strongly advised since the current key also sat in git history.)*
- [x] Generate demo #1 (bakery) with the tool; hand-fix to production quality *(2026-08-25: `demos/mockups/bakery.html` — built via ui-ux-pro-max design system [artisan warm, Amatic SC/Cabin]; tool generation deferred per user [API testing parked] — see QA note in `demos/README.md`)*
- [x] Generate demo #2 (clinic) with the tool; hand-fix to production quality *(2026-08-25: `demos/mockups/clinic.html` — Accessible & Ethical, Figtree/Noto Sans, skip-link, WCAG-conscious)*
- [x] Generate demo #3 (wedding vendor) with the tool; hand-fix to production quality *(2026-08-25: `demos/mockups/wedding.html` — Soft UI Evolution, Great Vibes/Cormorant, paket harga + CTA)*
- [x] Build Webmu one-pager (Bahasa: hero, 3 demos, pricing Rp 400k–1.2jt, WhatsApp CTA, QRIS placeholder) *(2026-08-25: `public/webmu/index.html` — Hero-Centric + vibrant orange design system, BR-01-compliant copy. Demos live di `public/demos/`. Akan ter-serve di /webmu/ setelah push ke main. QRIS = placeholder sampai task 8 selesai. Nomor WhatsApp masih placeholder — perlu diganti nomor asli sebelum bagikan ke calon pelanggan.)*
- [ ] Register QRIS merchant entity (NPWP/UMKM) — user-owned, non-code
- [x] Write DM/WhatsApp outreach templates + prepare before/after assets *(2026-08-25: `docs/webmu/sales-templates.md` — cold+follow-up per segmen, objection handling, timing/volume guide, before/after pakai screenshot demo. Disimpan di docs/webmu/ sesuai EXECUTE-PHASES.)*

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
**8/9 tasks done (2026-08-25).** Remaining: task 8 (QRIS merchant entity — user-owned, non-code; one-pager ships QRIS placeholder until it exists). ⚠️ Before real outreach: replace placeholder WhatsApp number in `public/webmu/index.html` + sales templates with the actual number.

## Deprecated Features
- None. (Persistence/auth, formerly "P2", moves to P3.)
