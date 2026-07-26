import type { Database } from "./database";

type PublicTables = Database["public"]["Tables"];
type PublicViews = Database["public"]["Views"];

export type Workout = PublicTables["workouts"]["Row"];
export type WorkoutExercise = PublicTables["workout_exercises"]["Row"];
export type WorkoutSet = PublicTables["workout_sets"]["Row"];
export type WeightLog = PublicTables["weight_logs"]["Row"];
export type Measurement = PublicTables["measurements"]["Row"];
export type PushSubscriptionRow = PublicTables["push_subscriptions"]["Row"];
export type TrainingPlanEntry = PublicTables["training_plan"]["Row"];
export type PersonalRecord = PublicViews["personal_records"]["Row"];

export type ExerciseCategory = Database["public"]["Enums"]["exercise_category"];
export type MeasurementType = Database["public"]["Enums"]["measurement_type"];

export type { Database } from "./database";
