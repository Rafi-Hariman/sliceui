# EXECUTE — SliceUI Corrected-C Build-Out (P2 → P3 → P4)

> **How to use (user):** open a fresh Claude Code session in the repo root and paste:
> `Read EXECUTE-PHASES.md and execute it step by step, phase by phase, respecting every STOP gate.`
>
> This prompt is the **workflow layer** (how to work, guardrails, known state).
> The **authoritative task lists and acceptance criteria live in the phase files** — never duplicate or contradict them here.

---

## 0. Load context FIRST (read-only, before touching any code)

Read these in order:

1. `docs/project-docs/foundation/product-spec.md` — the business: corrected-C, two brands (Webmu = service for Indonesian non-coders; SliceUI = tool for agencies/freelancers), monetization, decision gates, business rules BR-01…06.
2. `docs/project-docs/foundation/phases/index.md` — the phase registry.
3. `docs/project-docs/foundation/phases/phase-P2-deploy-webmu-cash-engine.md`
4. `docs/project-docs/foundation/phases/phase-P3-sliceui-tool-productization.md`
5. `docs/project-docs/foundation/phases/phase-P4-quality-security-release.md`
6. `docs/project-docs/foundation/status.md` — current state.

⚠️ **Ignore the root `CLAUDE.md`** — it is stale (describes a Next.js plan that was never built; the real app is a Vite + React SPA). `docs/project-docs/` is the single source of truth. It contains LIVE API KEYS that must be scrubbed in P2 — do not copy them anywhere.

---

## 1. Non-negotiable working rules

1. **SDD discipline.** Specifications dictate implementation. If a requested change isn't in the specs (`product-spec.md`, `prd.md`, phase files), stop and ask before coding. If code and docs conflict and authority is unclear → surface the conflict, don't guess.
2. **Phase order is fixed: P2 → P3 → P4.** Do not start the next phase until the current phase's Acceptance Criteria pass. Work tasks top-down within a phase unless a dependency says otherwise.
3. **STOP gates (human action required).** When you hit a task marked `[STOP]` below, do everything you can, prepare exactly what the user must do, then **stop and ask**. Never fake completion of a STOP-gated step.
4. **Never commit secrets.** No API keys in code, docs, commit messages, or output. Keys live only in gitignored `.env.local`.
5. **Verify after every code task:** `npm run test` (expect all passing), `npx tsc --noEmit` (see §5 for expected noise), `npm run build` (expect success). Never mark a task complete on red verification.
6. **Doc sync after every task** (EHA 4.5): tick the checkbox in the phase file, update its Sprint Tracker, and sync `foundation/status.md` (+ `foundation/changelog.md` at phase completion). A task isn't done until its docs reflect it.
7. **One commit per logical unit** on a feature branch per `foundation/workflow.md`; conventional commits; never push without being asked.
8. **Ask, don't assume** on anything material (architecture, naming, pricing copy, third-party accounts). Micro-decisions: just do them and note them.

---

## 2. Phase P2 — Deploy & Webmu Cash Engine

*Authoritative tasks: `phase-P2-deploy-webmu-cash-engine.md` (9 tasks). Notes below are the operational layer.*

| # | Task | Operational notes |
|---|---|---|
| 1 | Rotate committed keys | `[STOP]` You: scrub all keys from root `CLAUDE.md` + any tracked `.env`, rewrite `CLAUDE.md` to point at `docs/project-docs/`, verify `git grep` clean. User must then rotate keys at aistudio.google.com + console.groq.com + supabase.com and put new ones in `.env.local`. |
| 2 | Decide ADR-001 | Present the tradeoff (client-side keys = fast but exposed; serverless proxy = safe but work). Recommend: deploy P2 with client-side keys + strict usage expectations, move to proxy in P4 (already planned). Record the ADR in `foundation/architecture.md`. |
| 3 | Deploy to Vercel | `[STOP]` User must run `vercel login` / provide the Vercel project. You: prep `vercel.json`/build settings (static Vite SPA — `npm run build`, output `dist/`), env vars (`VITE_GEMINI_API_KEY`, `VITE_GROQ_API_KEY`), then verify the live URL loads and `/slice` works end-to-end. |
| 4–6 | 3 demo pages (bakery, clinic, wedding vendor) | Generate with the tool itself (deployed `/slice`), hand-fix to production quality, host each as a static page (Vercel) linked from the one-pager. Each demo = portfolio + QA datapoint. Log where the tool struggled (feeds BR-06). |
| 7 | Webmu one-pager | Bahasa Indonesia. Follow BR-01: **no "AI", "screenshot-to-code", "otomatis" jargon** — sell the outcome ("Website usaha Anda jadi dalam 48 jam"). Sections: hero, 3 demo, harga (Rp 400k–1.2jt), CTA WhatsApp, QRIS placeholder. Domain: `webmu.id` (or fallback if taken — verify availability, `[STOP]` before buying). Must be visually separate from the SliceUI landing. |
| 8 | QRIS merchant entity | **User-owned, non-code.** Prepare a checklist (NPWP/UMKM, provider options) and keep a QRIS placeholder on the one-pager until the user confirms the entity exists. Do not block other tasks on this. |
| 9 | Sales motion | Write 2–3 DM/WhatsApp templates (Bahasa, casual-professional, one per segment: bakery/clinic/vendor) + prepare before/after image assets from the demos. Save under `docs/webmu/` or `marketing/` — ask user where they want it. |

