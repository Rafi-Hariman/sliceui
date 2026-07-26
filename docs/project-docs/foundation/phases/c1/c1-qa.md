# C1 — QA / Tester execution brief

> **Role:** QA/tester (sub-agent). **Master plan:**
> [`../phase-C1-functional-production.md`](../phase-C1-functional-production.md).
> **This brief is the cycle gate.** Write ACs early (parallel with the other
> streams), execute the gate last.

## Goal

Lock the cycle's acceptance criteria, map them to layered automated + manual
checks, add the new test files, and run the Definition-of-Done gate.

## Acceptance criteria (Gherkin)

```gherkin
Feature: C1 — Functional production (local)

  Background:
    Given the /convert edge function is deployed and secrets are set
    And the app runs locally with VITE_CONVERT_PROXY_URL pointing at it

  Scenario: AC-C1-01 Auth end-to-end
    When a visitor signs up with email/password
    Then a confirmation email is sent
    When they confirm and log in
    Then they land on /dashboard
    And an anonymous visitor to /slice is redirected to /auth
    And a logged-in user can sign out

  Scenario: AC-C1-02 Slice happy path via the edge function
    Given a confirmed free user is logged in
    When they upload an image, pick a framework, and Generate
    Then highlighted code appears
    And a usage_log row (status=success, model=gemini) is written
    And the conversion is persisted and visible on /history

  Scenario: AC-C1-03 Free daily limit
    Given the user has 5 same-day successes
    When they attempt a 6th conversion
    Then the server returns 429 daily_limit_reached
    And the UI shows the quota-exhausted state

  Scenario: AC-C1-04 Pro atomic credit (concurrency)
    Given a Pro user with balance=3
    When 5 parallel /convert requests fire
    Then exactly 3 succeed and 2 return 402 no_credits
    And the balance ends at 0 (never negative)

  Scenario: AC-C1-05 History interactions
    Given the user has several conversions
    When they filter by framework, by date, and by search
    Then the list narrows correctly
    When they Regenerate a row
    Then a new conversion is created
    When they Export, Download, and Copy
    Then each succeeds
    When they Delete a row
    Then the row and its storage object are removed

  Scenario: AC-C1-06 Entitlement indicator
    Given a free user with 2 same-day successes
    Then the indicator reads "2 / 5 today"
    When they complete one more conversion
    Then the indicator reads "3 / 5 today"
    Given a Pro user with balance=10
    Then the indicator reads "10 credits"

  Scenario: AC-C1-07 Deep-link open + regenerate
    When the user opens /slice?conversion=<id>
    Then the past conversion loads (code + image)
    When they open /slice?conversion=<id>&rerun=1
    Then a new generation fires automatically with the same framework/options

  Scenario: AC-C1-08 RLS cross-user isolation
    Given users A and B each exist
    When B's session queries A's conversions, credits, or usage_log
    Then B receives no rows and cannot delete A's data
```

## Test matrix (layers)

| Area | Layer | File |
|---|---|---|
| `usageService` + `useEntitlement` | Vitest unit (mocked supabase) | `src/lib/usageService.test.ts` (new) |
| `conversionService` CRUD + errors | Vitest (mocked) | extend existing pattern |
| `prompts` / `aiService.clean` | Vitest unit | existing |
| `useConvert` (proxy + persist + entitlement invalidate) | Vitest component (mocked) | extend `useImageUpload` pattern |
| `History` filters / actions | Vitest component (RTL + jsdom) | `src/pages/History.test.tsx` (new) |
| Auth → Slice → History → entitlement | Playwright E2E (local app → real backend) | `e2e/c1-functional.spec.ts` (new) |
| RLS cross-user isolation | SQL probe (MCP `execute_sql` / CLI) | manual/scripted, recorded below |
| Metering concurrency | Script against deployed `/convert` | recorded below |

## New test files to add

- `src/lib/usageService.test.ts` — mock `supabase.from('credits'|'usage_log')`,
  assert `getCredits` + `getTodayUsageCount` shapes and the date filter.
- `src/pages/History.test.tsx` — render with mocked `useConversions`; assert
  filter-by-framework, search, and that Delete calls `deleteConversion` +
  invalidates the cache; assert empty state.
