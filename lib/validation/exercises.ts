import { z } from "zod";
import { MUSCLE_GROUPS, EXERCISE_CATEGORIES } from "@/lib/constants/exercises";

export const createExerciseSchema = z.object({
  name: z.string().trim().min(1, "Name erforderlich").max(100, "Maximal 100 Zeichen"),
  primaryMuscleGroup: z.enum(MUSCLE_GROUPS, { error: "Muskelgruppe erforderlich" }),
  category: z.enum(EXERCISE_CATEGORIES, { error: "Kategorie erforderlich" }),
  isCalisthenics: z.boolean(),
});
export type CreateExerciseInput = z.infer<typeof createExerciseSchema>;
