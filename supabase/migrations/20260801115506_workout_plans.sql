-- ============================================================================
-- workout_plans / workout_plan_days / workout_plan_day_exercises
--
-- Ablösung von training_split: statt einem einzigen Split gibt es beliebig
-- viele benannte Pläne (PPL, Upper/Lower, Home, Urlaub …), von denen genau
-- einer aktiv ist. Der aktive Plan bestimmt überall in der App, welcher Tag
-- heute ansteht.
--
-- Drei Ebenen statt zwei, weil jeder Zyklustag jetzt zusätzlich eine
-- Übungsvorlage trägt:
--
--   workout_plans              ein Plan  (Name, Startdatum, aktiv?)
--   └ workout_plan_days        ein Platz im Rotationszyklus (Push, Pull, Rest)
--     └ workout_plan_day_exercises  eine Übung samt Vorgabewerten
--
-- Die Rotation bleibt rein rechnerisch: (heute - start_date) mod Zykluslänge.
-- Es wird weiterhin nichts pro Kalendertag gespeichert, der Zyklus ist damit
-- unbegrenzt weit in beide Richtungen auswertbar.
--
-- Vorlagen und Protokoll sind bewusst getrennte Tabellenbäume. Beim Starten
-- eines Workouts werden die Vorgabewerte KOPIERT (siehe
-- create_workout_from_plan_day). Eine spätere Änderung an der Vorlage kann
-- deshalb kein bereits protokolliertes Training rückwirkend verändern.
-- ============================================================================

create table workout_plans (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  start_date date not null default current_date,
  is_active  boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint workout_plans_name_not_blank check (btrim(name) <> '')
);

-- Höchstens ein aktiver Plan – Partial-Unique-Index auf einem konstanten
-- Ausdruck, dieselbe Technik wie idx_workouts_single_active. Erzwingt die
-- Regel auf DB-Ebene, statt sich auf die UI zu verlassen.
create unique index idx_workout_plans_single_active
  on workout_plans ((true)) where is_active;

-- Die Kartenliste wird nach Anlagedatum sortiert gelesen
create index idx_workout_plans_created_at on workout_plans (created_at);

create trigger trg_workout_plans_updated_at
  before update on workout_plans
  for each row execute function set_updated_at();

alter table workout_plans enable row level security;
-- Bewusst keine Policies: Zugriff ausschließlich serverseitig über den
-- service_role Key (ADR-03), analog zu allen übrigen Tabellen.

create table workout_plan_days (
  id          uuid primary key default gen_random_uuid(),
  plan_id     uuid not null references workout_plans (id) on delete cascade,
  -- 0-basiert und lückenlos: cycle_index ist zugleich das Ergebnis der
  -- Modulo-Rechnung, mit der der heutige Tag bestimmt wird. Eine Lücke wäre
  -- daher ein Datenfehler, kein Sonderfall.
  -- Spaltenname bewusst nicht "position": das ist in SQL ein Funktionsname.
  cycle_index int not null,
  label       text not null,
  -- Ruhetage sind vollwertige Zyklusplätze, brauchen aber eine andere
  -- Darstellung – und bekommen beim Start kein Workout aus der Vorlage.
  is_rest     boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  constraint workout_plan_days_cycle_index_non_negative check (cycle_index >= 0),
  constraint workout_plan_days_label_not_blank check (btrim(label) <> '')
);

create unique index idx_workout_plan_days_plan_cycle_index
  on workout_plan_days (plan_id, cycle_index);

-- Postgres indiziert FK-Spalten nicht automatisch
create index idx_workout_plan_days_plan_id on workout_plan_days (plan_id);

create trigger trg_workout_plan_days_updated_at
  before update on workout_plan_days
  for each row execute function set_updated_at();

alter table workout_plan_days enable row level security;

