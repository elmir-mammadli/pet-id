-- Owner profile: display name and phone for SMS link when someone finds the pet.
-- One row per user (user_id = auth.uid()).

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id)
);

create index if not exists idx_profiles_user_id on public.profiles (user_id);

alter table public.profiles
  enable row level security,
  force row level security;

revoke all on table public.profiles from public, anon, authenticated;
grant select, insert, update on table public.profiles to authenticated;

create policy "Users manage own profile"
on public.profiles
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

comment on table public.profiles is 'Owner display name and phone; used for SMS link when finder reports pet.';
