-- ============================================================================
-- upsert_today_exercise_record: Rekordfeld auf der Startseite
--
-- Die neue, vereinfachte Startseite (Notizen-Look) zeigt pro Übung direkt den
-- Rekord und lässt ihn an Ort und Stelle bearbeiten. "Rekord aktualisieren"
-- heißt technisch: für das heutige Workout (anlegen, falls es noch keins
-- gibt) den einen Satz der Übung anlegen/überschreiben und als erledigt
-- markieren – die personal_records-View (bestes je erfasstes Set) zieht den
-- neuen Wert automatisch, sobald er der beste ist.
--
-- Als einzelne RPC statt mehrerer PostgREST-Requests aus der Server Action,
-- aus demselben Grund wie bei create_workout_from_plan_day: "Workout finden
-- oder anlegen" + "Übung finden oder anlegen" + "Satz schreiben" muss
-- atomar sein, sonst könnte ein gleichzeitiger zweiter Aufruf für denselben
-- Tag ein doppeltes Workout anlegen.
-- ============================================================================

create or replace function upsert_today_exercise_record(
  p_workout_date date,
  p_exercise_id  uuid,
  p_reps         int,
  p_weight_kg    numeric
)
returns void
language plpgsql
set search_path = ''
as $$
declare
  v_workout_id  uuid;
  v_exercise_id uuid;
  v_set_id      uuid;
  v_now         timestamptz := now();
begin
  select id into v_workout_id
    from public.workouts
   where workout_date = p_workout_date
   order by started_at asc
   limit 1;

  if v_workout_id is null then
    insert into public.workouts (workout_date, started_at, finished_at)
    values (p_workout_date, v_now, v_now)
    returning id into v_workout_id;
  end if;

  select we.id into v_exercise_id
    from public.workout_exercises we
   where we.workout_id = v_workout_id
     and we.exercise_id = p_exercise_id
   limit 1;

  if v_exercise_id is null then
    insert into public.workout_exercises (workout_id, exercise_id, order_index)
    select v_workout_id, p_exercise_id, coalesce(max(order_index) + 1, 0)
      from public.workout_exercises
     where workout_id = v_workout_id
    returning id into v_exercise_id;
  end if;

  select id into v_set_id
    from public.workout_sets
   where workout_exercise_id = v_exercise_id
   order by set_number asc
   limit 1;

  if v_set_id is null then
    insert into public.workout_sets (workout_exercise_id, set_number, reps, weight_kg, is_completed, completed_at)
    values (v_exercise_id, 1, p_reps, p_weight_kg, true, v_now);
  else
    update public.workout_sets
       set reps = p_reps,
           weight_kg = p_weight_kg,
           is_completed = true,
           completed_at = v_now
     where id = v_set_id;
  end if;
end;
$$;