create table workout_plan_day_exercises (
  id                uuid primary key default gen_random_uuid(),
  day_id            uuid not null references workout_plan_days (id) on delete cascade,
  -- 0-basiert und lückenlos wie workout_exercises.order_index, damit die
  -- Reihenfolge beim Kopieren 1:1 übernommen werden kann.
  order_index       int not null,
  exercise_name     text not null,
  category          exercise_category,
  -- Alle drei Vorgaben sind optional: eine Vorlage darf auch nur aus
  -- Übungsnamen bestehen. NULL heißt "keine Vorgabe", nicht "0".
  default_sets      int,
  default_reps      int,
  default_weight_kg numeric(6,2),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  constraint workout_plan_day_exercises_order_index_non_negative check (order_index >= 0),
  constraint workout_plan_day_exercises_name_not_blank check (btrim(exercise_name) <> ''),
  -- Grenzen bewusst identisch zu workout_sets: eine Vorgabe, die sich nicht in
  -- einen gültigen Satz kopieren lässt, wäre beim Start eine Zeitbombe.
  constraint workout_plan_day_exercises_default_sets_range
    check (default_sets is null or default_sets between 1 and 20),
  constraint workout_plan_day_exercises_default_reps_range
    check (default_reps is null or default_reps between 0 and 200),
  constraint workout_plan_day_exercises_default_weight_range
    check (default_weight_kg is null or default_weight_kg between 0 and 500)
);

create unique index idx_workout_plan_day_exercises_day_order
  on workout_plan_day_exercises (day_id, order_index);

create index idx_workout_plan_day_exercises_day_id
  on workout_plan_day_exercises (day_id);

create trigger trg_workout_plan_day_exercises_updated_at
  before update on workout_plan_day_exercises
  for each row execute function set_updated_at();

alter table workout_plan_day_exercises enable row level security;

-- ============================================================================
-- workouts.plan_id: aus welchem Plan stammt diese Einheit
--
-- on delete set null, damit das Löschen eines Plans die Historie nicht
-- anrührt. Bewusst KEIN Verweis auf workout_plan_days: die Tagesliste wird bei
-- jeder Planänderung komplett ersetzt (siehe save_workout_plan), ein FK darauf
-- würde bei jedem Speichern die Herkunft aller Altworkouts auf NULL setzen.
-- Der Tagesname wandert stattdessen als Kopie in workouts.name.
-- ============================================================================
alter table workouts
  add column plan_id uuid references workout_plans (id) on delete set null;

create index idx_workouts_plan_id on workouts (plan_id) where plan_id is not null;

-- ============================================================================
-- save_workout_plan: Plan samt Tagen und Übungen komplett ersetzen
--
-- Das Umsortieren von Tagen bzw. Übungen kollidiert mit den Unique-Indizes auf
-- (plan_id, cycle_index) und (day_id, order_index), solange man Zeile für Zeile
-- aktualisiert. Statt das über deferrable Constraints zu lösen, ersetzt diese
-- Funktion den kompletten Unterbaum – delete + insert in EINER Transaktion.
-- Als getrennte PostgREST-Requests wären es N Transaktionen: bricht eine ab,
-- stünde der Plan halb gelöscht da.
-- ============================================================================
create or replace function save_workout_plan(
  p_plan_id    uuid,
  p_name       text,
  p_start_date date,
  p_days       jsonb
)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  v_plan_id      uuid := p_plan_id;
  v_has_active   boolean;
  v_day          record;
  v_day_id       uuid;
begin
  if jsonb_typeof(p_days) <> 'array' or jsonb_array_length(p_days) = 0 then
    raise exception 'Ein Plan braucht mindestens einen Tag';
  end if;

  if v_plan_id is null then
    -- Der erste Plan überhaupt wird automatisch aktiv: sonst stünde das
    -- Dashboard direkt nach dem Anlegen ohne heutigen Tag da.
    select exists (select 1 from public.workout_plans where is_active) into v_has_active;

    insert into public.workout_plans (name, start_date, is_active)
    values (p_name, p_start_date, not v_has_active)
    returning id into v_plan_id;
  else
    update public.workout_plans
       set name = p_name,
           start_date = p_start_date
     where id = v_plan_id;

    if not found then
      raise exception 'Plan % existiert nicht', v_plan_id;
    end if;

    -- Der Cascade räumt die Übungen der gelöschten Tage gleich mit weg.
    delete from public.workout_plan_days where plan_id = v_plan_id;
  end if;

  for v_day in
    select (d.ordinality - 1)::int as cycle_index, d.value as day
      from jsonb_array_elements(p_days) with ordinality as d(value, ordinality)
  loop
    insert into public.workout_plan_days (plan_id, cycle_index, label, is_rest)
    values (
      v_plan_id,
      v_day.cycle_index,
      v_day.day ->> 'label',
      coalesce((v_day.day ->> 'is_rest')::boolean, false)
    )
    returning id into v_day_id;

    insert into public.workout_plan_day_exercises
      (day_id, order_index, exercise_name, default_sets, default_reps, default_weight_kg)
    select v_day_id,
           (e.ordinality - 1)::int,
           e.value ->> 'exercise_name',
           (e.value ->> 'default_sets')::int,
           (e.value ->> 'default_reps')::int,
           (e.value ->> 'default_weight_kg')::numeric
      from jsonb_array_elements(coalesce(v_day.day -> 'exercises', '[]'::jsonb))
        with ordinality as e(value, ordinality);
  end loop;

  return v_plan_id;
