import { z } from "zod";
import { MUSCLE_GROUPS, EXERCISE_CATEGORIES } from "@/lib/constants/exercises";

export const createExerciseSchema = z.object({
  name: z.string().trim().min(1, "Name required").max(100, "Max 100 characters"),
  primaryMuscleGroup: z.enum(MUSCLE_GROUPS, { error: "Muscle group required" }),
  category: z.enum(EXERCISE_CATEGORIES, { error: "Category required" }),
  isCalisthenics: z.boolean(),
});
export type CreateExerciseInput = z.infer<typeof createExerciseSchema>;
