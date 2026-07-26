-- ============================================================================
-- training_plan: Vorlagen für Trainingseinheiten (Zielwerte je Übung)
--
-- Flache Struktur: eine Zeile = ein Übungs-Slot innerhalb eines Plans,
-- gruppiert über plan_name. Bewusst eine einzelne Tabelle statt
-- plan-Kopf + plan_exercises-Detail, siehe Hinweis zu workouts.plan_name.
-- ============================================================================

create table training_plan (
  id               uuid primary key default gen_random_uuid(),
  plan_name        text not null,
  exercise_name    text not null,
  category         exercise_category,
  order_index      int not null default 0,
  target_sets      int,
  target_reps      int,
  target_weight_kg numeric(6,2),
  rest_seconds     int,
  archived         boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  constraint training_plan_order_index_non_negative check (order_index >= 0),
  constraint training_plan_target_sets_range check (target_sets is null or target_sets between 1 and 20),
  constraint training_plan_target_reps_range check (target_reps is null or target_reps between 1 and 200),
  constraint training_plan_rest_seconds_range check (rest_seconds is null or rest_seconds between 0 and 1800),
  constraint training_plan_name_not_blank check (btrim(plan_name) <> ''),
  constraint training_plan_exercise_not_blank check (btrim(exercise_name) <> '')
);

-- Reihenfolge der Übungen innerhalb eines Plans ist eindeutig
create unique index idx_training_plan_name_order on training_plan (plan_name, order_index);

-- Liste aller (nicht archivierten) Pläne
create index idx_training_plan_name on training_plan (plan_name) where not archived;

create trigger trg_training_plan_updated_at
  before update on training_plan
  for each row execute function set_updated_at();

alter table training_plan enable row level security;
