-- Schéma V1 (docs/ARCHITECTURE.md §4 ; D11, D14, D19 à D21).
-- Règles : user_id + RLS « propriétaire uniquement » sur chaque table ; mesures brutes uniquement
-- (m, s, m/s, bpm), rien de dérivé ; text + CHECK plutôt que des enums ; séries temporelles en tableaux.

-- ── Utilitaire : updated_at tenu à jour ─────────────────────────────────────
create function public.set_updated_at() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── Référence ──────────────────────────────────────────────────────────────
create table public.event (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  date date not null,
  distance_m double precision not null check (distance_m > 0),
  target_time_s integer check (target_time_s > 0),
  priority text not null default 'A' check (priority in ('A', 'B', 'C'))
);

create table public.athlete_profile (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  hr_max integer not null check (hr_max between 100 and 250),
  hr_rest integer check (hr_rest between 25 and 120),
  zones jsonb not null,
  goal_event_id uuid references public.event (id) on delete set null
);

-- ── Prévu (D11 : généré par buildPlan, puis la base fait foi) ────────────────
create table public.plan (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  start_date date not null,
  is_active boolean not null default true,
  generator_version text,
  created_at timestamptz not null default now()
);
-- Un seul plan actif par utilisateur.
create unique index plan_one_active_per_user on public.plan (user_id) where is_active;

create table public.plan_phase (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  plan_id uuid not null references public.plan (id) on delete cascade,
  code text not null check (code in ('base', 'construction', 'specifique', 'affutage')),
  name text not null,
  goal text not null,
  week_from integer not null check (week_from >= 1),
  week_to integer not null,
  unique (plan_id, code),
  check (week_from <= week_to)
);

create table public.planned_session (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  plan_id uuid not null references public.plan (id) on delete cascade,
  phase_id uuid not null references public.plan_phase (id) on delete restrict,
  date date not null,
  week integer not null check (week >= 1),
  type text not null check (type in ('ef', 'recup', 'fractionne', 'seuil', 'allure', 'sortie-longue', 'course')),
  title text not null,
  details text not null default '',
  distance_m double precision not null check (distance_m >= 0),
  pace_min_s_km integer check (pace_min_s_km > 0),
  pace_max_s_km integer check (pace_max_s_km > 0),
  hr_min integer check (hr_min > 0),
  hr_max integer check (hr_max > 0),
  origin text not null default 'generator' check (origin in ('generator', 'manual', 'coach')),
  updated_at timestamptz not null default now(),
  check (pace_min_s_km is null or pace_max_s_km is null or pace_min_s_km <= pace_max_s_km),
  check (hr_min is null or hr_max is null or hr_min <= hr_max)
);
create index planned_session_plan_date on public.planned_session (plan_id, date);
create trigger planned_session_updated_at before update on public.planned_session
  for each row execute function public.set_updated_at();

-- ── Réalisé (source : Garmin, D13) ───────────────────────────────────────────
create table public.activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  source text not null check (source in ('garmin', 'fit_file', 'manual', 'mock')),
  source_id text not null,
  start_time timestamptz not null,
  local_date date not null,
  sport text not null,
  distance_m double precision check (distance_m >= 0),
  moving_time_s double precision check (moving_time_s >= 0),
  elapsed_time_s double precision check (elapsed_time_s >= 0),
  avg_hr integer check (avg_hr > 0),
  max_hr integer check (max_hr > 0),
  avg_speed_mps double precision check (avg_speed_mps >= 0),
  elevation_gain_m double precision,
  -- Ressenti saisi sur la montre (D20), valeurs brutes de Garmin (échelle propre à Garmin).
  device_rpe integer,
  device_feel integer,
  -- Réponse brute de la source, GPS compris (D19).
  raw jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source, source_id)
);
create index activity_user_date on public.activity (user_id, local_date);
create trigger activity_updated_at before update on public.activity
  for each row execute function public.set_updated_at();

-- Séries temporelles : une ligne par activité, une colonne par mesure (tableaux alignés sur time_s).
create table public.activity_stream (
  activity_id uuid primary key references public.activity (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  time_s double precision[] not null,
  distance_m double precision[],
  hr integer[],
  speed_mps double precision[],
  altitude_m double precision[],
  cadence integer[],
  lat double precision[],
  lng double precision[]
);

create table public.wellness (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  date date not null,
  resting_hr integer check (resting_hr > 0),
  hrv_ms double precision check (hrv_ms > 0),
  sleep_s integer check (sleep_s >= 0),
  sleep_score integer check (sleep_score between 0 and 100),
  raw jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, date)
);
create trigger wellness_updated_at before update on public.wellness
  for each row execute function public.set_updated_at();

create table public.sync_run (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  source text not null check (source in ('garmin', 'fit_file', 'manual', 'mock')),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null default 'running' check (status in ('running', 'success', 'error')),
  range_from date,
  range_to date,
  upserted integer not null default 0 check (upserted >= 0),
  error text
);

-- ── Liaison & ressenti ──────────────────────────────────────────────────────
create table public.session_link (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  planned_session_id uuid not null references public.planned_session (id) on delete cascade,
  activity_id uuid not null unique references public.activity (id) on delete cascade,
  method text not null check (method in ('auto', 'manual')),
  created_at timestamptz not null default now()
);
create index session_link_planned on public.session_link (planned_session_id);

-- Journal (D20) : après une activité, ou pour une séance prévue non faite.
create table public.journal_entry (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  activity_id uuid unique references public.activity (id) on delete cascade,
  planned_session_id uuid unique references public.planned_session (id) on delete cascade,
  feeling smallint check (feeling between 1 and 5),
  rpe smallint check (rpe between 1 and 10),
  comment text,
  pain_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (activity_id is not null or planned_session_id is not null)
);
create trigger journal_entry_updated_at before update on public.journal_entry
  for each row execute function public.set_updated_at();

create table public.daily_checkin (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  date date not null,
  fatigue smallint check (fatigue between 1 and 5),
  sleep_quality smallint check (sleep_quality between 1 and 5),
  soreness smallint check (soreness between 1 and 5),
  motivation smallint check (motivation between 1 and 5),
  pain_note text,
  created_at timestamptz not null default now(),
  primary key (user_id, date)
);

-- ── RLS : « propriétaire uniquement » sur chaque table ───────────────────────
do $$
declare
  t text;
begin
  foreach t in array array[
    'event', 'athlete_profile', 'plan', 'plan_phase', 'planned_session', 'activity', 'activity_stream',
    'wellness', 'sync_run', 'session_link', 'journal_entry', 'daily_checkin'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy owner_only on public.%I for all to authenticated
         using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))',
      t
    );
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('grant all on public.%I to service_role', t);
    execute format('revoke all on public.%I from anon', t);
  end loop;
end;
$$;
