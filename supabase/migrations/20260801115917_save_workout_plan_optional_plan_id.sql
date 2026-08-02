-- ============================================================================
-- save_workout_plan: p_plan_id ans Ende mit DEFAULT null
--
-- Fachlich ändert sich nichts – nur die Signatur. Der Supabase-Typgenerator
-- bildet nullable RPC-Parameter nicht ab (uuid ohne DEFAULT wird zu `string`,
-- nicht zu `string | null`), optionale dagegen schon. Mit dem Default heißt
-- "kein p_plan_id übergeben" auch im TypeScript-Typ genau das, was es in SQL
-- heißt: neuer Plan. Ohne diese Änderung bräuchte lib/db/workoutPlans.ts einen
-- Cast, der die fehlende Nullability überdeckt statt sie abzubilden.
--
-- Die Reihenfolge von Funktionsparametern lässt sich nicht per CREATE OR
-- REPLACE ändern ("cannot change name of input parameter") – daher drop +
-- create. Der Rumpf ist unverändert aus 20260801115506 übernommen.
-- ============================================================================

drop function if exists public.save_workout_plan(uuid, text, date, jsonb);

create function save_workout_plan(
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
  v_plan_id    uuid := p_plan_id;
  v_has_active boolean;
  v_day        record;
  v_day_id     uuid;
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

revoke execute on function public.save_workout_plan(text, date, jsonb, uuid) from public;
grant  execute on function public.save_workout_plan(text, date, jsonb, uuid) to service_role;
