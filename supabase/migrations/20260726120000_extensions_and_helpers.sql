-- ============================================================================
-- Erweiterungen & gemeinsame Hilfsfunktionen
-- ============================================================================

-- gen_random_uuid() für UUID-Primary-Keys
create extension if not exists pgcrypto;

-- Fester, aber leicht erweiterbarer Wertebereich für Körpermaße (measurements)
create type measurement_type as enum (
  'neck',
  'shoulders',
  'chest',
  'waist',
  'hips',
  'biceps_left',
  'biceps_right',
  'forearm_left',
  'forearm_right',
  'thigh_left',
  'thigh_right',
  'calf_left',
  'calf_right',
  'body_fat_pct'
);

-- Grobe Muskelgruppen-Kategorisierung, optional befüllt (workout_exercises, training_plan)
create type exercise_category as enum (
  'push',
  'pull',
  'legs',
  'core',
  'cardio',
  'fullbody',
  'other'
);

-- Gemeinsamer Trigger: setzt updated_at bei jedem UPDATE auf now()
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
