-- ============================================================================
-- Totes Schema entfernen: category, notes, rpe, is_warmup
--
-- Keine dieser Spalten wird von der App je gelesen oder beschrieben (category,
-- notes, rpe) oder es gibt keine UI, um sie je auf einen anderen Wert als das
-- Default zu setzen (is_warmup) – die App kennt keine Warmup-Sätze. Ziel ist
-- ein Schema, das nur trägt, was V1/V2 tatsächlich benutzen.
-- ============================================================================

-- create_workout_from_plan_day kopiert category mit – muss zuerst angepasst
-- werden, sonst schlägt der spätere DROP COLUMN wegen der Funktionsreferenz
-- nicht fehl (Funktionen sind nicht an Spalten gebunden), liefe aber ab hier
-- mit einer nicht mehr existierenden Spalte ins Leere.
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
    select order_index, exercise_name, default_sets, default_reps, default_weight_kg
      from public.workout_plan_day_exercises
     where day_id = p_day_id
     order by order_index
  loop
    insert into public.workout_exercises (workout_id, exercise_name, order_index)
    values (v_workout_id, v_exercise.exercise_name, v_exercise.order_index)
    returning id into v_exercise_id;

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

-- personal_records filterte bisher is_warmup heraus; die Spalte fällt weg,
-- also fällt der Filter mit weg.
create or replace view personal_records as
select distinct on (we.exercise_name)
  we.exercise_name,
  ws.weight_kg,
  ws.reps,
  ws.weight_kg * ws.reps as estimated_volume,
  ws.completed_at
from workout_sets ws
join workout_exercises we on we.id = ws.workout_exercise_id
where ws.weight_kg is not null
  and ws.reps is not null
  and ws.reps > 0
order by we.exercise_name, (ws.weight_kg * (1 + ws.reps / 30.0)) desc, ws.completed_at desc;

alter view personal_records set (security_invoker = true);

alter table workout_exercises drop column category;
alter table workout_exercises drop column notes;
alter table workout_plan_day_exercises drop column category;
alter table workout_sets drop column rpe;
alter table workout_sets drop column notes;
alter table workout_sets drop column is_warmup;

drop type exercise_category;
