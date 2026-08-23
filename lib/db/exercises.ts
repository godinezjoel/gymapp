import "server-only";
import { dbError } from "@/lib/db/error";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { Exercise } from "@/types";

export type ExerciseCatalogEntry = Pick<
  Exercise,
  "id" | "name" | "primary_muscle_group" | "secondary_muscle_groups" | "category" | "is_calisthenics"
>;

/**
 * Ganzer Katalog auf einmal statt einer Suche pro Tastenanschlag als
 * Server-Roundtrip: ein paar hundert Zeilen sind wenige KB, die Auswahl
 * filtert clientseitig (siehe ExerciseSelectorSheet) – das bleibt auf dem
 * Handy spürbar schneller als ein Request je Eingabe.
 */
export async function listExercises(): Promise<ExerciseCatalogEntry[]> {
  const { data, error } = await supabaseAdmin
    .from("exercises")
    .select("id, name, primary_muscle_group, secondary_muscle_groups, category, is_calisthenics")
    .order("name", { ascending: true });

  if (error) {
    throw dbError("Exercise catalog could not be loaded", error);
  }
  return data ?? [];
}

export type LastPerformance = {
  reps: number | null;
  weightKg: number | null;
  workoutDate: string;
};

type LastPerformanceRow = {
  exercise_id: string;
  workout: { workout_date: string; started_at: string } | null;
  workout_sets: { reps: number | null; weight_kg: number | null; set_number: number }[];
};

/**
 * Letzte Ausführung je Übung (nicht der Rekord – der steht in
 * personal_records und ist meist ein anderer Satz). Datenquelle für die
 * "schon gemacht"-Markierung samt Datum in der Übungsauswahl.
 */
export async function listLastPerformances(): Promise<Map<string, LastPerformance>> {
  const { data, error } = await supabaseAdmin
    .from("workout_exercises")
    .select(
      "exercise_id, workout:workouts(workout_date, started_at), workout_sets(reps, weight_kg, set_number)",
    );

  if (error) {
    throw dbError("Recent performances could not be loaded", error);
  }

  const rows = (data ?? []) as unknown as LastPerformanceRow[];

  // Neueste zuerst, damit beim Reduzieren pro Übung nur die letzte Ausführung
  // übrig bleibt.
  rows.sort((left, right) => {
    const leftTime = left.workout ? new Date(left.workout.started_at).getTime() : 0;
    const rightTime = right.workout ? new Date(right.workout.started_at).getTime() : 0;
    return rightTime - leftTime;
  });

  const result = new Map<string, LastPerformance>();
  for (const row of rows) {
    if (result.has(row.exercise_id) || !row.workout) continue;
    const topSet = [...row.workout_sets].sort((left, right) => right.set_number - left.set_number)[0];
    result.set(row.exercise_id, {
      reps: topSet?.reps ?? null,
      weightKg: topSet?.weight_kg ?? null,
      workoutDate: row.workout.workout_date,
    });
  }
  return result;
}

/**
 * Custom-Übung anlegen – oder, falls der Name (case-insensitiv) schon
 * existiert, die vorhandene Zeile zurückgeben. exercise_id ist die einzige
 * Referenz, über die Verlauf, Rekorde und Volumen zusammenfinden: dieselbe
 * Übung darf nie zwei Datensätze bekommen, nur weil sie leicht anders
 * geschrieben eingegeben wurde. Der DB-Unique-Index ist case-sensitiv, daher
 * der eigene Vorab-Check statt Verlass auf einen Constraint-Fehler.
 */
export async function createCustomExercise(input: {
  name: string;
  primaryMuscleGroup: string;
  category: string;
  isCalisthenics: boolean;
}): Promise<ExerciseCatalogEntry> {
  const name = input.name.trim();

  const { data: existing, error: lookupError } = await supabaseAdmin
    .from("exercises")
    .select("id, name, primary_muscle_group, secondary_muscle_groups, category, is_calisthenics")
    .ilike("name", name)
    .maybeSingle();

  if (lookupError) {
    throw dbError("Exercise could not be created", lookupError);
  }
  if (existing) return existing;

  const { data, error } = await supabaseAdmin
    .from("exercises")
    .insert({
      name,
      primary_muscle_group: input.primaryMuscleGroup,
      category: input.category,
      is_calisthenics: input.isCalisthenics,
    })
    .select("id, name, primary_muscle_group, secondary_muscle_groups, category, is_calisthenics")
    .single();

  if (error) {
    throw dbError("Exercise could not be created", error);
  }
  return data;
}
