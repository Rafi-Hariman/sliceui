# C1 - Backend execution brief

> **Role:** Backend engineer (sub-agent). **Master plan:**
> [`../phase-C1-functional-production.md`](../phase-C1-functional-production.md).
> **Gate:** [`c1-qa.md`](./c1-qa.md).

## Goal

Stand up the **real** SliceUI backend on Supabase so the locally-running app uses
the metered `/convert` edge function (keys hidden, usage metered, free=Gemini /
Pro=Claude). Then verify the money path live. This **unblocks every other
workstream** - do it first.

## Prerequisites

- Supabase project ref: `heaqfnzfxlrsxxckjsix`.
- Supabase MCP authenticated **or** the `supabase` CLI installed, logged in, and
  linked (`supabase link --project-ref heaqfnzfxlrsxxckjsix`). In the planning
  session MCP read calls returned permission errors - re-auth or use the CLI.
- Valid `ANTHROPIC_API_KEY` and `GEMINI_API_KEY` to set as secrets. If the user
  cannot supply them yet, stop and surface the blocker (do **not** ship
  client-side keys as a silent substitute - that contradicts D2).

## Ordered tasks

1. **Confirm current backend state** (idempotent - verify before applying).
   - `list_migrations` / `supabase migration list` → are `20260725000000_credits_usage`
     and `20260725100000_rls_and_triggers` already applied?
   - `list_tables` (public, verbose) → do `conversions`, `profiles`, `credits`,
     `usage_log` all exist?
   - `list_edge_functions` → is `convert` deployed?
   Record findings in `c1-qa.md` → "Backend baseline".

2. **Apply the migrations** (skip if already applied):
   - `supabase db push`, **or** apply each file via MCP `apply_migration`
     (`supabase/migrations/20260725000000_credits_usage.sql` then
     `supabase/migrations/20260725100000_rls_and_triggers.sql`).

3. **Deploy the edge function:** `supabase functions deploy convert`.

4. **Set secrets** (server-side only - never in the browser bundle):
   ```sh
   supabase secrets set ANTHROPIC_API_KEY=sk-ant-... GEMINI_API_KEY=AIza...
   supabase secrets set CLAUDE_MODEL=claude-sonnet-4-6 GEMINI_MODEL=gemini-2.0-flash FREE_DAILY_LIMIT=5 MAX_IMAGE_BYTES=10485760
   supabase secrets set ALLOWED_ORIGINS=http://localhost:5173,http://localhost:4173
   ```

5. **Regenerate TypeScript types** to fix documented drift (status.md notes
   `conversions`/`credits`/`usage_log` are untyped):
   ```sh
   supabase gen types typescript --linked > src/integrations/supabase/types.ts
   ```
   Then run `npx tsc --noEmit -p tsconfig.app.json` and fix every breakage the
   regen surfaces before touching anything else.

6. **Point the client at the proxy** - set in `.env.local`:
   ```env
   VITE_CONVERT_PROXY_URL=https://heaqfnzfxlrsxxckjsix.functions.supabase.co/convert
   ```
   (Leave `VITE_GEMINI_API_KEY` / `VITE_GROQ_API_KEY` unset in production-mode
   testing - `aiService` only uses them when `VITE_CONVERT_PROXY_URL` is unset.)

7. **Introspect RLS live** and confirm all tables are protected:
   ```sql
   select relname, relrowsecurity
   from pg_class
   where relname in ('conversions','profiles','credits','usage_log')
   order by relname;
   ```
   Expect `true` for all four. Run MCP `get_advisors` (type `security`) and
   triage every finding.

8. **Run the metering concurrency test** (the money-path proof):
   - Seed a Pro test user: `update credits set plan='pro', balance=3 where user_id='<id>';`
   - Fire **5 parallel** authenticated requests to the deployed `/convert`.
   - Assert exactly **3** succeed and **2** return 402 `no_credits`; `balance`
     ends at 0 (never negative). This proves `decrement_credit` atomicity.

9. **Seed confirmed test users** for QA (email confirmation stays ON - D6):
   - User A (free) and User B (free/pro) with `email_confirmed_at` set, plus a
     handful of `conversions` rows for A so History/Dashboard have data, and **no
     rows visible to B** (for the RLS isolation AC).

## Verification (this brief's exit check)

- Smoke (free, Gemini): User A logs in → uploads → generates → a `usage_log`
  success row appears, `model='gemini'`, and the conversion is readable by A only.
- Smoke (Pro, Claude): set `plan='pro'` + balance → generate → `model='claude'`,
  `balance` decremented by 1.
- Free limit: 6th same-day success → 429 `daily_limit_reached`.
- RLS: B's client cannot SELECT/DELETE A's conversions, credits, or usage_log.

## Files touched

- `supabase/*` - deploy + secrets (no source edits to the edge function).
- `src/integrations/supabase/types.ts` - regenerated.
- `.env.local` - `VITE_CONVERT_PROXY_URL`.
- (Optional, gate on time) `supabase/migrations/20260726000000_history_extras.sql`
  → adds `conversions.is_favorite boolean` + `conversions.source_conversion_id uuid`
  (regeneration lineage). Existing owner-scoped policies already cover the new
  columns, so no policy change needed.

## Done when

All eight tasks pass, the two smokes + the concurrency test are green, and the
findings are recorded under `c1-qa.md` → "Backend baseline".
