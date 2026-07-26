-- ============================================================================
-- workout_sets: ein einzelner Satz innerhalb einer Übungsausführung
-- ============================================================================

create table workout_sets (
  id                  uuid primary key default gen_random_uuid(),
  workout_exercise_id uuid not null references workout_exercises (id) on delete cascade,
  set_number          int not null,
  weight_kg           numeric(6,2),
  reps                int,
  rpe                 numeric(3,1),
  is_warmup           boolean not null default false,
  completed_at        timestamptz not null default now(),
  notes               text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  constraint workout_sets_set_number_positive check (set_number > 0),
  constraint workout_sets_weight_range check (weight_kg is null or (weight_kg >= 0 and weight_kg <= 500)),
  constraint workout_sets_reps_range check (reps is null or (reps >= 0 and reps <= 200)),
  constraint workout_sets_rpe_range check (rpe is null or (rpe >= 0 and rpe <= 10))
);

-- Kein doppelter Satz mit derselben Nummer innerhalb derselben Übung
create unique index idx_workout_sets_exercise_setnumber
  on workout_sets (workout_exercise_id, set_number);

-- Postgres indiziert FK-Spalten nicht automatisch
create index idx_workout_sets_workout_exercise_id on workout_sets (workout_exercise_id);

-- Chronologische Auswertungen (Verlauf, Personal Records)
create index idx_workout_sets_completed_at on workout_sets (completed_at desc);

create trigger trg_workout_sets_updated_at
  before update on workout_sets
  for each row execute function set_updated_at();

alter table workout_sets enable row level security;
