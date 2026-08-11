-- ============================================================================
-- exercise_name (Freitext) -> exercise_id (Fremdschlüssel auf exercises)
--
-- Ablauf: Spalte hinzufügen -> aus dem bestehenden Freitext befüllen (für
-- Namen, die nicht im Katalog stehen, wird automatisch eine Custom-Übung
-- angelegt, damit kein Verlauf verloren geht) -> not null setzen -> View und
-- RPCs auf exercise_id umstellen -> exercise_name entfernen. So bleibt jeder
-- Zwischenschritt konsistent abfragbar.
-- ============================================================================

alter table public.workout_exercises
  add column exercise_id uuid references public.exercises(id);

alter table public.workout_plan_day_exercises
  add column exercise_id uuid references public.exercises(id);

-- Freitext-Namen, die (noch) nicht im Katalog stehen, werden als Custom-Übung
-- angelegt statt Verlauf/Rekorde beim Umstieg zu verlieren.
insert into public.exercises (name, primary_muscle_group, category, is_calisthenics)
select distinct btrim(exercise_name), 'other', 'other', false
from public.workout_exercises
where not exists (
  select 1 from public.exercises e where lower(e.name) = lower(btrim(workout_exercises.exercise_name))
)
on conflict (name) do nothing;

insert into public.exercises (name, primary_muscle_group, category, is_calisthenics)
select distinct btrim(exercise_name), 'other', 'other', false
from public.workout_plan_day_exercises
where not exists (
  select 1 from public.exercises e where lower(e.name) = lower(btrim(workout_plan_day_exercises.exercise_name))
)
on conflict (name) do nothing;

update public.workout_exercises we
set exercise_id = e.id
from public.exercises e
where lower(e.name) = lower(btrim(we.exercise_name))
  and we.exercise_id is null;

update public.workout_plan_day_exercises pde
set exercise_id = e.id
from public.exercises e
where lower(e.name) = lower(btrim(pde.exercise_name))
  and pde.exercise_id is null;

alter table public.workout_exercises
  alter column exercise_id set not null;

alter table public.workout_plan_day_exercises
  alter column exercise_id set not null;

create index idx_workout_exercises_exercise_id on public.workout_exercises (exercise_id);
create index idx_workout_plan_day_exercises_exercise_id on public.workout_plan_day_exercises (exercise_id);

-- personal_records gruppierte bisher nach exercise_name (Text); jetzt nach
-- exercise_id, mit dem Namen aus dem Katalog dazugejoint für die Anzeige.
-- CREATE OR REPLACE VIEW kann eine bestehende Spalte nicht umbenennen/an eine
-- andere Position setzen (exercise_name -> exercise_id an Position 1) -> drop + create.
drop view personal_records;

create view personal_records as
select distinct on (we.exercise_id)
  we.exercise_id,
  e.name as exercise_name,
  ws.weight_kg,
  ws.reps,
  ws.weight_kg * ws.reps as estimated_volume,
  ws.completed_at
from workout_sets ws
join workout_exercises we on we.id = ws.workout_exercise_id
join exercises e on e.id = we.exercise_id
where ws.weight_kg is not null
  and ws.reps is not null
  and ws.reps > 0
order by we.exercise_id, (ws.weight_kg * (1 + ws.reps / 30.0)) desc, ws.completed_at desc;

alter view personal_records set (security_invoker = true);

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
  select label into v_label from public.workout_plan_days where id = p_day_id;

  insert into public.workouts (workout_date, name, plan_id, started_at, finished_at)
  values (p_workout_date, v_label, p_plan_id, v_now, v_now)
  returning id into v_workout_id;

  if p_day_id is null then
    return v_workout_id;
  end if;

  for v_exercise in
    select order_index, exercise_id, default_reps, default_weight_kg
      from public.workout_plan_day_exercises
     where day_id = p_day_id
     order by order_index
  loop
    insert into public.workout_exercises (workout_id, exercise_id, order_index)
    values (v_workout_id, v_exercise.exercise_id, v_exercise.order_index)
    returning id into v_exercise_id;

    -- Genau ein Satz zum Start; weitere kommen bei Bedarf im Training dazu.
    insert into public.workout_sets (workout_exercise_id, set_number, reps, weight_kg)
    values (
      v_exercise_id,
      1,
      coalesce(v_exercise.default_reps, 0),
      coalesce(v_exercise.default_weight_kg, 0)
    );
  end loop;

  return v_workout_id;
end;
$$;

create or replace function save_workout_plan(
  p_name       text,
  p_start_date date,
  p_days       jsonb,
  p_plan_id    uuid default null
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
      (day_id, order_index, exercise_id, default_reps, default_weight_kg)
    select v_day_id,
           (e.ordinality - 1)::int,
           (e.value ->> 'exercise_id')::uuid,
           (e.value ->> 'default_reps')::int,
           (e.value ->> 'default_weight_kg')::numeric
      from jsonb_array_elements(coalesce(v_day.day -> 'exercises', '[]'::jsonb))
        with ordinality as e(value, ordinality);
  end loop;

  return v_plan_id;
end;
$$;

alter table public.workout_exercises drop column exercise_name;
alter table public.workout_plan_day_exercises drop column exercise_name;
