import { z } from "zod";

// "Unbegrenzte Zykluslänge" heißt: nicht auf eine Woche festgelegt, beliebig
// viele Tage. Die Obergrenzen sind reine Plausibilität gegen versehentliche
// Riesen-Eingaben, kein fachliches Limit.
export const MAX_CYCLE_DAYS = 366;
export const MAX_DAY_EXERCISES = 40;

// Leere Zahlenfelder sind der Normalfall: alle drei Vorgaben sind optional.
// Das Formular liefert dafür null (siehe setValueAs in PlanDayFields), null
// bedeutet hier durchgängig "keine Vorgabe" – nicht 0.
export const planExerciseSchema = z.object({
  exerciseName: z.string().trim().min(1, "Name erforderlich").max(100, "Maximal 100 Zeichen"),
  defaultSets: z
    .number()
    .int("Ganze Zahl erforderlich")
    .min(1, "Mindestens 1 Satz")
    .max(20, "Maximal 20 Sätze")
    .nullable(),
  // Untergrenze 1, obwohl die Datenbank auch 0 zulässt: als Vorgabe ist "0
  // Wiederholungen" bedeutungslos, im Protokoll dagegen ein gültiger Wert.
  defaultReps: z
    .number()
    .int("Ganze Zahl erforderlich")
    .min(1, "Mindestens 1 Wiederholung")
    .max(200, "Maximal 200 Wiederholungen")
    .nullable(),
  defaultWeightKg: z
    .number()
    .min(0, "Darf nicht negativ sein")
    .max(500, "Maximal 500 kg")
    .nullable(),
});
export type PlanExerciseInput = z.infer<typeof planExerciseSchema>;

// Ein Ruhetag darf Übungen behalten: wer einen Tag versehentlich auf "Frei"
// stellt und zurückstellt, soll seine Vorlage nicht verloren haben. Beim Start
// eines Workouts wird die Vorlage eines Ruhetags bewusst ignoriert.
export const planDaySchema = z.object({
  label: z.string().trim().min(1, "Name erforderlich").max(40, "Maximal 40 Zeichen"),
  isRest: z.boolean(),
  exercises: z
    .array(planExerciseSchema)
    .max(MAX_DAY_EXERCISES, `Maximal ${MAX_DAY_EXERCISES} Übungen pro Tag`),
});
export type PlanDayInput = z.infer<typeof planDaySchema>;

export const workoutPlanSchema = z.object({
  // null = neuer Plan, sonst der zu überschreibende. Dasselbe Formular bedient
  // beide Fälle, deshalb steht die ID im Schema und nicht daneben.
  id: z.string().uuid().nullable(),
  name: z.string().trim().min(1, "Name erforderlich").max(60, "Maximal 60 Zeichen"),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Bitte ein gültiges Datum wählen")
    .refine((val) => !Number.isNaN(new Date(`${val}T00:00:00`).getTime()), {
      message: "Ungültiges Datum",
    }),
  days: z
    .array(planDaySchema)
    .min(1, "Mindestens ein Tag erforderlich")
    .max(MAX_CYCLE_DAYS, `Maximal ${MAX_CYCLE_DAYS} Tage`),
});
export type WorkoutPlanInput = z.infer<typeof workoutPlanSchema>;
