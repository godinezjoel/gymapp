-- ============================================================================
-- personal_records: abgeleitete View statt eigener Tabelle (ADR-06)
--
-- Nicht Teil der angeforderten sieben Tabellen, aber direkte Folge davon:
-- eine gepflegte PR-Tabelle könnte mit workout_sets auseinanderlaufen,
-- sobald ein Satz nachträglich korrigiert oder gelöscht wird. Ein View kann
-- das strukturell nicht.
-- ============================================================================

create view personal_records as
select distinct on (we.exercise_name)
  we.exercise_name,
  ws.weight_kg,
  ws.reps,
  ws.weight_kg * ws.reps as estimated_volume,
  ws.completed_at
from workout_sets ws
join workout_exercises we on we.id = ws.workout_exercise_id
where ws.is_warmup = false
  and ws.weight_kg is not null
order by we.exercise_name, ws.weight_kg desc, ws.completed_at desc;
