-- DuoBloom / NEW ME shared cloud storage
-- Run this once in Supabase Dashboard > SQL Editor > New query.
-- This creates one private JSON state row per authenticated shared account.

create table if not exists public.newme_app_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  app_state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.newme_app_state enable row level security;

-- Remove/recreate only this table's own policies so the script is safe to rerun.
drop policy if exists "Users can read their own DuoBloom state" on public.newme_app_state;
drop policy if exists "Users can insert their own DuoBloom state" on public.newme_app_state;
drop policy if exists "Users can update their own DuoBloom state" on public.newme_app_state;

create policy "Users can read their own DuoBloom state"
  on public.newme_app_state for select to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own DuoBloom state"
  on public.newme_app_state for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own DuoBloom state"
  on public.newme_app_state for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, update on public.newme_app_state to authenticated;

-- Enable Realtime notifications for multi-device updates (safe to rerun).
do $$
begin
  alter publication supabase_realtime add table public.newme_app_state;
exception
  when duplicate_object then null;
  when others then
    if sqlstate <> '42710' then raise; end if;
end $$;
