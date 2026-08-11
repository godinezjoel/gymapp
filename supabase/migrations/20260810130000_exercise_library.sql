-- ============================================================================
-- Exercise Library: einzige Quelle der Wahrheit für Übungen
--
-- Bisher war exercise_name in workout_exercises und workout_plan_day_exercises
-- freier Text – dieselbe Übung konnte je nach Tippfehler/Schreibweise mehrfach
-- existieren, wodurch Verlauf, Rekorde und Volumen (die alle nach
-- exercise_name gruppieren) auseinanderfallen. Diese Migration legt den
-- Katalog an; die Umstellung von exercise_name auf exercise_id in den
-- referenzierenden Tabellen folgt in der nächsten Migration (erst befüllen,
-- dann als Fremdschlüssel verwenden).
-- ============================================================================

create table public.exercises (
  id                      uuid primary key default gen_random_uuid(),
  name                    text not null,
  primary_muscle_group    text not null,
  secondary_muscle_groups text[] not null default '{}',
  category                text not null,
  is_calisthenics         boolean not null default false,
  created_at              timestamptz not null default now(),
  constraint exercises_name_not_blank check (btrim(name) <> ''),
  constraint exercises_name_unique unique (name),
  constraint exercises_primary_muscle_group_check check (primary_muscle_group in (
    'chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms', 'abs',
    'quads', 'hamstrings', 'glutes', 'calves', 'full_body', 'cardio', 'other'
  )),
  constraint exercises_category_check check (category in (
    'barbell', 'dumbbell', 'machine', 'cable', 'smith_machine', 'bodyweight',
    'kettlebell', 'band', 'other'
  ))
);

-- Suche per ilike '%term%' auf einem kleinen Katalog (paar hundert Zeilen) ist
-- schnell genug ohne pg_trgm; der Index deckt den häufigsten Fall (Suche ab
-- Wortanfang, case-insensitive) ab.
create index idx_exercises_name_lower on public.exercises (lower(name));
create index idx_exercises_primary_muscle_group on public.exercises (primary_muscle_group);
create index idx_exercises_category on public.exercises (category);

alter table public.exercises enable row level security;