end;
$$;

-- ============================================================================
-- set_active_workout_plan: genau einen Plan aktiv schalten
--
-- Zwei Anweisungen in einer Transaktion, weil idx_workout_plans_single_active
-- auch einen kurzzeitigen zweiten aktiven Plan zurückweisen würde.
-- ============================================================================
create or replace function set_active_workout_plan(p_plan_id uuid)
returns void
language plpgsql
set search_path = ''
as $$
begin
  update public.workout_plans set is_active = false where is_active and id <> p_plan_id;

  update public.workout_plans set is_active = true where id = p_plan_id;
  if not found then
    raise exception 'Plan % existiert nicht', p_plan_id;
  end if;
end;
$$;

-- ============================================================================
-- delete_workout_plan: Plan löschen, ohne die App ohne aktiven Plan zu lassen
-- ============================================================================
create or replace function delete_workout_plan(p_plan_id uuid)
returns void
language plpgsql
set search_path = ''
as $$
declare
  v_was_active boolean;
  v_next_id    uuid;
begin
  delete from public.workout_plans where id = p_plan_id returning is_active into v_was_active;

  if v_was_active is null then
    raise exception 'Plan % existiert nicht', p_plan_id;
  end if;

  -- War es der aktive Plan, rückt der älteste verbleibende nach – sonst hätte
  -- das Dashboard keinen heutigen Tag mehr, obwohl noch Pläne da sind.
  if v_was_active then
    select id into v_next_id from public.workout_plans order by created_at limit 1;

    if v_next_id is not null then
      update public.workout_plans set is_active = true where id = v_next_id;
    end if;
  end if;
end;
$$;

-- ============================================================================
-- create_workout_from_plan_day: Workout aus der Tagesvorlage anlegen
--
-- Kopiert Übungen und Vorgabewerte in das Protokoll. Ab diesem Moment sind
-- Vorlage und Protokoll unabhängig: Bearbeiten im Training ändert die Vorlage
-- nicht, Bearbeiten der Vorlage ändert vergangene Trainings nicht.
--
-- Als eine Transaktion statt 1 + N + M PostgREST-Requests: ein abgebrochener
-- Lauf hinterließe sonst ein halb befülltes Workout.
--
-- p_day_id darf NULL sein (kein Plan, Ruhetag, freies Workout) – dann entsteht
-- wie bisher eine leere Einheit. Ob ein Ruhetag eine Vorlage liefert,
-- entscheidet bewusst die Anwendungsschicht, nicht diese Funktion.
-- ============================================================================
create or replace function create_workout_from_plan_day(
  p_workout_date date,
  p_plan_id      uuid default null,
  p_day_id       uuid default null
)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  v_workout_id  uuid;
  v_now         timestamptz := now();
  v_label       text;
  v_exercise    record;
  v_exercise_id uuid;
