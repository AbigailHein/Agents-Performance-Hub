-- =========================================================
-- Agent Performance Tracker — Supabase schema
-- Run this in the Supabase SQL editor (or via `supabase db push`)
-- =========================================================

-- ---------------------------------------------------------
-- 1. PROFILES
-- One row per agent/admin, linked 1:1 to auth.users
-- ---------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  avatar_url text,
  role text not null default 'agent' check (role in ('agent', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by any authenticated user"
  on public.profiles for select
  using (auth.role() = 'authenticated');

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admins can update any profile"
  on public.profiles for update
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Auto-create a profile row whenever a new auth user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ---------------------------------------------------------
-- 2. STAT DEFINITIONS
-- This is what makes Rentals & Sales share one engine.
-- Add/edit/remove rows here (via Admin > Stats) instead of
-- touching code. "category" is 'rental' or 'sales'.
-- ---------------------------------------------------------
create table if not exists public.stat_definitions (
  key text primary key,               -- e.g. 'completed_mandates'
  category text not null check (category in ('rental', 'sales')),
  section text not null,              -- e.g. 'Mandates', 'Lead Generation'
  label text not null,                -- e.g. 'Completed Mandates'
  on_leaderboard boolean not null default true,
  points numeric not null default 1,  -- weight of this stat in leaderboard scoring
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.stat_definitions enable row level security;

create policy "Stat definitions are viewable by any authenticated user"
  on public.stat_definitions for select
  using (auth.role() = 'authenticated');

create policy "Only admins can manage stat definitions"
  on public.stat_definitions for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));


-- ---------------------------------------------------------
-- 3. STAT ENTRIES
-- One row per agent, per stat, per day. Capturing "today"
-- again just upserts the same row (see unique constraint).
-- ---------------------------------------------------------
create table if not exists public.stat_entries (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.profiles(id) on delete cascade,
  stat_key text not null references public.stat_definitions(key) on delete cascade,
  entry_date date not null default current_date,
  value numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (agent_id, stat_key, entry_date)
);

alter table public.stat_entries enable row level security;

create policy "Agents can view their own entries"
  on public.stat_entries for select
  using (auth.uid() = agent_id);

create policy "Admins can view all entries"
  on public.stat_entries for select
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "Agents can insert their own entries"
  on public.stat_entries for insert
  with check (auth.uid() = agent_id);

create policy "Agents can update their own entries"
  on public.stat_entries for update
  using (auth.uid() = agent_id);

create policy "Admins can manage all entries"
  on public.stat_entries for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- keep updated_at fresh
create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at on public.stat_entries;
create trigger set_updated_at
  before update on public.stat_entries
  for each row execute procedure public.touch_updated_at();


-- ---------------------------------------------------------
-- 4. UPSERT HELPER
-- Capture form calls this once per stat so "today" always
-- overwrites rather than duplicates.
-- ---------------------------------------------------------
create or replace function public.upsert_stat_entry(
  p_stat_key text,
  p_entry_date date,
  p_value numeric
)
returns public.stat_entries as $$
declare
  result public.stat_entries;
begin
  insert into public.stat_entries (agent_id, stat_key, entry_date, value)
  values (auth.uid(), p_stat_key, p_entry_date, p_value)
  on conflict (agent_id, stat_key, entry_date)
  do update set value = excluded.value
  returning * into result;

  return result;
end;
$$ language plpgsql security definer;


-- ---------------------------------------------------------
-- 5. LEADERBOARD FUNCTION
-- Sums value * points for leaderboard-eligible stats in a
-- category, within a date range, grouped by agent.
-- SECURITY DEFINER so agents can see aggregated totals for
-- everyone without needing SELECT on other agents' raw rows.
-- ---------------------------------------------------------
create or replace function public.get_leaderboard(
  p_category text,
  p_start_date date,
  p_end_date date
)
returns table (
  agent_id uuid,
  full_name text,
  avatar_url text,
  total_points numeric
) as $$
begin
  return query
  select
    p.id as agent_id,
    p.full_name,
    p.avatar_url,
    coalesce(sum(se.value * sd.points), 0) as total_points
  from public.profiles p
  join public.stat_entries se on se.agent_id = p.id
  join public.stat_definitions sd on sd.key = se.stat_key
  where sd.category = p_category
    and sd.on_leaderboard = true
    and se.entry_date between p_start_date and p_end_date
  group by p.id, p.full_name, p.avatar_url
  order by total_points desc;
end;
$$ language plpgsql security definer;


-- ---------------------------------------------------------
-- 6. STAT TOTALS FUNCTION
-- Returns totals per stat_key for one agent within a date
-- range — used by the "Stats Showcase" tables.
-- ---------------------------------------------------------
create or replace function public.get_stat_totals(
  p_agent_id uuid,
  p_category text,
  p_start_date date,
  p_end_date date
)
returns table (
  stat_key text,
  total numeric
) as $$
begin
  return query
  select se.stat_key, coalesce(sum(se.value), 0) as total
  from public.stat_entries se
  join public.stat_definitions sd on sd.key = se.stat_key
  where se.agent_id = p_agent_id
    and sd.category = p_category
    and se.entry_date between p_start_date and p_end_date
  group by se.stat_key;
end;
$$ language plpgsql security definer;


-- ---------------------------------------------------------
-- 7. SEED DATA — Rentals (exactly as specced)
-- ---------------------------------------------------------
insert into public.stat_definitions (key, category, section, label, on_leaderboard, points, sort_order) values
  ('completed_mandates',      'rental', 'Mandates',        'Completed Mandates',       true,  1, 10),
  ('pending_mandates',        'rental', 'Mandates',        'Pending Mandates',         false, 0, 11),
  ('successful_applications', 'rental', 'Applications',    'Successful Applications',  true,  1, 20),
  ('pending_applications',    'rental', 'Applications',    'Pending Applications',     false, 0, 21),
  ('leases_concluded',        'rental', 'Leases',          'Leases Concluded',         true,  1, 30),
  ('total_leads',             'rental', 'Lead Generation', 'Total Leads',              true,  1, 40),
  ('listings_uploaded',       'rental', 'Lead Generation', 'Listings Uploaded',        true,  1, 41),
  ('listings_in_progress',    'rental', 'Lead Generation', 'Listings In Progress',     false, 0, 42),
  ('roadshows_popups',        'rental', 'Lead Generation', 'Roadshows / Pop-ups',      true,  1, 43),
  ('pamphlet_drops',          'rental', 'Lead Generation', 'Pamphlet Drops',           true,  1, 44),
  ('canvassing_calls',        'rental', 'Lead Generation', 'Canvassing Calls Made',    true,  1, 45),
  ('viewings',                'rental', 'Client Activity', 'Viewings',                 true,  1, 50),
  ('entry_inspections',       'rental', 'Client Activity', 'Entry Inspections',        true,  1, 51),
  ('mid_term_inspections',    'rental', 'Client Activity', 'Mid-Term Inspections',     true,  1, 52),
  ('outgoing_inspections',    'rental', 'Client Activity', 'Outgoing Inspections',     true,  1, 53)
on conflict (key) do nothing;

-- ---------------------------------------------------------
-- 8. SEED DATA — Sales (PLACEHOLDER, mirrors Rentals)
-- Replace/edit these once real Sales stats are confirmed —
-- either edit these rows directly, or manage them from
-- Admin > Stats in the app. No code changes needed.
-- ---------------------------------------------------------
insert into public.stat_definitions (key, category, section, label, on_leaderboard, points, sort_order) values
  ('sales_completed_mandates', 'sales', 'Mandates',        'Completed Mandates',   true,  1, 10),
  ('sales_pending_mandates',   'sales', 'Mandates',        'Pending Mandates',     false, 0, 11),
  ('successful_offers',        'sales', 'Offers',          'Successful Offers',    true,  1, 20),
  ('pending_offers',           'sales', 'Offers',          'Pending Offers',       false, 0, 21),
  ('sales_concluded',          'sales', 'Sales',           'Sales Concluded',      true,  1, 30),
  ('sales_total_leads',        'sales', 'Lead Generation', 'Total Leads',          true,  1, 40),
  ('sales_listings_uploaded',  'sales', 'Lead Generation', 'Listings Uploaded',    true,  1, 41),
  ('sales_listings_in_progress','sales','Lead Generation', 'Listings In Progress', false, 0, 42),
  ('show_days',                'sales', 'Lead Generation', 'Show Days Hosted',     true,  1, 43),
  ('sales_pamphlet_drops',     'sales', 'Lead Generation', 'Pamphlet Drops',       true,  1, 44),
  ('sales_canvassing_calls',   'sales', 'Lead Generation', 'Canvassing Calls Made',true,  1, 45),
  ('sales_viewings',           'sales', 'Client Activity', 'Viewings',             true,  1, 50)
on conflict (key) do nothing;
