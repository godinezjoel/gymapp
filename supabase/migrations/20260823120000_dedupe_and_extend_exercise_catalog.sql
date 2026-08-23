-- ============================================================================
-- Exercise catalog cleanup + additions
--
-- Über die freie-Text-Ära und manuell angelegte Übungen sind Dubletten in den
-- Katalog geraten – teils deutsch (Klimmzüge, Bankdrücken, Romanisches
-- Kreuzheben), teils englische Schreibvarianten (Push-ups, Tricep Rope
-- Pushdown). Diese Migration führt jede Dublette auf ihren kanonischen,
-- englischen Katalogeintrag zurück: erst werden alle Verweise in
-- workout_exercises und workout_plan_day_exercises umgehängt (kein Verlust von
-- Verlauf/Plänen), dann wird die Dublette gelöscht. Anschließend bekommen die
-- als 'other' fehlkategorisierten Eigenanlagen korrekte Muskelgruppe/Kategorie,
-- und drei neue Übungen werden ergänzt.
--
-- Namensbasiert statt per UUID, damit die Migration portabel und idempotent
-- bleibt (fehlt ein Eintrag, wird das Paar übersprungen).
-- ============================================================================

-- 1. Dubletten zusammenführen: Verweise umhängen, dann Dublette löschen.
do $$
declare
  pair record;
begin
  for pair in
    select * from (values
      ('Klimmzüge',                          'Pull Up'),
      ('Bankdrücken',                        'Barbell Bench Press'),
      ('Romanisches Kreuzheben',             'Romanian Deadlift'),
      ('Push-ups',                           'Push Up'),
      ('Tricep Rope Pushdown',               'Triceps Rope Pushdown'),
      ('Triceps Pushdown',                   'Triceps Rope Pushdown'),
      ('Machine Chest Fly',                  'Pec Deck Fly'),
      ('Seated Smith Machine Shoulder Press','Smith Machine Shoulder Press'),
      ('Triceps Dip',                        'Dips'),
      ('Chest Dip',                          'Dips')
    ) as t(dup_name, canon_name)
  loop
    update public.workout_exercises we
      set exercise_id = c.id
      from public.exercises d, public.exercises c
      where we.exercise_id = d.id and d.name = pair.dup_name and c.name = pair.canon_name;

    update public.workout_plan_day_exercises pde
      set exercise_id = c.id
      from public.exercises d, public.exercises c
      where pde.exercise_id = d.id and d.name = pair.dup_name and c.name = pair.canon_name;

    delete from public.exercises where name = pair.dup_name;
  end loop;
end $$;

-- 2. Eigenanlagen behalten, aber korrekt kategorisieren (waren alle 'other').
update public.exercises set primary_muscle_group='triceps', category='bodyweight', is_calisthenics=true  where name='Dips';
update public.exercises set primary_muscle_group='calves',  category='bodyweight', is_calisthenics=true  where name='Bodyweight Calf Raise';
update public.exercises set primary_muscle_group='quads',   category='machine'                            where name='Horizontal Leg Press';
update public.exercises set primary_muscle_group='back',    category='machine'                            where name='Machine Back Extension';
update public.exercises set primary_muscle_group='calves',  category='machine'                            where name='Machine Calf Press';
update public.exercises set primary_muscle_group='abs',     category='machine'                            where name='Machine Seated Crunch';
update public.exercises set primary_muscle_group='quads',   category='machine'                            where name='Pendulum Squat';
update public.exercises set primary_muscle_group='abs',     category='bodyweight', is_calisthenics=true  where name='Roman Chair Leg Raise';
update public.exercises set primary_muscle_group='abs',     category='bodyweight', is_calisthenics=true  where name='Roman Chair Side Bend';
update public.exercises set primary_muscle_group='back',    category='machine'                            where name='Machine Row';
update public.exercises set primary_muscle_group='biceps',  category='dumbbell'                           where name='Biceps Curls';

-- 3. Neue Übungen.
insert into public.exercises (name, primary_muscle_group, secondary_muscle_groups, category, is_calisthenics) values
  ('Cable Wrist Curl',                   'forearms', '{}', 'cable',    false),
  ('Single-Arm Cable Triceps Extension', 'triceps',  '{}', 'cable',    false),
  ('Single-Arm Preacher Curl',           'biceps',   '{}', 'dumbbell', false)
on conflict (name) do nothing;
