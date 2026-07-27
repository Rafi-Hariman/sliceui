# Backend Audit & Test Cases - SliceUI

## 1. Description
A backend review of SliceUI's server/data layer - Supabase (auth, DB, storage,
RLS), the `/convert` edge function, and the client services that call them -
with a Gherkin test-case matrix an engineer can execute. Covers security/RLS
(first), metering correctness, functional gaps, and config/ops.

## 2. Important
- The only migrations in-repo are `credits_usage` and (after this pass)
  `rls_and_triggers`. **`conversions` and `profiles` were created in the live DB
  via the dashboard** - verify they exist and that RLS is on with the policies below.
- Findings are tagged by severity: 🔴 critical · 🟠 correctness · 🟡 gap · ⚪ ops.
- "Safe fixes" implemented alongside this doc are listed in § Implemented fixes.

## 3. Table of Contents
- [1. Description](#1-description) · [2. Important](#2-important) · [3. TOC](#3-table-of-contents)
- [4. Scope](#4-scope) · [5. Goals](#5-goals) · [6. Non Goals](#6-non-goals)
- [Audit findings (B1-B14)](#audit-findings-b1b14)
- [Implemented fixes](#implemented-fixes)
- [Deferred (follow-ups)](#deferred-follow-ups)
- [Gherkin test cases](#gherkin-test-cases)
- [Verification](#verification) · Success Metrics · Related Documents · Open Questions

## 4. Scope
Supabase auth/DB/storage/RLS, `supabase/functions/convert`, and `src/lib`
services (`conversionService`, `storageService`, `AuthContext`). Excludes the
AI provider APIs (see `development/api-contract.md`) and the client UI.

## 5. Goals
- Close data-integrity holes (RLS on every user table; private-ish storage).
- Make metering correct (no quota burned on failures; no credit over-spend).
- Give QA an executable test matrix.

## 6. Non Goals
- Not migrating storage to signed URLs (B2) or adding idempotency (B6) in this pass.
- Not deploying (secrets/`supabase db push` are the operator's step).

---

## Audit findings (B1-B14)

### 🔴 Critical - security / data integrity
- **B1. `conversions` & `profiles` RLS undefined in-repo.** Only `credits`/`usage_log`
  had policies. The client (anon key) performs CRUD on `conversions`. RLS-on-no-
  policy → history breaks; RLS-off → **cross-user data leak**. → *Fixed: policies added.*
- **B2. Storage is public.** `sliceui-images` / `avatars` had no policies; objects
  served via public URLs (world-readable screenshots). → *Partially fixed: owner-
  scoped storage policies added. Signed URLs deferred.*
- **B3. AI keys ship client-side** until Phase 0 proxy deploys; leaked keys still
  in git history (rotate).

### 🟠 Correctness - metering / billing
- **B4. Failed attempts consumed free quota** - daily-limit count included
  `status:'failed'` rows. → *Fixed: count `success` only.*
- **B5. Pro decrement was non-atomic** - read→JS subtract→write TOCTOU; concurrent
  requests over-spent credits. → *Fixed: atomic `decrement_credit` SQL function.*
- **B6. No idempotency** - a retried request can double-charge a credit. *(deferred)*
- **B7. `usage_log.tokens` never written** → COGS not trackable. *(deferred)*

### 🟡 Functional gaps
- **B8. No `profiles` row on signup** - the credits trigger existed but not a
  profiles trigger; new users showed "User". → *Fixed: signup trigger.*
- **B9. Storage path not stored** - delete derives path from URL (fragile). *(deferred)*
- **B10. Auth race** - `onAuthStateChange` defers `fetchProfile` via `setTimeout(0)`. *(deferred)*

### ⚪ Config / ops
- **B11. `config.toml` nearly empty** (just `project_id`) - not reproducible. *(deferred)*
- **B12. Edge CORS was `*`** - open to any origin. → *Fixed: env allowlist.*
- **B13. No server-side image validation** - direct callers bypass client checks. → *Fixed: size cap.*
- **B14. No observability** on the edge function. *(deferred)*

---

## Implemented fixes
| # | Fix | Where |
|---|-----|-------|
| B1 | RLS + `user_id` policies on `conversions` & `profiles` | `supabase/migrations/20260725100000_rls_and_triggers.sql` |
| B2 | Owner-scoped storage policies on `sliceui-images` & `avatars` | same migration |
| B4 | Free daily limit counts `status='success'` only | `supabase/functions/convert/index.ts` |
| B5 | Atomic `decrement_credit(uid)` SQL function; edge calls it via rpc | migration + edge fn |
| B8 | `profiles` row auto-created on signup (trigger) | migration |
| B12 | CORS restricted to `ALLOWED_ORIGINS` env allowlist | edge fn |
| B13 | Reject payloads over the server size cap (`payload_too_large`) | edge fn |

## Deferred (follow-ups)
B2 signed URLs · B6 idempotency key · B7 tokens capture · B9 `original_image_path`
column · B10 auth fetchProfile race · B11 reproducible `config.toml` · B14 observability.

---

## Gherkin test cases

### Auth
```gherkin
Scenario: New user signup creates a credits row and a profiles row
  Given a new email/password signup
  When the auth.users row is created
  Then public.credits has a row (plan='free', balance=0) for that user
  And public.profiles has a row with full_name from user_metadata

Scenario: Session persists across reload
  Given a signed-in user
  When the page is reloaded
  Then the session is restored from localStorage and the profile loads

Scenario: Password reset
  Given a user enters their email and taps "Forgot password?"
  When resetPasswordForEmail succeeds
  Then a reset email is sent (Supabase) and a toast confirms
```

### Conversions + RLS isolation
```gherkin
Scenario: User lists only their own conversions
  Given users A and B each have conversions
  When A requests their conversions as A
  Then A sees only A's rows (never B's)

Scenario: Cross-user read is denied
  Given conversion X owned by user B
  When user A requests X by id with A's anon JWT
  Then the request returns no row (PGRST116) - not B's data

Scenario: Insert is scoped to the authenticated user
  Given a request to insert a conversion with user_id set to another user
  When sent with the caller's anon JWT
  Then the insert is rejected by RLS (user_id mismatch)
```

### Credits / usage / metering
```gherkin
Scenario: Free daily limit counts successes only
  Given a free user with 4 successful and 3 failed conversions today
  When they attempt another
  Then it is allowed (4 < 5; failures don't consume quota)

Scenario: Free user is rate-limited after 5 successes
  Given a free user with 5 successful conversions today
  When they attempt another
  Then the response is 429 daily_limit_reached

Scenario: Pro credit decrement is atomic
  Given a Pro user with balance = 1
  When two concurrent /convert requests arrive
  Then exactly one succeeds and decrements to 0; the other gets 402 no_credits

Scenario: Out of credits
  Given a Pro user with balance = 0
  When they request a conversion
  Then the response is 402 no_credits
```

### Edge function /convert
```gherkin
Scenario: Auth required
  Given a request with no/invalid JWT
  When sent to /convert
  Then the response is 401 unauthorized

Scenario: Tiered routing
  Given a free user and a Pro user each call /convert
  Then the free response model is "gemini" and the Pro response model is "claude"

Scenario: Oversized image rejected
  Given a request whose payload exceeds the server size cap
  When sent to /convert
  Then the response is 400 payload_too_large

Scenario: CORS restricted
  Given a request from an origin not in the allowlist
  When the response is returned
  Then Access-Control-Allow-Origin does not echo that origin

Scenario: Successful conversion is metered
  Given a successful Pro conversion
  When it completes
  Then credits.balance is decremented and usage_log has a 'success' row
```

### Storage
```gherkin
Scenario: Owner can upload/delete their own image
  Given user A is authenticated
  When they upload to sliceui-images/{A}/...
  Then the object is created and A can delete it

Scenario: Cross-user object access denied
  Given an object under {B}/ owned by B
  When A attempts to read/delete it
  Then it is denied by storage RLS
```

### Security (cross-cutting)
```gherkin
Scenario: No AI keys in the client bundle (post-deploy)
  Given the deployed app bundle
  When grepped for key patterns
  Then GEMINI/ANTHROPIC keys are absent (proxy only)

Scenario: RLS enabled on every public table
  Given the live DB
  When introspecting relrowsecurity
  Then conversions, profiles, credits, usage_log all have RLS enabled
```

---

## Verification
- `npm run lint && npx tsc --noEmit -p tsconfig.app.json && npm run test && npm run build` green.
- `supabase db push` applies the new migration cleanly.
- Manual: signup → both `credits` and `profiles` rows exist; Dashboard shows the
  real name; two concurrent Pro requests can't over-spend; a failed conversion
  doesn't reduce the remaining free count.
- RLS introspect: `select relname, relrowsecurity from pg_class where relname in
  ('conversions','profiles','credits','usage_log');` → all `true`.

## Success Metrics
- 0 public tables without RLS; 0 cross-user reads possible.
- Free quota == successful conversions/day; Pro credits never over-spent under concurrency.
- The Gherkin matrix above passes end-to-end against the deployed stack.

## Related Documents
- [api-contract.md](../development/api-contract.md) · [database.md](../development/database.md)
- [deploy-metered-convert.md](./deploy-metered-convert.md) · [ci-cd.md](./ci-cd.md)

## Open Questions
- Switch storage to private buckets + signed URLs now, or after launch? (B2)
- Capture provider token usage for COGS dashboards? (B7)
- Add an idempotency key from the client? (B6)
