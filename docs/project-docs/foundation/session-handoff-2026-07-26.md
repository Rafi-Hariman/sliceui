# Session Handoff — SliceUI (2026-07-26)

> **Resume in a new session with this prompt:**
> `Resume session from docs/project-docs/foundation/session-handoff-2026-07-26.md`

This is a self-contained snapshot of where the project stands after a long
engineering+product session, so context can be cleared and a fresh session can
pick up cleanly. Treat it as the source of truth for "what state are we in."

---

## TL;DR
- **Branch:** `feat/sliceui-mvp-cleanup` — **12 commits, pushed to origin**, **not merged** to `main`.
- **Nothing is deployed / live.** All work is code + migrations in-repo, gate green, but runtime-unverified.
- **Working tree clean** (only untracked tooling dirs `.claude/`, `.eha/`).
- **Supabase MCP is now authenticated** → a new session can apply migrations, introspect RLS, and verify the money path live without re-auth.
- **Recommended next move (PM):** stop building → merge → deploy → verify money path → soft-launch free tier → measure activated signups. Defer Stripe + Chrome extension until demand is validated.

---

## What the project is
**SliceUI** — screenshot → framework-specific frontend **component** code.
Vite 5 + React 18 + TypeScript + shadcn/ui (Radix) + Tailwind 3 + Supabase
(auth/DB/storage) + AI (Gemini primary, Groq fallback; Claude on the paid path).
Exported from Lovable. Target customer: **freelancers**, ~$19/mo Pro,
freemium + credits, **web frameworks only** (7: Tailwind/React/Vue/Bootstrap/Next/Svelte/HTML).

---

## Work streams completed (all on the branch)

### 1. SDD docs (`docs/project-docs/`)
Full Tier-2 set: foundation (prd/architecture/workflow/status/phases/changelog),
development (testing/database/ui-ux/api-contract + ui-ux-audit), operations
(ci-cd/deploy-metered-convert/backend-audit), technical-guidelines (3),
reference/ (migrated prompt.md + QA_TEST_DOCUMENT). `index.md` is the catalog.

### 2. Technical MVP cleanup
- Rebranded Auth (was "Triage" bug-tracker); removed Lovable Google OAuth + `@lovable.dev/cloud-auth-js`.
- Hid bug-tracker Settings tabs (kept code); wired real `OptionsBar`; deleted 5 dead components.
- Route protection (`ProtectedRoute`); fixed history fetch (`profile.id`→`user.id`); conversion delete; request-id guard in `useConvert`; reject empty files.
- Vitest (15 tests) + Playwright smoke + GitHub Actions CI.

### 3. Phase 0 — metered `/convert` (the revenue prerequisite)
- Edge function `supabase/functions/convert/index.ts` (Deno): auth, entitlement, free daily limit, Pro credit reserve, tiered routing (Gemini/Claude), metering, CORS allowlist, image size cap.
- `credits` + `usage_log` tables + RLS + signup trigger (migration 1).
- Client: env-gated proxy switch (`VITE_CONVERT_PROXY_URL`).

### 4. UI/UX audit + remediation (WCAG 2.2 AA)
- `development/ui-ux-audit.md` (findings + Gherkin-free fix list).
- Fixed: focus rings repo-wide, aria-labels, button-in-`<Link>`, contrast tokens, target sizes, token-only colors, one font, pruned `severity-*`.
- New `HeroDemo` (real before/after) replaces 3D cube; Free/Pro pricing block; "Try again" retries; history deep-link works; forgot-password.

### 5. Backend audit + safe fixes
- `operations/backend-audit.md` (B1–B14 + Gherkin test matrix).
- Fixed (migration 2 `20260725100000_rls_and_triggers.sql`): RLS on `conversions`+`profiles`+storage; atomic `decrement_credit` rpc; profiles-on-signup trigger.
- Edge fn: failed-quota no longer consumes free quota; atomic reserve-before-generate; CORS allowlist; image size validation.

---

