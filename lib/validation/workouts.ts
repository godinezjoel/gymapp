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
  exerciseName: z.string().trim().min(1, "Name erforderlich").max(100, "Maximal 100 Zeichen"),
});
export type AddExerciseInput = z.infer<typeof addExerciseSchema>;

export const addSetSchema = z.object({
  reps: z
    .number({ invalid_type_error: "Wiederholungen erforderlich" })
    .int("Ganze Zahl erforderlich")
    .min(0, "Darf nicht negativ sein")
    .max(200, "Maximal 200 Wiederholungen"),
  weightKg: z
    .number({ invalid_type_error: "Gewicht erforderlich" })
    .min(0, "Darf nicht negativ sein")
    .max(500, "Maximal 500 kg"),
});
export type AddSetInput = z.infer<typeof addSetSchema>;
