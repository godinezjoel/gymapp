-- ============================================================================
-- workouts: eine Trainingseinheit (Session)
-- ============================================================================

create table workouts (
  id            uuid primary key default gen_random_uuid(),
  workout_date  date not null default current_date,
  name          text,
  plan_name     text,
  notes         text,
  started_at    timestamptz not null default now(),
  finished_at   timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint workouts_finished_after_started
    check (finished_at is null or finished_at >= started_at)
);

comment on column workouts.plan_name is
  'Loser Verweis auf training_plan.plan_name. Bewusst kein Foreign Key: plan_name ist in '
  'training_plan nicht eindeutig, da mehrere Zeilen (Übungs-Slots) zu einem Plan gehören. '
  'Siehe ADR-06 im Architekturkonzept.';

-- Historie wird praktisch immer absteigend nach Datum gelesen
create index idx_workouts_date on workouts (workout_date desc);

-- Filter "alle Workouts aus Plan X"
create index idx_workouts_plan_name on workouts (plan_name) where plan_name is not null;

-- Partial-Unique-Index auf einem konstanten Ausdruck: es kann immer nur eine
-- offene (nicht abgeschlossene) Session gleichzeitig geben.
create unique index idx_workouts_single_active on workouts ((true)) where finished_at is null;

create trigger trg_workouts_updated_at
  before update on workouts
  for each row execute function set_updated_at();

alter table workouts enable row level security;
-- Bewusst keine Policies: Zugriff erfolgt ausschließlich serverseitig über den
-- Supabase service_role Key (ADR-03). service_role umgeht RLS grundsätzlich,
-- anon/authenticated haben ohne Policy dadurch keinerlei Zugriff auf diese Tabelle.
