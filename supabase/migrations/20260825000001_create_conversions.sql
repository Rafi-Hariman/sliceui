-- SliceUI P3: conversions table + RLS
-- Schema per docs/project-docs/development/database.md §8.2
-- Apply via Supabase MCP (apply_migration) or dashboard SQL editor.

create table public.conversions (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id),
  original_image_url  text not null,
  original_image_name text not null,
  framework           text not null,
  options             jsonb not null,
  generated_code      text not null,
  status              text not null default 'pending',
  error_message       text,
  created_at          timestamptz not null default now()
);

alter table public.conversions enable row level security;

create policy "own conversions"
  on public.conversions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index conversions_user_id_created_idx
  on public.conversions (user_id, created_at desc);
