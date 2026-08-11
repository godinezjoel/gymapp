// Muss mit den check-Constraints aus der exercises-Tabelle übereinstimmen
// (Migration 20260810130000) – eine Quelle für Validierung und UI, damit
// beide nie auseinanderlaufen.
export const MUSCLE_GROUPS = [
  "chest",
  "back",
  "shoulders",
  "biceps",
  "triceps",
  "forearms",
  "abs",
  "quads",
  "hamstrings",
  "glutes",
  "calves",
  "full_body",
  "cardio",
  "other",
] as const;
export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  chest: "Brust",
  back: "Rücken",
  shoulders: "Schultern",
  biceps: "Bizeps",
  triceps: "Trizeps",
  forearms: "Unterarme",
  abs: "Bauch",
  quads: "Quadrizeps",
  hamstrings: "Beinbeuger",
  glutes: "Gesäß",
  calves: "Waden",
  full_body: "Ganzkörper",
  cardio: "Cardio",
  other: "Sonstiges",
};

export const EXERCISE_CATEGORIES = [
  "barbell",
  "dumbbell",
  "machine",
  "cable",
  "smith_machine",
  "bodyweight",
  "kettlebell",
  "band",
  "other",
] as const;
export type ExerciseCategory = (typeof EXERCISE_CATEGORIES)[number];

export const EXERCISE_CATEGORY_LABELS: Record<ExerciseCategory, string> = {
  barbell: "Langhantel",
  dumbbell: "Kurzhantel",
  machine: "Maschine",
  cable: "Kabelzug",
  smith_machine: "Smith Machine",
  bodyweight: "Körpergewicht",
  kettlebell: "Kettlebell",
  band: "Band",
  other: "Sonstiges",
};