**Phase done when:** all 4 acceptance criteria in the phase file pass (live one-pager, 3 demos, WA + payment path, zero committed secrets via `git grep`).

---

## 3. Phase P3 — SliceUI Tool Productization

*Authoritative tasks: `phase-P3-sliceui-tool-productization.md` (10 tasks). Notes:*

- **Supabase provisioning (tasks 1–3):** `[STOP]` The Supabase project/owner is user-provided. Prefer the Supabase MCP tools (`apply_migration`, `generate_typescript_types`) once the user connects the project. Schema = `development/database.md`. RLS: `auth.uid() = user_id` on `conversions`; storage RLS on `sliceui-images`.
- **Regenerating types will also clear the 8 long-standing `tsc` errors in `src/lib/conversionService.ts`** — that's expected and is a P3 success signal, not a surprise.
- **`VITE_BYPASS_AUTH`:** gate to dev-only (`import.meta.env.DEV`), don't delete yet.
- **id-consistency:** standardize on `user.id` (see `useConvert.ts` writer vs `Dashboard.tsx` reader).
- **Svelte preview:** extend `CodeOutput.tsx` `canPreview` + `getPreviewDoc` (pattern exists for Vue global-build; Svelte needs an in-browser compiler — evaluate the lightest approach, ask before adding a heavy dep).
- **Naming:** `index.html` `<title>` + OG tags → "SliceUI" (currently "Triage").

**Phase done when:** signup → slice → save persists; Dashboard shows only the owner's rows; images resolve; build green with new types; preview works for all 7 frameworks; metadata fixed.

---

## 4. Phase P4 — Quality, Security & Release

*Authoritative tasks: `phase-P4-quality-security-release.md` (8 tasks). Notes:*

- **Backend proxy (task 1):** Vercel serverless function wrapping Gemini/Groq; client calls the proxy with no keys in the browser. Update `aiService.ts` to call it; keep the client-side path behind a dev flag. This supersedes the interim ADR-001 decision.
- **CI (task 2):** GitHub Actions — lint + test + build on PR/push to main. Gate file: `docs/project-docs/operations/ci-cd.md`.
- **Free launch (tasks 5–6):** `[STOP]` before actually posting. You prepare everything (launch copy aimed at agencies/freelancers, demo video script, README). User approves channels + timing.
- **Pull measurement (task 7):** define the tracking sheet (stars/shares/usage/"I'd pay" DMs) and wire it to the Week-12 gate in `product-spec.md` §12.
- **First release (task 8):** version tag + `foundation/changelog.md` entry.

---

## 5. Verification cheat-sheet

| Command | Expected |
|---|---|
| `npm run test` | All pass (8 tests as of 2026-08-25; count grows as you add tests) |
| `npx tsc --noEmit` | 0 errors (2026-08-25). Note: `tsconfig.app.json` has `strict: false`, so the missing `conversions` table type compiles silently (`any`) — the old "8 expected errors" claim was inaccurate. Tightening to strict + type-safe persistence is a P4 candidate. |
| `npm run build` | Success (chunk-size warning is pre-existing and acceptable) |
| `npm run dev` | Serves at localhost:8081 |
| `git grep -iE "AIzaSy\|gsk_[A-Za-z0-9]\|sbp_v0_\|sb_publishable_\|eyJhbGciOi" -- ':!supabase/config.toml'` | Empty after P2 task 1 (matches only real key values; `config.toml` may keep the public project ID) |

---

## 6. Known repo state (2026-08-25 — don't re-discover)

- Vite 5 + React 18 + TS + Tailwind + shadcn/ui SPA; react-router v6; Supabase client (not yet provisioned); Gemini `gemini-flash-latest` primary + Groq `pixtral-12b-2409` fallback (both 90s timeout).
- **7 web-only frameworks** (`flutter` deliberately removed); instruction prompt + design-system block wired into `buildPrompt`.
- All routes public (no `ProtectedRoute`); auth runs `VITE_BYPASS_AUTH` mock; persistence services exist but their Supabase targets don't (P3).
- Pages redesigned (Landing/Slice/Auth/Dashboard/Settings + AppLayout/AppHeader shell). Orphaned components await user go-ahead to delete: `ProtectedRoute.tsx`, `FrameworkPicker.tsx`, `UploadZone.tsx`, `GenerateButton.tsx` — **ask before deleting**.
- Playwright `chromium-headless-shell` installed locally (`~/Library/Caches/ms-playwright`).
- Reverse-engineered reference repo at `screenshot-to-code/` (abi, MIT) — read-only reference; do not copy its agent-loop architecture (deliberately out of scope; we ported only the design-system block).
- Council transcripts + reports (`council-*.md/html`) at repo root are decision records — don't delete.

## 7. Explicitly OUT of scope (decided — do not build)

- Full abi port: self-check loop, asset extraction, image generation, variants (contradicts SliceUI's paste-ready differentiator + free-tier 15 RPM budget).
- Flutter / any mobile framework output.
- Paid tier, billing, subscriptions — only after the Week-12 pull gate passes.
- Ads spend of any kind.
- Umbrella branding across Webmu ↔ SliceUI (two separate brands by design).

## 8. Completion report format

When all phases are done (or when you stop at a gate), report:

1. **Done** — tasks completed with verification evidence.
2. **Blocked/waiting on user** — each `[STOP]` gate with exactly what the user must do next.
3. **Deviations** — anything you did differently from the phase files, and why.
4. **Next actions** — the 1–3 highest-value follow-ups.
