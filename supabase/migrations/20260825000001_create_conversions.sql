-- SliceUI P3: conversions table + RLS
-- Schema per docs/project-docs/development/database.md §8.2
-- NOTE (2026-08-25): the live project already had this table (created outside
-- this repo). This migration documents the canonical schema + RLS for future
-- fresh-project setup. Applied on live: table exists, RLS policies verified.

create table public.conversions (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id),
  original_image_url  text not null,
  original_image_name text not null,
  framework           text not null,
  options             jsonb not null default '{"a11y":false,"darkMode":false,"responsive":true,"semanticHtml":true}'::jsonb,
  generated_code      text not null,
  status              text not null default 'completed',
  error_message       text,
  created_at          timestamptz not null default now()
);

alter table public.conversions enable row level security;

create policy "conversions_select_own" on public.conversions
  for select to authenticated
  using (auth.uid() = user_id);

create policy "conversions_insert_own" on public.conversions
  for insert to authenticated
  with check (auth.uid() = user_id);

create policy "conversions_update_own" on public.conversions
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "conversions_delete_own" on public.conversions
  for delete to authenticated
  using (auth.uid() = user_id);

create index conversions_user_id_created_idx
  on public.conversions (user_id, created_at desc);
