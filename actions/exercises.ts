"use server";

import * as db from "@/lib/db/exercises";
import { createExerciseSchema, type CreateExerciseInput } from "@/lib/validation/exercises";
import type { ExerciseCatalogEntry, LastPerformance } from "@/lib/db/exercises";

export type ExerciseSelectorData = {
  exercises: ExerciseCatalogEntry[];
  lastPerformances: [string, LastPerformance][];
};

// Ein Request für Katalog + letzte Ausführungen statt zwei: die Auswahl
// braucht beides gleichzeitig, um "schon gemacht"-Markierungen zu zeigen.
// Map ist nicht direkt serialisierbar über die Server-Action-Grenze, daher
// als Eintragsliste.
export async function loadExerciseSelectorDataAction(): Promise<ExerciseSelectorData> {
  const [exercises, lastPerformances] = await Promise.all([
    db.listExercises(),
    db.listLastPerformances(),
  ]);

  return { exercises, lastPerformances: [...lastPerformances.entries()] };
}

export async function createExerciseAction(
  input: CreateExerciseInput,
): Promise<ExerciseCatalogEntry> {
  const parsed = createExerciseSchema.parse(input);
  return db.createCustomExercise({
    name: parsed.name,
    primaryMuscleGroup: parsed.primaryMuscleGroup,
    category: parsed.category,
    isCalisthenics: parsed.isCalisthenics,
  });
}
