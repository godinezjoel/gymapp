-- ============================================================================
-- Unterarm-Übungen für den Katalog
--
-- 'forearms' existierte bisher nur als sekundäre Muskelgruppe (z. B. bei
-- Curls) – keine Übung hatte es als primäre. Ergänzt gezielte
-- Unterarm-Übungen (Wrist Curls, Reverse Curls, Grip-Arbeit).
-- ============================================================================

insert into public.exercises (name, primary_muscle_group, secondary_muscle_groups, category, is_calisthenics) values
  ('Barbell Wrist Curl', 'forearms', '{}', 'barbell', false),
  ('Barbell Reverse Wrist Curl', 'forearms', '{}', 'barbell', false),
  ('Dumbbell Wrist Curl', 'forearms', '{}', 'dumbbell', false),
  ('Dumbbell Reverse Wrist Curl', 'forearms', '{}', 'dumbbell', false),
  ('Behind-the-Back Barbell Wrist Curl', 'forearms', '{}', 'barbell', false),
  ('Reverse Curl', 'forearms', '{biceps}', 'barbell', false),
  ('Cable Reverse Curl', 'forearms', '{biceps}', 'cable', false),
  ('Zottman Curl', 'forearms', '{biceps}', 'dumbbell', false),
  ('Wrist Roller', 'forearms', '{}', 'other', false),
  ('Plate Pinch Hold', 'forearms', '{}', 'other', true),
  ('Dead Hang', 'forearms', '{back}', 'bodyweight', true);
