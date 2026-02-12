-- Tags table: one physical NFC tag = one row.
-- Pre-programmed URL: https://yourapp.com/activate/{activation_token}
-- After owner claims: tag links to pet and redirects to /p/{pet.public_id}

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  activation_token text not null unique,
  pet_id uuid references public.pets(id) on delete set null,
  owner_id uuid references auth.users(id) on delete set null,
  status text not null default 'unclaimed' check (status in ('unclaimed', 'active')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_tags_activation_token on public.tags (activation_token);
create index if not exists idx_tags_owner_id on public.tags (owner_id);
create index if not exists idx_tags_pet_id on public.tags (pet_id);

alter table public.tags
  enable row level security,
  force row level security;

-- Anyone can read a tag by activation_token (needed for /activate/[token] redirect logic)
create policy "Public read tags by token"
on public.tags for select
to public
using (true);

-- Only unclaimed tags can be updated by authenticated users (claim flow sets owner_id, pet_id, status)
-- Claimed tags: only owner can update (e.g. deactivate, reassign)
create policy "Claim or update own tag"
on public.tags for update
to authenticated
using (
  status = 'unclaimed'
  or owner_id = auth.uid()
);

-- Insert: no RLS policy for anon/authenticated; manufacturing uses service role or run SQL manually

revoke all on table public.tags from public, anon, authenticated;
grant select on table public.tags to anon, authenticated;
grant update on table public.tags to authenticated;

comment on table public.tags is 'NFC tags: activation_token is in the tag URL. After claim, pet_id and owner_id are set.';

-- View for redirect: anon can resolve activation_token → public_id when tag is active
create or replace view public.tag_redirects as
select t.activation_token, p.public_id
from public.tags t
join public.pets p on p.id = t.pet_id
where t.status = 'active';

revoke all on table public.tag_redirects from public, anon, authenticated;
grant select on table public.tag_redirects to anon, authenticated;
