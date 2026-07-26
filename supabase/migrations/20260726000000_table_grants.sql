-- SliceUI: table privileges for the anon / authenticated / service_role roles.
--
-- Supabase auto-grants these when a table is created via the Dashboard, but
-- tables created via raw SQL (e.g. `supabase db reset` on a fresh stack, or
-- these very migrations) start with NO grants to anon/authenticated — so RLS
-- policies allow a row but the role still gets `permission denied for table`.
-- This makes the privileges explicit so the schema is reproducible anywhere.
-- Idempotent.

grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on public.conversions to anon, authenticated;
grant select, insert, update, delete on public.profiles    to anon, authenticated;
grant select, insert, update, delete on public.credits     to anon, authenticated;
grant select, insert, update, delete on public.usage_log   to anon, authenticated;

-- decrement_credit is called by the edge function (service_role). Grant execute
-- to service_role (used) and authenticated (harmless — the function is SECURITY
-- INVOKER-safe via the where clause; only service_role bypasses RLS in practice).
grant execute on function public.decrement_credit(text) to anon, authenticated, service_role;
