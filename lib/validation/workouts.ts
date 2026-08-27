import { z } from "zod";

export const createWorkoutSchema = z.object({
  workoutDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Please choose a valid date")
    .refine((val) => !Number.isNaN(new Date(`${val}T00:00:00`).getTime()), {
      message: "Invalid date",
    }),
});
export type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;

export const addExerciseSchema = z.object({
  exerciseId: z.string().uuid("Select an exercise"),
});
export type AddExerciseInput = z.infer<typeof addExerciseSchema>;

// Anlegen und Bearbeiten eines Satzes prüfen dieselben Werte nach denselben
// Regeln – ein gemeinsames Schema, damit die Grenzen nicht auseinanderlaufen.
export const setValuesSchema = z.object({
  reps: z
    .number({ error: "Reps required" })
    .int("Whole number required")
    .min(0, "Cannot be negative")
    .max(200, "Max 200 reps"),
  // Bei Calisthenics ist ein negatives Zusatzgewicht eine Bandunterstützung
  // (workout_sets_weight_range erlaubt -500..500) – die Grenze hier darf
  // deshalb nicht enger sein als der DB-Constraint.
  weightKg: z
    .number({ error: "Weight required" })
    .min(-500, "At least -500 kg")
    .max(500, "Max 500 kg"),
});
export type SetValuesInput = z.infer<typeof setValuesSchema>;

// Für das Bearbeiten-Sheet: alle Sätze eines Workouts auf einmal, jeder mit
// seiner ID adressiert. Dieselben Wertegrenzen wie setValuesSchema, damit die
// Regeln nicht auseinanderlaufen.
export const editWorkoutSetsSchema = z
  .array(
    z.object({
      id: z.string().uuid(),
      reps: setValuesSchema.shape.reps,
      weightKg: setValuesSchema.shape.weightKg,
    }),
  )
  .min(1, "No sets to save");
export type EditWorkoutSetsInput = z.infer<typeof editWorkoutSetsSchema>;

// Für das Rekordfeld auf der Startseite: dieselben Wertegrenzen wie
// setValuesSchema, plus die Übung und der Tag, für den geschrieben wird.
export const todayRecordSchema = z.object({
  exerciseId: z.string().uuid("Invalid exercise ID"),
  workoutDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Please choose a valid date"),
  reps: setValuesSchema.shape.reps,
  weightKg: setValuesSchema.shape.weightKg,
});
export type TodayRecordInput = z.infer<typeof todayRecordSchema>;