## Git state
Branch `feat/sliceui-mvp-cleanup`, 12 commits ahead of `main`:
```
5a4cb1f fix(backend): RLS + atomic decrement + quota/CORS/validation
83ed7b9 docs(backend): audit (B1–B14) + Gherkin + runbook notes
06cdb68 fix(a11y,ux): WCAG 2.2 AA remediation + functional fixes
b5f1914 feat(landing): before/after hero + Free/Pro pricing
8f52620 docs(a11y): WCAG audit report
60e578e feat(server): metered /convert edge function + credits
491791c refactor(product): drop Flutter + sharpen prompts
1473882 chore: redact secrets, untrack .env, lint nits
f8d7502 test: vitest, playwright smoke, CI
9e793f8 fix: auth routes, history, convert hardening
9da4d92 feat(ui): rebrand, remove Lovable OAuth, cleanup
bcbdb5b docs: SDD project docs + reference migration
```
`main` is the old Lovable-export state (unmodified). PR not opened (`gh` not installed; create at https://github.com/Rafi-Hariman/sliceui/pull/new/feat/sliceui-mvp-cleanup).

---

## ✅ Verified vs ⚠️ Unverified
**Verified (local gate, green):** `npm run lint` 0 errors · `tsc --noEmit` 0 errors · 15/15 Vitest · `npm run build` OK. Static greps confirm audit fixes (0 button-in-Link, 0 hardcoded colors, 19 aria-labels, 9 focus-visible patterns).

**Unverified (needs runtime — DO THIS BEFORE LAUNCH):**
- Backend is **not deployed**: the 2 migrations aren't applied, edge function isn't deployed, secrets not set.
- **RLS not introspected live** (B1 was the top risk — confirm every table has RLS on with the new policies).
- **Metering not load-tested** (the atomic-credit race case from the Gherkin matrix is the proof).
- **No axe/browser run** for the UI/UX fixes.
- App itself isn't deployed to a public host.

---

## Locked decisions (don't re-litigate)
- Source of truth = **actual codebase** (Vite/React), not `CLAUDE.md` (describes a Next.js design that was never built).
- Bug-tracker ("Triage") code: **hide, don't delete**.
- Auth: **Supabase email/password only** (Google OAuth removed).
- Product: **freelancers · $19/mo Pro · freemium+credits · free=Gemini, paid=Claude (claude-sonnet-4-6) · web-only (Flutter dropped)**.
- Backend safe-fixes done; the deferred items below are explicitly out of scope until usage justifies them.

---

## ⚠️ Still-open risks
1. **Leaked keys in git history** — Gemini/Groq/Supabase keys were committed on `main`. Redacted from the branch tip, but `main`'s history still has them. **Rotate + scrub history before any public push.** (User asked to set this aside strategically, but it remains a hard launch blocker.)
2. **Client-side AI keys** until the Phase 0 proxy is deployed.
3. **Storage still public** via `getPublicUrl` (owner-scoped policies are in place; signed URLs deferred — B2).

---

## Deferred / not built (documented, gate on real usage)
- **Phase 1 Stripe billing** (Pro $19/mo + credit packs) — not started.
- **Chrome extension** (distribution bet) — not started.
- Backend: B2 signed URLs · B6 idempotency · B7 token/COGS capture · B9 `original_image_path` · B10 auth `fetchProfile` race · B11 reproducible `config.toml` · B14 observability.
- `.claude/` and `.eha/` tooling dirs are untracked (commit or gitignore — user's call).

---

## Immediate next steps (ordered)
1. **Apply migrations** (Supabase MCP is authed): `apply_migration` for `credits_usage` + `rls_and_triggers`, or `supabase db push`.
2. **Introspect RLS live**: `select relname, relrowsecurity from pg_class where relname in ('conversions','profiles','credits','usage_log');` → all `true`. Run `get_advisors` (security).
3. **Deploy the edge function** + set secrets (`ANTHROPIC_API_KEY`, `GEMINI_API_KEY`, `ALLOWED_ORIGINS`, `MAX_IMAGE_BYTES`). See `operations/deploy-metered-convert.md`.
4. **Run the Gherkin metering matrix** against live (esp. atomic-credit concurrency).
5. **Merge → main; deploy the app** (Vercel/Netlify/Lovable); add minimal analytics (PostHog/Plausible).
6. **Soft-launch free tier** to a real audience (Vue/Svelte dev communities); watch the OMTM: **activated signups** (signup that completes ≥1 conversion).
7. **Rotate leaked keys + scrub history** before going public.
8. Only if activated signups + retention look good → build Phase 1 (Stripe) and the Chrome extension.

---

## Key file pointers
- This handoff: `docs/project-docs/foundation/session-handoff-2026-07-26.md`
- Status (living): `docs/project-docs/foundation/status.md`
- Deploy runbook: `docs/project-docs/operations/deploy-metered-convert.md`
- Backend audit + tests: `docs/project-docs/operations/backend-audit.md`
- UI/UX audit: `docs/project-docs/development/ui-ux-audit.md`
- Edge function: `supabase/functions/convert/index.ts`
- Migrations: `supabase/migrations/20260725000000_credits_usage.sql`, `supabase/migrations/20260725100000_rls_and_triggers.sql`
- Supabase project ref: `heaqfnzfxlrsxxckjsix` (MCP authenticated)
