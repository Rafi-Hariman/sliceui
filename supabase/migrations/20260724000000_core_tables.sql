-- SliceUI: core tables (profiles + conversions).
--
-- On the original remote project these were created via the Supabase Dashboard,
-- so their DDL was never tracked in-repo — which meant `supabase db reset` on a
-- fresh local stack left them missing, and the later migrations (which ASSUME
-- they exist) failed or had nothing to attach RLS to. This file makes the
-- schema fully reproducible from migrations alone.
--
-- Idempotent (`if not exists`) so it is a no-op on the remote project where the
-- tables already exist. Safe to `db push` against any environment.

-- ── profiles: one row per auth user (created by the signup trigger) ────────────
create table if not exists public.profiles (
  id          uuid primary key default gen_random_uuid(),
  user_id     text unique not null,
  full_name   text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── conversions: one row per slice (the history / regenerate source) ──────────
create table if not exists public.conversions (
  id                   uuid primary key default gen_random_uuid(),
  user_id              text not null,
  original_image_url   text not null,
  original_image_name  text not null,
  framework            text not null,
  options              jsonb,
  generated_code       text not null,
  status               text not null default 'completed',
  error_message        text,
  created_at           timestamptz not null default now()
);

create index if not exists conversions_user_created_idx
  on public.conversions (user_id, created_at desc);
