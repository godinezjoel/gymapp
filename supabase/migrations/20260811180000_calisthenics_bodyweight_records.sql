-- ============================================================================
-- Rekorde für Calisthenics: Körpergewicht statt reinem Zusatzgewicht
--
-- Bisher ging nur ws.weight_kg in die Epley-Formel ein. Bei Calisthenics
-- (Klimmzug, Liegestütz, ...) trägt niemand das eigene Körpergewicht als
-- "Gewicht" ein – weight_kg blieb 0, wodurch estimateOneRepMax() immer 0
-- ergab, unabhängig von den Wiederholungen. Ab jetzt zählt bei Übungen mit
-- is_calisthenics = true das zuletzt geloggte Körpergewicht (weight_logs)
-- plus das eingetragene Zusatz-/Hilfsgewicht (negativ bei Bandunterstützung).
--
-- weight_kg darf deshalb negativ sein – aber nur sinnvoll bei Calisthenics.
-- Das wird nicht per Check-Constraint erzwungen (bräuchte einen Trigger über
-- exercises), sondern in der UI: das Eingabefeld erlaubt Minus nur dort.
-- ============================================================================

alter table public.workout_sets drop constraint workout_sets_weight_range;
alter table public.workout_sets
  add constraint workout_sets_weight_range check (weight_kg is null or (weight_kg >= -500 and weight_kg <= 500));

drop view personal_records;

create view personal_records as
select distinct on (we.exercise_id)
  we.exercise_id,
  e.name as exercise_name,
  e.is_calisthenics,
  ws.weight_kg,
  bw.weight_kg as bodyweight_kg,
  ws.reps,
  ws.completed_at
from workout_sets ws
join workout_exercises we on we.id = ws.workout_exercise_id
join exercises e on e.id = we.exercise_id
left join lateral (
  select wl.weight_kg
  from weight_logs wl
  where wl.logged_date <= ws.completed_at::date
  order by wl.logged_date desc
  limit 1
) bw on e.is_calisthenics
where ws.is_completed = true
  and ws.weight_kg is not null
  and ws.reps is not null
  and ws.reps > 0
order by
  we.exercise_id,
  (
    (case when e.is_calisthenics then coalesce(bw.weight_kg, 0) + ws.weight_kg else ws.weight_kg end)
    * (1 + ws.reps / 30.0)
  ) desc,
  ws.completed_at desc;

alter view personal_records set (security_invoker = true);
