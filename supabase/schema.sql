-- TwoFold cloud schema.
-- Run once in a NEW Supabase project (SQL Editor > New query > Run).
-- Also enable: Authentication > Sign In / Providers > "Allow anonymous sign-ins".
--
-- Model: every device signs in anonymously and gets a profile with a name.
-- A trip is visible only to its members; people join with the trip's
-- invite code. Each member writes only their own side of a moment.

-- === Tables ===

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 40),
  created_at timestamptz not null default now()
);

create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 60),
  emoji text not null default '✈️',
  start_date date not null,
  day_count int not null check (day_count between 1 and 14),
  join_code text not null unique
    default upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  created_by uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.trip_members (
  trip_id uuid not null references public.trips (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (trip_id, user_id)
);

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  day_index int not null check (day_index >= 0 and day_index < 14),
  title text not null check (char_length(trim(title)) between 1 and 80),
  planned_time text check (planned_time ~ '^\d{2}:\d{2}$'),
  planned_cost numeric(10, 2) check (planned_cost >= 0),
  planned_note text check (char_length(planned_note) <= 200),
  unplanned boolean not null default false,
  created_by uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists activities_trip_idx on public.activities (trip_id);

create table if not exists public.experiences (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities (id) on delete cascade,
  note text not null check (char_length(trim(note)) between 1 and 240),
  actual_cost numeric(10, 2) check (actual_cost >= 0),
  verdict text check (verdict in ('less', 'same', 'more')),
  logged_by uuid not null references public.profiles (id) on delete cascade,
  logged_at timestamptz not null default now(),
  unique (activity_id, logged_by)
);
create index if not exists experiences_activity_idx on public.experiences (activity_id);

-- === Helpers (security definer so policies don't recurse) ===

create or replace function public.is_trip_member(t uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from trip_members where trip_id = t and user_id = auth.uid()
  )
$$;

create or replace function public.activity_trip(a uuid)
returns uuid
language sql stable security definer set search_path = public
as $$
  select trip_id from activities where id = a
$$;

create or replace function public.shares_trip_with(other uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1
    from trip_members mine
    join trip_members theirs on theirs.trip_id = mine.trip_id
    where mine.user_id = auth.uid() and theirs.user_id = other
  )
$$;

-- Create a trip and become its first member in one step.
create or replace function public.create_trip(
  p_name text, p_emoji text, p_start_date date, p_day_count int
)
returns uuid
language plpgsql security definer set search_path = public
as $$
declare
  new_id uuid;
begin
  if auth.uid() is null then
    raise exception 'not signed in';
  end if;
  insert into trips (name, emoji, start_date, day_count, created_by)
  values (trim(p_name), p_emoji, p_start_date, p_day_count, auth.uid())
  returning id into new_id;
  insert into trip_members (trip_id, user_id) values (new_id, auth.uid());
  return new_id;
end;
$$;

-- Join with an invite code. Returns the trip id (null if the code is wrong).
create or replace function public.join_trip(p_code text)
returns uuid
language plpgsql security definer set search_path = public
as $$
declare
  t uuid;
begin
  if auth.uid() is null then
    raise exception 'not signed in';
  end if;
  select id into t from trips where join_code = upper(trim(p_code));
  if t is null then
    return null;
  end if;
  insert into trip_members (trip_id, user_id) values (t, auth.uid())
  on conflict do nothing;
  return t;
end;
$$;

revoke all on function public.create_trip(text, text, date, int) from public, anon;
revoke all on function public.join_trip(text) from public, anon;
grant execute on function public.create_trip(text, text, date, int) to authenticated;
grant execute on function public.join_trip(text) to authenticated;

-- === Row level security ===

alter table public.profiles enable row level security;
alter table public.trips enable row level security;
alter table public.trip_members enable row level security;
alter table public.activities enable row level security;
alter table public.experiences enable row level security;

drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles for select to authenticated
  using (id = auth.uid() or public.shares_trip_with(id));
drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles for insert to authenticated
  with check (id = auth.uid());
drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- trips: insert only through create_trip()
drop policy if exists trips_read on public.trips;
create policy trips_read on public.trips for select to authenticated
  using (public.is_trip_member(id));
drop policy if exists trips_update on public.trips;
create policy trips_update on public.trips for update to authenticated
  using (created_by = auth.uid()) with check (created_by = auth.uid());
drop policy if exists trips_delete on public.trips;
create policy trips_delete on public.trips for delete to authenticated
  using (created_by = auth.uid());

-- members: insert only through create_trip() / join_trip(); anyone may leave
drop policy if exists members_read on public.trip_members;
create policy members_read on public.trip_members for select to authenticated
  using (public.is_trip_member(trip_id));
drop policy if exists members_leave on public.trip_members;
create policy members_leave on public.trip_members for delete to authenticated
  using (user_id = auth.uid());

drop policy if exists activities_read on public.activities;
create policy activities_read on public.activities for select to authenticated
  using (public.is_trip_member(trip_id));
drop policy if exists activities_insert on public.activities;
create policy activities_insert on public.activities for insert to authenticated
  with check (created_by = auth.uid() and public.is_trip_member(trip_id));
drop policy if exists activities_update on public.activities;
create policy activities_update on public.activities for update to authenticated
  using (created_by = auth.uid()) with check (created_by = auth.uid() and public.is_trip_member(trip_id));
drop policy if exists activities_delete on public.activities;
create policy activities_delete on public.activities for delete to authenticated
  using (created_by = auth.uid());

drop policy if exists experiences_read on public.experiences;
create policy experiences_read on public.experiences for select to authenticated
  using (public.is_trip_member(public.activity_trip(activity_id)));
drop policy if exists experiences_insert on public.experiences;
create policy experiences_insert on public.experiences for insert to authenticated
  with check (logged_by = auth.uid() and public.is_trip_member(public.activity_trip(activity_id)));
drop policy if exists experiences_update on public.experiences;
create policy experiences_update on public.experiences for update to authenticated
  using (logged_by = auth.uid())
  with check (logged_by = auth.uid() and public.is_trip_member(public.activity_trip(activity_id)));
drop policy if exists experiences_delete on public.experiences;
create policy experiences_delete on public.experiences for delete to authenticated
  using (logged_by = auth.uid());

grant select, insert, update on public.profiles to authenticated;
grant select, update, delete on public.trips to authenticated;
grant select, delete on public.trip_members to authenticated;
grant select, insert, update, delete on public.activities to authenticated;
grant select, insert, update, delete on public.experiences to authenticated;

-- === Realtime ===
-- (Supabase only; skipped silently elsewhere)
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin
      alter publication supabase_realtime add table
        public.trips, public.trip_members, public.activities, public.experiences, public.profiles;
    exception when duplicate_object then null;
    end;
  end if;
end $$;
