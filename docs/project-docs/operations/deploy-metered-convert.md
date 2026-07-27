# Deploying the metered `/convert` edge function (Phase 0)

Prerequisite to billing: moves AI keys server-side, meters usage, and tiers
quality (free=Gemini, Pro=Claude). This is a runbook, not code.

## Prerequisites
- Supabase CLI installed and logged in.
- Project linked: `supabase link --project-ref <your-project-ref>`.

## Steps

1. **Apply the schema** (creates `credits` + `usage_log`, then RLS + atomic decrement +
   signup trigger):
   ```sh
   supabase db push
   # applies: 20260725000000_credits_usage.sql + 20260725100000_rls_and_triggers.sql
   ```
2. **Deploy the function**:
   ```sh
   supabase functions deploy convert
   ```
3. **Set server-side secrets** (these are NOT shipped to the browser):
   ```sh
   supabase secrets set ANTHROPIC_API_KEY=sk-ant-... GEMINI_API_KEY=AIza...
   # optional overrides (defaults shown):
   supabase secrets set CLAUDE_MODEL=claude-sonnet-4-6 GEMINI_MODEL=gemini-2.0-flash FREE_DAILY_LIMIT=5
   # CORS allowlist (comma list; unset → "*" for dev) + image size cap (bytes):
   supabase secrets set ALLOWED_ORIGINS=https://your-app.com MAX_IMAGE_BYTES=10485760
   ```
4. **Point the client at the proxy** - in `.env.local`:
   ```env
   VITE_CONVERT_PROXY_URL=https://<project-ref>.functions.supabase.co/convert
   ```
5. **Smoke test**: sign in → upload → generate. Confirm a `usage_log` row
   appears, free users route to Gemini, and (once a `credits.plan='pro'` row
   exists) Pro users route to Claude.

## Behavior
- Without `VITE_CONVERT_PROXY_URL`, the app falls back to client-side
  Gemini/Groq (local dev) - keys still browser-exposed, so only use behind the
  proxy in production.
- Model defaults: Pro → `claude-sonnet-4-6` (~$0.03/conv, ~55% margin at $19);
  set `CLAUDE_MODEL=claude-opus-4-8` for a future premium tier.
- Free tier: 5 conversions/day (server-enforced). Pro: credit balance, decremented per success.

## Phase 1 (next) - billing
Stripe Checkout: Pro subscription ($19/mo, 300 credits/mo) + credit packs
($5 / 50 credits). Webhook sets `credits.plan='pro'` and tops up `balance`.

## ⚠️ Before going live
Rotate the previously-leaked Gemini/Groq/Supabase keys (they're in git history).
