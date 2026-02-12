-- Bucket for pet documents (vet, vaccine, insurance, etc.). Private — only owner can read.
-- Path structure: {owner_id}/{pet_id}/{doc_id}.{ext}
-- Run in Supabase SQL Editor.

-- 1) Create bucket (private)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'pet-documents',
  'pet-documents',
  false,
  5242880,  -- 5 MB
  array['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Owners can read pet documents" on storage.objects;
drop policy if exists "Owners can upload pet documents" on storage.objects;
drop policy if exists "Owners can delete pet documents" on storage.objects;

-- 3) RLS: only owner (storage.objects.owner_id = auth.uid()) can read
create policy "Owners can read pet documents"
on storage.objects for select
to authenticated
using (
  bucket_id = 'pet-documents'
  and owner_id = auth.uid()
);

-- 4) RLS: only owner can upload (owner_id автоматически = auth.uid())
create policy "Owners can upload pet documents"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'pet-documents'
);

-- 5) RLS: only owner can delete their files
create policy "Owners can delete pet documents"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'pet-documents'
  and owner_id = auth.uid()
);
