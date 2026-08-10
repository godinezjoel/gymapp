-- ============================================================================
-- personal_records: Sortierung auf geschätztes 1RM (Epley) umgestellt
--
-- Bisher zählte reines Gewicht, unabhängig von den Wiederholungen – ein
-- Satz mit 1 Wdh. schlug damit jeden kontrollierten Satz mit mehr
-- Wiederholungen, unabhängig von der tatsächlichen Kraftleistung. Epley
-- (Gewicht * (1 + Wdh./30)) macht Sätze unterschiedlicher Wiederholungszahl
-- vergleichbar.
-- ============================================================================

create or replace view personal_records as
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
  and ws.reps is not null
  and ws.reps > 0
order by we.exercise_name, (ws.weight_kg * (1 + ws.reps / 30.0)) desc, ws.completed_at desc;

-- CREATE OR REPLACE VIEW ändert nur die Abfrage; das Reloption bleibt zwar
-- normalerweise erhalten, wird hier aber sicherheitshalber erneut gesetzt.
alter view personal_records set (security_invoker = true);
