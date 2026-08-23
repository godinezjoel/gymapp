import { z } from "zod";

// "Unbegrenzte Zykluslänge" heißt: nicht auf eine Woche festgelegt, beliebig
// viele Tage. Die Obergrenzen sind reine Plausibilität gegen versehentliche
// Riesen-Eingaben, kein fachliches Limit.
export const MAX_CYCLE_DAYS = 366;
export const MAX_DAY_EXERCISES = 40;

// Leere Zahlenfelder sind der Normalfall: beide Vorgaben sind optional. Das
// Formular liefert dafür null (siehe setValueAs in PlanDayFields), null
// bedeutet hier durchgängig "keine Vorgabe" – nicht 0.
//
// Bewusst keine Sätze-Vorgabe mehr: ein Workout startet immer mit genau einem
// Satz (dem, der zählt), weitere legt man im Training selbst an – siehe
// create_workout_from_plan_day (Migration 20260810120000).
export const planExerciseSchema = z.object({
  exerciseId: z.string().uuid("Select an exercise"),
  // Nur für die Anzeige im Formular (Feldname, Zusammenfassung in der
  // Kopfzeile) – der Server liest ausschließlich exerciseId, siehe
  // save_workout_plan.
  exerciseName: z.string().trim().min(1, "Select an exercise"),
  // Untergrenze 1, obwohl die Datenbank auch 0 zulässt: als Vorgabe ist "0
  // Wiederholungen" bedeutungslos, im Protokoll dagegen ein gültiger Wert.
  defaultReps: z
    .number()
    .int("Whole number required")
    .min(1, "At least 1 rep")
    .max(200, "Max 200 reps")
    .nullable(),
  defaultWeightKg: z
    .number()
    .min(0, "Cannot be negative")
    .max(500, "Max 500 kg")
    .nullable(),
});
export type PlanExerciseInput = z.infer<typeof planExerciseSchema>;

// Ein Ruhetag darf Übungen behalten: wer einen Tag versehentlich auf "Frei"
// stellt und zurückstellt, soll seine Vorlage nicht verloren haben. Beim Start
// eines Workouts wird die Vorlage eines Ruhetags bewusst ignoriert.
export const planDaySchema = z.object({
  label: z.string().trim().min(1, "Name required").max(40, "Max 40 characters"),
  isRest: z.boolean(),
  exercises: z
    .array(planExerciseSchema)
    .max(MAX_DAY_EXERCISES, `Max ${MAX_DAY_EXERCISES} exercises per day`),
});
export type PlanDayInput = z.infer<typeof planDaySchema>;

export const workoutPlanSchema = z.object({
  // null = neuer Plan, sonst der zu überschreibende. Dasselbe Formular bedient
  // beide Fälle, deshalb steht die ID im Schema und nicht daneben.
  id: z.string().uuid().nullable(),
  name: z.string().trim().min(1, "Name required").max(60, "Max 60 characters"),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Please choose a valid date")
    .refine((val) => !Number.isNaN(new Date(`${val}T00:00:00`).getTime()), {
      message: "Invalid date",
    }),
  days: z
    .array(planDaySchema)
    .min(1, "At least one day required")
    .max(MAX_CYCLE_DAYS, `Max ${MAX_CYCLE_DAYS} days`),
});
export type WorkoutPlanInput = z.infer<typeof workoutPlanSchema>;
