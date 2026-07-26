-- SliceUI: table privileges for the anon / authenticated / service_role roles.
--
-- Supabase auto-grants these when a table is created via the Dashboard, but
-- tables created via raw SQL (e.g. `supabase db reset` on a fresh stack, or
-- these very migrations) start with NO grants to anon/authenticated — so RLS
-- policies allow a row but the role still gets `permission denied for table`.
-- This makes the privileges explicit so the schema is reproducible anywhere.
-- Idempotent.

grant usage on schema public to anon, authenticated, service_role;

-- anon/authenticated: row access is gated by RLS policies.
-- service_role: bypasses RLS — needed because the /convert edge function writes
-- usage_log and decrements credits as service_role. Without this, metering
-- silently 403s (every conversion logged as failed, credits never decrement).
grant select, insert, update, delete on public.conversions to anon, authenticated, service_role;
grant select, insert, update, delete on public.profiles    to anon, authenticated, service_role;
grant select, insert, update, delete on public.credits     to anon, authenticated, service_role;
grant select, insert, update, delete on public.usage_log   to anon, authenticated, service_role;

-- decrement_credit is called by the edge function (service_role).
grant execute on function public.decrement_credit(text) to anon, authenticated, service_role;
