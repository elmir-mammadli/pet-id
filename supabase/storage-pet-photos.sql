-- Bucket for pet photos. Run this in Supabase SQL Editor (Storage must be enabled).
-- Path structure: {owner_id}/{pet_id}/{timestamp}.{ext}
-- Public read so the public pet page can show photos.

-- 1) Create or update bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'pet-photos',
  'pet-photos',
  true,
  3145728,  -- 3 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- 2) Drop existing policies if re-running this script
drop policy if exists "Public read pet photos" on storage.objects;
drop policy if exists "Owners can upload pet photos" on storage.objects;
drop policy if exists "Owners can update pet photos" on storage.objects;
drop policy if exists "Owners can delete pet photos" on storage.objects;

-- 3) RLS: allow public read (SELECT) for all objects in bucket
create policy "Public read pet photos"
on storage.objects for select
to public
using (bucket_id = 'pet-photos');

-- 4) RLS: authenticated users can upload only to their own folder (first path segment = auth.uid())
create policy "Owners can upload pet photos"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'pet-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- 5) RLS: owners can update/delete only their own files
create policy "Owners can update pet photos"
on storage.objects for update
to authenticated
using (
  bucket_id = 'pet-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Owners can delete pet photos"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'pet-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);