begin
  -- Der Tagesname wird als Kopie mitgeführt: er soll in der Historie stehen
  -- bleiben, auch wenn der Plan später umbenannt, umgebaut oder gelöscht wird.
  select label into v_label from public.workout_plan_days where id = p_day_id;

  -- finished_at sofort setzen: dieses Modul kennt keinen Start/Stop-Status,
  -- und idx_workouts_single_active ließe sonst nur ein einziges Workout zu.
  insert into public.workouts (workout_date, name, plan_id, started_at, finished_at)
  values (p_workout_date, v_label, p_plan_id, v_now, v_now)
  returning id into v_workout_id;

  if p_day_id is null then
    return v_workout_id;
  end if;

  for v_exercise in
    select order_index, exercise_name, category, default_sets, default_reps, default_weight_kg
      from public.workout_plan_day_exercises
     where day_id = p_day_id
     order by order_index
  loop
    insert into public.workout_exercises (workout_id, exercise_name, category, order_index)
    values (v_workout_id, v_exercise.exercise_name, v_exercise.category, v_exercise.order_index)
    returning id into v_exercise_id;

    -- Ohne default_sets bleibt die Übung leer: dann ist "wie viele Sätze"
    -- bewusst nicht vorgegeben und wird im Training erfasst.
    if v_exercise.default_sets is not null then
      insert into public.workout_sets (workout_exercise_id, set_number, reps, weight_kg)
      select v_exercise_id,
             s,
             coalesce(v_exercise.default_reps, 0),
             coalesce(v_exercise.default_weight_kg, 0)
        from generate_series(1, v_exercise.default_sets) as s;
    end if;
  end loop;

  return v_workout_id;
end;
$$;

-- anon/authenticated erben EXECUTE über die implizite PUBLIC-Pseudorolle
-- (siehe 20260727164633) – die Funktionen sollen ausschließlich serverseitig
-- aufrufbar sein.
revoke execute on function public.save_workout_plan(uuid, text, date, jsonb) from public;
grant  execute on function public.save_workout_plan(uuid, text, date, jsonb) to service_role;

revoke execute on function public.set_active_workout_plan(uuid) from public;
grant  execute on function public.set_active_workout_plan(uuid) to service_role;

revoke execute on function public.delete_workout_plan(uuid) from public;
grant  execute on function public.delete_workout_plan(uuid) to service_role;

revoke execute on function public.create_workout_from_plan_day(date, uuid, uuid) from public;
grant  execute on function public.create_workout_from_plan_day(date, uuid, uuid) to service_role;

-- ============================================================================
-- Bestandsdaten übernehmen
--
-- training_split war ein Singleton, es entsteht also genau ein Plan – der wird
-- der aktive. Die Schleife hält das trotzdem allgemein, damit die Migration
-- auch auf einer Datenbank ohne Split (frische Installation) durchläuft.
-- ============================================================================
do $$
declare
  v_split   record;
  v_plan_id uuid;
begin
  for v_split in select * from public.training_split order by created_at loop
    insert into public.workout_plans (name, start_date, is_active, created_at)
    values (
      v_split.name,
      v_split.start_date,
      not exists (select 1 from public.workout_plans where is_active),
      v_split.created_at
    )
    returning id into v_plan_id;

    insert into public.workout_plan_days (plan_id, cycle_index, label, is_rest, created_at)
    select v_plan_id, d.cycle_index, d.label, d.is_rest, d.created_at
      from public.training_split_days d
     where d.split_id = v_split.id;
  end loop;
end $$;

-- ============================================================================
-- Abgelöste Objekte entfernen
--
-- training_plan war der erste Anlauf für Übungsvorlagen: eine flache Tabelle,
-- über plan_name gruppiert, ohne Verbindung zum Rotationszyklus. Genau das
-- leistet workout_plan_day_exercises jetzt richtig verknüpft. Die Tabelle war
-- leer und von der Anwendung nie beschrieben worden.
--
-- workouts.plan_name war der lose Textverweis darauf (ADR-06) und damit
-- ebenfalls gegenstandslos – ersetzt durch plan_id (Herkunft) und name
-- (Tagesname). Auch diese Spalte war in allen Zeilen NULL.
-- ============================================================================
drop function if exists public.set_training_split(text, date, jsonb);
drop table if exists public.training_split_days;
drop table if exists public.training_split;
drop table if exists public.training_plan;

drop index if exists public.idx_workouts_plan_name;
alter table workouts drop column plan_name;
