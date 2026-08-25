-- SliceUI P3: sliceui-images storage bucket + RLS policies
-- Objects keyed {userId}/{timestamp}-{random}.{ext} (see storageService.ts).
-- Apply after 20260825000001_create_conversions.sql.

insert into storage.buckets (id, name, public)
values ('sliceui-images', 'sliceui-images', true)
on conflict (id) do nothing;

-- Users can upload into their own folder only
create policy "own folder upload"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'sliceui-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can read all images in the bucket (bucket is public, needed for
-- original_image_url to resolve in the Dashboard history)
create policy "public read"
  on storage.objects for select
  to authenticated, anon
  using (bucket_id = 'sliceui-images');

-- Users can update/delete only their own folder
create policy "own folder update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'sliceui-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "own folder delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'sliceui-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
