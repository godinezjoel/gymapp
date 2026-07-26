-- ============================================================================
-- workout_exercises: eine ausgeführte Übung innerhalb eines Workouts
-- ============================================================================

create table workout_exercises (
  id            uuid primary key default gen_random_uuid(),
  workout_id    uuid not null references workouts (id) on delete cascade,
  exercise_name text not null,
  category      exercise_category,
  order_index   int not null default 0,
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint workout_exercises_order_index_non_negative check (order_index >= 0),
  constraint workout_exercises_name_not_blank check (btrim(exercise_name) <> '')
);

-- Reihenfolge der Übungen innerhalb eines Workouts ist eindeutig
create unique index idx_workout_exercises_workout_order
  on workout_exercises (workout_id, order_index);

-- Postgres indiziert FK-Spalten nicht automatisch
create index idx_workout_exercises_workout_id on workout_exercises (workout_id);

-- Verlauf/PRs pro Übung (Progress-Seite): "alle Sätze von Bankdrücken über die Zeit"
create index idx_workout_exercises_exercise_name on workout_exercises (exercise_name);

create trigger trg_workout_exercises_updated_at
  before update on workout_exercises
  for each row execute function set_updated_at();

alter table workout_exercises enable row level security;