- `e2e/c1-functional.spec.ts` — `npm run preview` against `.env.local` with the
  proxy set. Flow: login (seeded confirmed user) → `/slice` → upload a fixture
  image → pick Tailwind → Generate → assert code appears and a History row
  exists → open History → filter → regenerate → assert quota increments.
  Mock nothing on the backend; stub only file upload via `setInputFiles`.

## Backend baseline (local stack — 2026-07-26)

Run against the local Supabase stack (`supabase start`, API on `127.0.0.1:54321`).
The remote project `heaqfnzfxlrsxxckjsix` is not used this cycle.

| Check | Expected | Actual |
|---|---|---|
| Migrations applied | all present | ✅ `core_tables` + `credits_usage` + `rls_and_triggers` + `table_grants` (applied via `docker exec psql`) |
| Tables exist | conversions, profiles, credits, usage_log | ✅ all 4 |
| RLS on (all 4 tables) | `rowsecurity=true` ×4 | ✅ verified |
| Signup triggers | credits + profiles rows auto-created | ✅ verified (free/0 + profile row on signup) |
| Owner reads / anon blocked | RLS + grants | ✅ authenticated reads return own rows; anon gets `[]` |
| `decrement_credit` RPC | exists | ✅ |
| Storage bucket | `sliceui-images` (public) | ✅ created |
| `convert` served locally | `/functions/v1/convert` reachable | ✅ served via `supabase functions serve convert --env-file supabase/.env` (after `supabase stop`/`start` from this dir to align container names with `config.toml`). Docker `start` doesn't load `supabase/.env`, so dev serving uses `functions serve`. |
| Metering writes (`usage_log`) | row per attempt | ✅ after `service_role` grant fix (6c85a22) — was silently 403. Verified: failed attempt logged `tailwind/groq/failed`. |
| Concurrency test | 3 ok / 2 denied, balance 0 | ✅ 5 concurrent `decrement_credit` RPCs from balance 3 → `2,1,null,0,null`; final balance 0, never negative |
| Free smoke (metered) | model=gemini, usage_log row | ⚠️ mechanics verified end-to-end (auth→entitlement→routing→key passed [403→429]→Groq fallback). **AI success blocked by external quota:** Gemini key `RESOURCE_EXHAUSTED` (quota 0); Groq account has **no vision model** (15 models, all text/audio). |
| Pro smoke | model=claude, balance−1 | ⏳ pending a valid `ANTHROPIC_API_KEY` (then set `credits.plan='pro'` + balance) |
| `get_advisors` (security) | clean/triaged | n/a on local (MCP scoped to remote) |

### Local reproducer
```sh
# 1. stack already running (supabase start). DB is empty on first start, so apply:
for f in 20260724000000_core_tables 20260725000000_credits_usage \
         20260725100000_rls_and_triggers 20260726000000_table_grants; do
  docker exec -i supabase_db_<host> psql -U postgres -d postgres \
    -v ON_ERROR_STOP=1 < "supabase/migrations/$f.sql"
done
# 2. create the public images bucket (once):
docker exec -i supabase_db_<host> psql -U postgres -d postgres -c \
  "insert into storage.buckets (id,name,public,owner,created_at,updated_at) \
   values ('sliceui-images','sliceui-images',true,'00000000-0000-0000-0000-000000000000',now(),now()) \
   on conflict (id) do nothing;"
# 3. point the app at local (.env.local):
#    VITE_SUPABASE_URL=http://127.0.0.1:54321
#    VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...  (from `supabase status`)
# 4. npm run dev  →  http://localhost:8080
```

> Repro gaps fixed this cycle: `conversions`/`profiles` had no in-repo DDL (added
> `core_tables`), and Dashboard-created tables lacked explicit `anon`/
> `authenticated` grants (added `table_grants`). Both make `supabase db reset`
> work on a fresh stack.

## Definition of Done (the gate — run in order)

```sh
npm run lint
npx tsc --noEmit -p tsconfig.app.json
npm run test
npm run build
# then, against preview + real backend:
npm run preview &  # then:
npx playwright test e2e/c1-functional.spec.ts
```

Plus:
- RLS introspection all `true`; `get_advisors` (security) clean or triaged.
- Metering concurrency test passes.
- Manual smoke: signup → confirm → login → convert → History → regenerate →
  quota increments → logout.
- Every new History control has a `data-testid` + a11y label.

## Done when

Every AC-C1-01..08 is green, the gate commands pass, the Backend baseline table
is filled in, and `phase-C1-functional-production.md` Status reads **Complete**.
