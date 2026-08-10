-- ============================================================================
-- Workouts starten mit genau einem Satz pro Übung
--
-- Bisher füllte create_workout_from_plan_day beim Start gleich default_sets
-- viele Sätze mit denselben Vorgabewerten – bei "4 x 6-10" also vier
-- identische Zeilen, von denen praktisch immer nur eine (die zum Muskel-
-- versagen oder ein Rekordversuch) tatsächlich zählt. Das musste man dann von
-- Hand wieder auf einen Satz zurückstutzen.
--
-- Neues Verhalten: jede Übung startet mit genau einem vorbefüllten Satz
-- (Vorgabe für Gewicht/Wiederholungen bleibt), weitere Sätze legt man bei
-- Bedarf selbst im Training an. personal_records zählt ohnehin nur den besten
-- Satz je Übung (siehe 20260809120000) – daran ändert das nichts.
--
-- default_sets wird damit nirgends mehr gelesen und fällt komplett weg, statt
-- als totes Feld im Formular stehen zu bleiben (dieselbe Linie wie beim
-- Entfernen von category/notes/rpe/is_warmup in 20260809130000).
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
  select label into v_label from public.workout_plan_days where id = p_day_id;

  insert into public.workouts (workout_date, name, plan_id, started_at, finished_at)
  values (p_workout_date, v_label, p_plan_id, v_now, v_now)
  returning id into v_workout_id;

  if p_day_id is null then
    return v_workout_id;
  end if;

  for v_exercise in
    select order_index, exercise_name, default_reps, default_weight_kg
      from public.workout_plan_day_exercises
     where day_id = p_day_id
     order by order_index
  loop
    insert into public.workout_exercises (workout_id, exercise_name, order_index)
    values (v_workout_id, v_exercise.exercise_name, v_exercise.order_index)
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
      (day_id, order_index, exercise_name, default_reps, default_weight_kg)
    select v_day_id,
           (e.ordinality - 1)::int,
           e.value ->> 'exercise_name',
           (e.value ->> 'default_reps')::int,
           (e.value ->> 'default_weight_kg')::numeric
      from jsonb_array_elements(coalesce(v_day.day -> 'exercises', '[]'::jsonb))
        with ordinality as e(value, ordinality);
  end loop;

  return v_plan_id;
end;
$$;

alter table workout_plan_day_exercises
  drop constraint workout_plan_day_exercises_default_sets_range;

alter table workout_plan_day_exercises
  drop column default_sets;
