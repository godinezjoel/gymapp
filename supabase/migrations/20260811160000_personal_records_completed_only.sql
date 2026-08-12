-- ============================================================================
-- personal_records: nur erledigte Sätze zählen
--
-- Die View berücksichtigte bislang jeden Satz mit Gewicht und Wiederholungen,
-- unabhängig von is_completed. Ein aus der Planvorlage vorbefüllter Zielwert
-- oder ein gerade erst angelegter, noch nicht ausgefüllter Satz konnte damit
-- den Rekord verfälschen, obwohl er nie tatsächlich absolviert wurde.
-- ============================================================================

create or replace view personal_records as
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
where ws.is_completed = true
  and ws.weight_kg is not null
  and ws.reps is not null
  and ws.reps > 0
order by we.exercise_id, (ws.weight_kg * (1 + ws.reps / 30.0)) desc, ws.completed_at desc;

alter view personal_records set (security_invoker = true);
