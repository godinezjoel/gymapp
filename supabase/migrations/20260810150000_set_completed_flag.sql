-- ============================================================================
-- workout_sets.is_completed: sichtbarer "erledigt"-Status je Satz
--
-- Bisher gab es keinen Unterschied zwischen einem aus der Vorlage
-- vorbefüllten Zielwert und einem tatsächlich absolvierten Satz – beide
-- standen identisch in der Liste. Diese Spalte trägt den Unterschied.
--
-- Bestehende Sätze (alles, was schon im Protokoll steht) gilt als bereits
-- erledigt – sonst stünde jedes offene Workout nach dem Deploy plötzlich
-- voller "nicht erledigt"-Markierungen für Sätze, die längst eingetragen
-- sind. Neue, aus einer Planvorlage vorbefüllte Sätze starten dagegen bei
-- false (Default) und warten auf Bestätigung – das übernimmt
-- create_workout_from_plan_day automatisch, ohne Änderung an der Funktion.
-- Manuell hinzugefügte Sätze (NewSetRow) gelten dagegen sofort als erledigt,
-- weil das Eintragen dort selbst schon die Bestätigung ist – das setzt
-- lib/db/workouts.ts beim Insert.
-- ============================================================================

alter table public.workout_sets
  add column is_completed boolean not null default false;

update public.workout_sets set is_completed = true;
