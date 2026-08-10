import type { Database } from "./database";

type PublicTables = Database["public"]["Tables"];
type PublicViews = Database["public"]["Views"];

export type Workout = PublicTables["workouts"]["Row"];
export type WorkoutExercise = PublicTables["workout_exercises"]["Row"];
export type WorkoutSet = PublicTables["workout_sets"]["Row"];
export type WeightLog = PublicTables["weight_logs"]["Row"];
export type Measurement = PublicTables["measurements"]["Row"];
export type PushSubscriptionRow = PublicTables["push_subscriptions"]["Row"];
export type WorkoutPlanRow = PublicTables["workout_plans"]["Row"];
export type WorkoutPlanDayRow = PublicTables["workout_plan_days"]["Row"];
export type WorkoutPlanDayExerciseRow = PublicTables["workout_plan_day_exercises"]["Row"];
export type PersonalRecord = PublicViews["personal_records"]["Row"];

export type MeasurementType = Database["public"]["Enums"]["measurement_type"];

export type { Database } from "./database";
