-- ============================================================================
-- Neue Übung: Single Arm Cable Row
-- ============================================================================

insert into public.exercises (name, primary_muscle_group, secondary_muscle_groups, category, is_calisthenics) values
  ('Single Arm Cable Row', 'back', '{biceps}', 'cable', false)
on conflict (name) do nothing;
