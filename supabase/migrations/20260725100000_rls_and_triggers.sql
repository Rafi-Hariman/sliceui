-- SliceUI: backend hardening — RLS, storage policies, atomic decrement, signup trigger.
-- Assumes public.conversions and public.profiles already exist (created via dashboard).
-- Run with: supabase db push  (or paste into the SQL editor).

-- ── 1. RLS on conversions (owner-scoped CRUD) ────────────────────────────────
alter table public.conversions enable row level security;

drop policy if exists "conversions select own" on public.conversions;
create policy "conversions select own" on public.conversions
  for select using (auth.uid()::text = user_id);

drop policy if exists "conversions insert own" on public.conversions;
create policy "conversions insert own" on public.conversions
  for insert with check (auth.uid()::text = user_id);

drop policy if exists "conversions update own" on public.conversions;
create policy "conversions update own" on public.conversions
  for update using (auth.uid()::text = user_id);

drop policy if exists "conversions delete own" on public.conversions;
create policy "conversions delete own" on public.conversions
  for delete using (auth.uid()::text = user_id);

-- ── 2. RLS on profiles (owner read/update; insert via trigger) ────────────────
alter table public.profiles enable row level security;

drop policy if exists "profiles select own" on public.profiles;
create policy "profiles select own" on public.profiles
  for select using (auth.uid()::text = user_id);

drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own" on public.profiles
  for update using (auth.uid()::text = user_id);

-- ── 3. Storage RLS (owner-scoped writes; reads follow bucket visibility) ──────
-- Object names are "{user_id}/{file}" within a bucket, so the first folder
-- segment is the owner. Public buckets still allow anonymous reads (RLS SELECT
-- is bypassed for anon there); writes are gated to the owner regardless. When a
-- bucket is later made private (B2 — signed URLs), the SELECT policy here makes
-- owner-only reads work via an authenticated fetch.
drop policy if exists "owner scoped all" on storage.objects;
create policy "owner scoped all" on storage.objects
  for all to authenticated
  using (
    bucket_id in ('sliceui-images', 'avatars')
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id in ('sliceui-images', 'avatars')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ── 4. Atomic credit decrement (B5) ───────────────────────────────────────────
-- Returns the new balance, or NULL when there is no row / balance is 0 (so the
-- caller can detect a lost race or out-of-credits). Called by the edge function
-- with the service_role key, so it bypasses RLS.
create or replace function public.decrement_credit(p_user_id text)
returns integer language sql as $$
  update public.credits
    set balance = balance - 1, updated_at = now()
    where user_id = p_user_id and balance > 0
    returning balance;
$$;

-- ── 5. Auto-create a profiles row on signup (B8) ──────────────────────────────
-- Uses `where not exists` so it doesn't depend on a unique constraint on
-- profiles.user_id (which may not be present on the dashboard-created table).
create or replace function public.handle_new_user_profile()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (user_id, full_name)
  select new.id::text, new.raw_user_meta_data->>'full_name'
  where not exists (select 1 from public.profiles where user_id = new.id::text);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute function public.handle_new_user_profile();
