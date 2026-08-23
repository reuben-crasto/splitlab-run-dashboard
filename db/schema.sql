-- Supabase schema for the running dashboard.
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query).

-- Perceived-effort / notes logged per Strava activity.
-- Written by api/run-logs.js via upsert on activity_id.
create table if not exists public.run_logs (
  activity_id text primary key,
  km1_rpe     smallint,   -- how km 1 felt, 1 (easy) – 10 (all-out)
  soreness    smallint,   -- leg soreness before the run, 1 (fresh) – 5 (very sore)
  overall     smallint,   -- overall feel, 1 (rough) – 4 (great)
  notes       text,
  logged_at   timestamptz not null default now()
);

-- The app connects with the Supabase anon key, so grant it access to this table.
alter table public.run_logs enable row level security;

create policy "anon can read run_logs"   on public.run_logs for select to anon using (true);
create policy "anon can insert run_logs" on public.run_logs for insert to anon with check (true);
create policy "anon can update run_logs" on public.run_logs for update to anon using (true) with check (true);
