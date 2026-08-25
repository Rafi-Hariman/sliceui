-- SliceUI P3: sliceui-images storage bucket + RLS policies
-- Objects keyed {userId}/{timestamp}-{random}.{ext} (see storageService.ts).
-- APPLIED on live (2026-08-25): bucket created (public=true) + policies below.

insert into storage.buckets (id, name, public)
values ('sliceui-images', 'sliceui-images', true)
on conflict (id) do nothing;

-- Users upload into their own folder only
create policy "own folder upload" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'sliceui-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Bucket is public → original_image_url resolves for the Dashboard history
create policy "public read sliceui" on storage.objects
  for select to authenticated, anon
  using (bucket_id = 'sliceui-images');

create policy "own folder update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'sliceui-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "own folder delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'sliceui-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
