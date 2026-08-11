import { z } from "zod";

export const createWorkoutSchema = z.object({
  workoutDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Bitte ein gültiges Datum wählen")
    .refine((val) => !Number.isNaN(new Date(`${val}T00:00:00`).getTime()), {
      message: "Ungültiges Datum",
    }),
});
export type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;

export const addExerciseSchema = z.object({
  exerciseId: z.string().uuid("Übung auswählen"),
});
export type AddExerciseInput = z.infer<typeof addExerciseSchema>;

// Anlegen und Bearbeiten eines Satzes prüfen dieselben Werte nach denselben
// Regeln – ein gemeinsames Schema, damit die Grenzen nicht auseinanderlaufen.
export const setValuesSchema = z.object({
  reps: z
    .number({ error: "Wiederholungen erforderlich" })
    .int("Ganze Zahl erforderlich")
    .min(0, "Darf nicht negativ sein")
    .max(200, "Maximal 200 Wiederholungen"),
  weightKg: z
    .number({ error: "Gewicht erforderlich" })
    .min(0, "Darf nicht negativ sein")
    .max(500, "Maximal 500 kg"),
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
  .min(1, "Keine Sätze zum Speichern");
export type EditWorkoutSetsInput = z.infer<typeof editWorkoutSetsSchema>;
