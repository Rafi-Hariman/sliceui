-- SliceUI: entitlement + metering tables (Phase 0).
-- Run with: supabase db push   (or paste into the SQL editor).
-- The edge function (supabase/functions/convert) uses the service_role key,
-- so it bypasses RLS to read/decrement credits and write usage_log.
-- RLS below only governs what the browser client may read.

-- ── credits: one row per user, holds balance + plan ───────────────────────────
create table if not exists public.credits (
  id              uuid primary key default gen_random_uuid(),
  user_id         text not null unique,
  balance         integer not null default 0,
  plan            text not null default 'free' check (plan in ('free','pro')),
  period_reset_at timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ── usage_log: one row per conversion (metering + COGS tracking) ──────────────
create table if not exists public.usage_log (
  id          uuid primary key default gen_random_uuid(),
  user_id     text not null,
  framework   text,
  model       text check (model in ('gemini','claude','groq')),
  status      text not null default 'success' check (status in ('success','failed')),
  tokens      integer,
  created_at  timestamptz not null default now()
);
create index if not exists usage_log_user_created_idx
  on public.usage_log (user_id, created_at desc);

-- ── Row Level Security ────────────────────────────────────────────────────────
alter table public.credits   enable row level security;
alter table public.usage_log enable row level security;

-- Clients can read/update only their own credits row.
drop policy if exists "credits select own" on public.credits;
create policy "credits select own" on public.credits
  for select using (auth.uid()::text = user_id);

drop policy if exists "credits update own" on public.credits;
create policy "credits update own" on public.credits
  for update using (auth.uid()::text = user_id);

-- Clients can read only their own usage history.
drop policy if exists "usage_log select own" on public.usage_log;
create policy "usage_log select own" on public.usage_log
  for select using (auth.uid()::text = user_id);

-- ── Auto-create a credits row on signup (free tier, 0 balance) ────────────────
-- Free daily quota is enforced in the edge function; balance tops up via Stripe.
create or replace function public.handle_new_user_credits()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.credits (user_id, balance, plan)
  values (new.id::text, 0, 'free')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_credits on auth.users;
create trigger on_auth_user_created_credits
  after insert on auth.users
  for each row execute function public.handle_new_user_credits();