insert into public.exercises (name, primary_muscle_group, secondary_muscle_groups, category, is_calisthenics) values
  -- Brust
  ('Barbell Bench Press', 'chest', '{triceps,shoulders}', 'barbell', false),
  ('Incline Barbell Bench Press', 'chest', '{shoulders,triceps}', 'barbell', false),
  ('Decline Barbell Bench Press', 'chest', '{triceps}', 'barbell', false),
  ('Dumbbell Bench Press', 'chest', '{triceps,shoulders}', 'dumbbell', false),
  ('Incline Dumbbell Bench Press', 'chest', '{shoulders,triceps}', 'dumbbell', false),
  ('Decline Dumbbell Bench Press', 'chest', '{triceps}', 'dumbbell', false),
  ('Smith Machine Bench Press', 'chest', '{triceps,shoulders}', 'smith_machine', false),
  ('Smith Machine Incline Bench Press', 'chest', '{shoulders,triceps}', 'smith_machine', false),
  ('Machine Chest Press', 'chest', '{triceps}', 'machine', false),
  ('Pec Deck Fly', 'chest', '{}', 'machine', false),
  ('Cable Fly High to Low', 'chest', '{}', 'cable', false),
  ('Cable Fly Low to High', 'chest', '{shoulders}', 'cable', false),
  ('Cable Crossover', 'chest', '{}', 'cable', false),
  ('Dumbbell Fly', 'chest', '{}', 'dumbbell', false),
  ('Incline Dumbbell Fly', 'chest', '{shoulders}', 'dumbbell', false),
  ('Push Up', 'chest', '{triceps,shoulders}', 'bodyweight', true),
  ('Incline Push Up', 'chest', '{triceps}', 'bodyweight', true),
  ('Decline Push Up', 'chest', '{shoulders,triceps}', 'bodyweight', true),
  ('Diamond Push Up', 'triceps', '{chest}', 'bodyweight', true),
  ('Chest Dip', 'chest', '{triceps}', 'bodyweight', true),
  ('Archer Push Up', 'chest', '{triceps}', 'bodyweight', true),
  -- Rücken
  ('Barbell Deadlift', 'back', '{hamstrings,glutes}', 'barbell', false),
  ('Sumo Deadlift', 'back', '{hamstrings,glutes,quads}', 'barbell', false),
  ('Romanian Deadlift', 'hamstrings', '{back,glutes}', 'barbell', false),
  ('Dumbbell Romanian Deadlift', 'hamstrings', '{back,glutes}', 'dumbbell', false),
  ('Rack Pull', 'back', '{hamstrings}', 'barbell', false),
  ('Barbell Row', 'back', '{biceps}', 'barbell', false),
  ('Pendlay Row', 'back', '{biceps}', 'barbell', false),
  ('T-Bar Row', 'back', '{biceps}', 'machine', false),
  ('Seated Cable Row', 'back', '{biceps}', 'cable', false),
  ('Chest-Supported Row', 'back', '{biceps}', 'machine', false),
  ('One-Arm Dumbbell Row', 'back', '{biceps}', 'dumbbell', false),
  ('Lat Pulldown', 'back', '{biceps}', 'cable', false),
  ('Close-Grip Lat Pulldown', 'back', '{biceps}', 'cable', false),
  ('Wide-Grip Lat Pulldown', 'back', '{biceps}', 'cable', false),
  ('Pull Up', 'back', '{biceps}', 'bodyweight', true),
  ('Chin Up', 'back', '{biceps}', 'bodyweight', true),
  ('Neutral-Grip Pull Up', 'back', '{biceps}', 'bodyweight', true),
  ('Assisted Pull Up Machine', 'back', '{biceps}', 'machine', false),
  ('Straight-Arm Pulldown', 'back', '{}', 'cable', false),
  ('Face Pull', 'shoulders', '{back}', 'cable', false),
  ('Hyperextension', 'back', '{glutes,hamstrings}', 'bodyweight', true),
  ('Good Morning', 'hamstrings', '{back,glutes}', 'barbell', false),
  ('Ring Row', 'back', '{biceps}', 'bodyweight', true),
  -- Schultern
  ('Barbell Overhead Press', 'shoulders', '{triceps}', 'barbell', false),
  ('Seated Dumbbell Shoulder Press', 'shoulders', '{triceps}', 'dumbbell', false),
  ('Arnold Press', 'shoulders', '{triceps}', 'dumbbell', false),
  ('Machine Shoulder Press', 'shoulders', '{triceps}', 'machine', false),
  ('Smith Machine Shoulder Press', 'shoulders', '{triceps}', 'smith_machine', false),
  ('Dumbbell Lateral Raise', 'shoulders', '{}', 'dumbbell', false),
  ('Cable Lateral Raise', 'shoulders', '{}', 'cable', false),
  ('Front Raise', 'shoulders', '{}', 'dumbbell', false),
  ('Rear Delt Fly', 'shoulders', '{back}', 'dumbbell', false),
  ('Reverse Pec Deck', 'shoulders', '{back}', 'machine', false),
  ('Upright Row', 'shoulders', '{back}', 'barbell', false),
  ('Barbell Shrug', 'shoulders', '{back}', 'barbell', false),
  ('Dumbbell Shrug', 'shoulders', '{back}', 'dumbbell', false),
  ('Smith Machine Shrug', 'shoulders', '{back}', 'smith_machine', false),
  ('Handstand Push Up', 'shoulders', '{triceps}', 'bodyweight', true),
  ('Handstand Hold', 'shoulders', '{abs}', 'bodyweight', true),
  ('Wall Walk', 'shoulders', '{abs}', 'bodyweight', true),
  ('Band Pull-Apart', 'shoulders', '{back}', 'band', false),
  -- Bizeps
  ('Barbell Curl', 'biceps', '{forearms}', 'barbell', false),
  ('EZ-Bar Curl', 'biceps', '{forearms}', 'barbell', false),
  ('Dumbbell Curl', 'biceps', '{forearms}', 'dumbbell', false),
  ('Hammer Curl', 'biceps', '{forearms}', 'dumbbell', false),
  ('Incline Dumbbell Curl', 'biceps', '{}', 'dumbbell', false),
  ('Preacher Curl', 'biceps', '{}', 'barbell', false),
  ('Cable Curl', 'biceps', '{}', 'cable', false),
  ('Concentration Curl', 'biceps', '{}', 'dumbbell', false),
  ('Machine Bicep Curl', 'biceps', '{}', 'machine', false),
  ('Spider Curl', 'biceps', '{}', 'barbell', false),
  -- Trizeps
  ('Triceps Rope Pushdown', 'triceps', '{}', 'cable', false),
  ('Triceps Bar Pushdown', 'triceps', '{}', 'cable', false),
  ('Overhead Dumbbell Triceps Extension', 'triceps', '{}', 'dumbbell', false),
  ('Overhead Cable Triceps Extension', 'triceps', '{}', 'cable', false),
  ('Skull Crusher', 'triceps', '{}', 'barbell', false),
  ('Close-Grip Bench Press', 'triceps', '{chest}', 'barbell', false),
  ('Triceps Dip', 'triceps', '{chest}', 'bodyweight', true),
  ('Machine Triceps Extension', 'triceps', '{}', 'machine', false),
  ('Dumbbell Kickback', 'triceps', '{}', 'dumbbell', false),
  -- Beine
  ('Back Squat', 'quads', '{glutes,hamstrings}', 'barbell', false),
  ('Front Squat', 'quads', '{glutes}', 'barbell', false),
  ('Smith Machine Squat', 'quads', '{glutes}', 'smith_machine', false),
  ('Hack Squat', 'quads', '{glutes}', 'machine', false),
  ('Leg Press', 'quads', '{glutes,hamstrings}', 'machine', false),
  ('Bulgarian Split Squat', 'quads', '{glutes}', 'dumbbell', false),
  ('Walking Lunge', 'quads', '{glutes}', 'dumbbell', false),
  ('Reverse Lunge', 'quads', '{glutes}', 'dumbbell', false),
  ('Barbell Lunge', 'quads', '{glutes}', 'barbell', false),
  ('Step Up', 'quads', '{glutes}', 'dumbbell', false),
  ('Leg Extension', 'quads', '{}', 'machine', false),
  ('Lying Leg Curl', 'hamstrings', '{}', 'machine', false),
  ('Seated Leg Curl', 'hamstrings', '{}', 'machine', false),
  ('Hip Thrust', 'glutes', '{hamstrings}', 'barbell', false),
  ('Glute Bridge', 'glutes', '{hamstrings}', 'bodyweight', true),
  ('Cable Kickback', 'glutes', '{}', 'cable', false),
  ('Standing Calf Raise', 'calves', '{}', 'machine', false),
  ('Seated Calf Raise', 'calves', '{}', 'machine', false),
  ('Leg Press Calf Raise', 'calves', '{}', 'machine', false),
  ('Goblet Squat', 'quads', '{glutes}', 'dumbbell', false),
  ('Kettlebell Goblet Squat', 'quads', '{glutes}', 'kettlebell', false),
  ('Sissy Squat', 'quads', '{}', 'bodyweight', true),
  ('Pistol Squat', 'quads', '{glutes}', 'bodyweight', true),
  ('Jump Squat', 'quads', '{glutes}', 'bodyweight', true),
  ('Box Jump', 'quads', '{glutes}', 'bodyweight', true),
  -- Bauch / Core
  ('Plank', 'abs', '{}', 'bodyweight', true),
  ('Side Plank', 'abs', '{}', 'bodyweight', true),
  ('Crunch', 'abs', '{}', 'bodyweight', true),
  ('Bicycle Crunch', 'abs', '{}', 'bodyweight', true),
  ('Hanging Leg Raise', 'abs', '{}', 'bodyweight', true),
  ('Hanging Knee Raise', 'abs', '{}', 'bodyweight', true),
  ('Cable Crunch', 'abs', '{}', 'cable', false),
  ('Ab Wheel Rollout', 'abs', '{}', 'other', true),
  ('Russian Twist', 'abs', '{}', 'bodyweight', true),
  ('Mountain Climber', 'abs', '{}', 'bodyweight', true),
  ('Sit Up', 'abs', '{}', 'bodyweight', true),
  ('Toes to Bar', 'abs', '{}', 'bodyweight', true),
  ('Dragon Flag', 'abs', '{}', 'bodyweight', true),
  ('V-Up', 'abs', '{}', 'bodyweight', true),
  ('Flutter Kicks', 'abs', '{}', 'bodyweight', true),
  ('L-Sit', 'abs', '{shoulders}', 'bodyweight', true),
  -- Kalisthenik / Ganzkörper
  ('Muscle Up', 'back', '{biceps,chest}', 'bodyweight', true),
  ('Ring Dip', 'chest', '{triceps}', 'bodyweight', true),
  ('Burpee', 'full_body', '{}', 'bodyweight', true),
  ('Bear Crawl', 'full_body', '{}', 'bodyweight', true),
  -- Cardio
  ('Treadmill Running', 'cardio', '{}', 'other', false),
  ('Rowing Machine', 'cardio', '{back}', 'machine', false),
  ('Stationary Bike', 'cardio', '{}', 'other', false),
  ('Elliptical', 'cardio', '{}', 'other', false),
  ('Stair Climber', 'cardio', '{}', 'other', false),
  ('Jump Rope', 'cardio', '{calves}', 'bodyweight', true),
  -- Ganzkörper / Sonstiges
  ('Kettlebell Swing', 'full_body', '{glutes,back}', 'kettlebell', false),
  ('Barbell Clean and Jerk', 'full_body', '{}', 'barbell', false),
  ('Barbell Snatch', 'full_body', '{}', 'barbell', false),
  ('Farmers Carry', 'full_body', '{forearms}', 'dumbbell', false),
  ('Turkish Get-Up', 'full_body', '{}', 'kettlebell', false),
  ('Battle Ropes', 'full_body', '{}', 'other', false),
  ('Sled Push', 'full_body', '{quads}', 'other', false),
  ('Sled Pull', 'full_body', '{back}', 'other', false),
  ('Resistance Band Row', 'back', '{biceps}', 'band', false);
