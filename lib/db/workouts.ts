import "server-only";
import { dbError } from "@/lib/db/error";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { Workout, WorkoutExercise, WorkoutSet } from "@/types";

export type WorkoutDayRef = Pick<Workout, "id" | "workout_date">;

/**
 * Workouts innerhalb eines Datumsbereichs – Datenquelle des Kalenderrasters.
 * Nur ID und Datum: mehr braucht eine Zelle nicht (Markierung + Link).
 */
export async function listWorkoutsInRange(
  fromDate: string,
  toDate: string,
): Promise<WorkoutDayRef[]> {
  const { data, error } = await supabaseAdmin
    .from("workouts")
    .select("id, workout_date")
    .gte("workout_date", fromDate)
    .lte("workout_date", toDate)
    .order("workout_date", { ascending: true })
    .order("started_at", { ascending: true });

  if (error) {
    throw dbError("Workouts konnten nicht geladen werden", error);
  }
  return data ?? [];
}

/**
 * Nur die Datumswerte ab `sinceDate` – Datenquelle der Streak-Berechnung.
 * Eine Spalte, keine Joins: die Streak braucht ausschließlich die Tage, an
 * denen trainiert wurde.
 */
export async function listWorkoutDatesSince(sinceDate: string): Promise<string[]> {
  const { data, error } = await supabaseAdmin
    .from("workouts")
    .select("workout_date")
    .gte("workout_date", sinceDate)
    .order("workout_date", { ascending: true });

  if (error) {
    throw dbError("Trainingstage konnten nicht geladen werden", error);
  }
  return (data ?? []).map((row) => row.workout_date);
}

/**
 * Anzahl aller je erfassten Workouts.
 *
 * head + count statt listWorkoutDatesSince(...).length: die Streak-Abfrage ist
 * auf zwei Jahre begrenzt und läge als Gesamtzahl im Profil daneben. Mit `head`
 * überträgt PostgREST nur den Zähler, keine Zeilen.
 */
export async function countWorkouts(): Promise<number> {
  const { count, error } = await supabaseAdmin
    .from("workouts")
    .select("id", { count: "exact", head: true });

  if (error) {
    throw dbError("Workouts konnten nicht gezählt werden", error);
  }
  return count ?? 0;
}

// Bewusst schmal geschnitten: diese Objekte werden in die RSC-Flight-Payload
// serialisiert und an Client-Komponenten übergeben. Spalten, die die UI nicht
// rendert (notes, category, rpe, is_warmup, Zeitstempel), gingen sonst bei jedem
// Seitenaufruf zusätzlich an den Browser.
export type WorkoutSetDetail = Pick<WorkoutSet, "id" | "reps" | "weight_kg">;
export type WorkoutExerciseDetail = Pick<WorkoutExercise, "id" | "exercise_name"> & {
  sets: WorkoutSetDetail[];
};
export type WorkoutDetail = Pick<Workout, "id" | "workout_date" | "name"> & {
  exercises: WorkoutExerciseDetail[];
};

type WorkoutExerciseRow = Pick<WorkoutExercise, "id" | "exercise_name"> & {
  workout_sets: WorkoutSetDetail[];
};

export async function getWorkoutDetail(workoutId: string): Promise<WorkoutDetail | null> {
  const { data: workout, error: workoutError } = await supabaseAdmin
    .from("workouts")
    .select("id, workout_date, name")
    .eq("id", workoutId)
    .maybeSingle();

  if (workoutError) {
    throw dbError("Workout konnte nicht geladen werden", workoutError);
  }
  if (!workout) return null;

  const { data: exercises, error: exercisesError } = await supabaseAdmin
    .from("workout_exercises")
    .select("id, exercise_name, workout_sets(id, reps, weight_kg)")
    .eq("workout_id", workoutId)
    .order("order_index", { ascending: true })
    .order("set_number", { ascending: true, referencedTable: "workout_sets" });

  if (exercisesError) {
    throw dbError("Übungen konnten nicht geladen werden", exercisesError);
  }

  return {
    ...workout,
    exercises: ((exercises ?? []) as WorkoutExerciseRow[]).map(({ workout_sets, ...exercise }) => ({
      ...exercise,
      sets: workout_sets,
    })),
  };
}

/**
 * Workout anlegen und dabei die Übungsvorlage des Tages hineinkopieren.
 *
 * Über die RPC create_workout_from_plan_day, weil Workout, Übungen und
 * Vorgabesätze in einer Transaktion entstehen müssen – als 1 + N + M
 * PostgREST-Requests bliebe bei einem Abbruch ein halb befülltes Workout
 * zurück. Ab dem Kopieren sind Vorlage und Protokoll unabhängig.
 *
 * `planDayId === null` erzeugt wie früher eine leere Einheit: kein Plan, oder
 * ein Ruhetag. Ob ein Ruhetag seine Vorlage liefert, entscheidet der Aufrufer –
 * siehe planDayForWorkout.
 *
 * Gibt die ID des neuen Workouts zurück (der Aufrufer leitet darauf weiter).
 */
export async function createWorkoutFromPlanDay(
  workoutDate: string,
  planId: string | null,
  planDayId: string | null,
): Promise<string> {
  const { data, error } = await supabaseAdmin.rpc("create_workout_from_plan_day", {
    p_workout_date: workoutDate,
    // Weggelassen statt null: beide SQL-Parameter haben DEFAULT null.
    ...(planId ? { p_plan_id: planId } : {}),
    ...(planDayId ? { p_day_id: planDayId } : {}),
  });

  if (error) {
    throw dbError("Workout konnte nicht erstellt werden", error);
  }
  return data;
}

// Kein .select(): die Aufrufer (Server Actions) verwerfen die eingefügte Zeile,
// die Seite wird ohnehin komplett neu gerendert.
export async function addExercise(workoutId: string, exerciseName: string): Promise<void> {
  const { data: last } = await supabaseAdmin
    .from("workout_exercises")
    .select("order_index")
    .eq("workout_id", workoutId)
    .order("order_index", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabaseAdmin.from("workout_exercises").insert({
    workout_id: workoutId,
    exercise_name: exerciseName,
    order_index: (last?.order_index ?? -1) + 1,
  });

  if (error) {
    throw dbError("Übung konnte nicht hinzugefügt werden", error);
  }
}

export async function deleteExercise(exerciseId: string): Promise<void> {
  const { error } = await supabaseAdmin.from("workout_exercises").delete().eq("id", exerciseId);
  if (error) {
    throw dbError("Übung konnte nicht gelöscht werden", error);
  }
}

export async function addSet(exerciseId: string, reps: number, weightKg: number): Promise<void> {
  const { data: last } = await supabaseAdmin
    .from("workout_sets")
    .select("set_number")
    .eq("workout_exercise_id", exerciseId)
    .order("set_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabaseAdmin.from("workout_sets").insert({
    workout_exercise_id: exerciseId,
    set_number: (last?.set_number ?? 0) + 1,
    reps,
    weight_kg: weightKg,
  });

  if (error) {
    throw dbError("Satz konnte nicht hinzugefügt werden", error);
  }
}

// Ändert ausschließlich das Protokoll. Die Vorlage, aus der der Satz kopiert
// wurde, bleibt unberührt – es gibt nach dem Start keine Verbindung mehr.
export async function updateSet(setId: string, reps: number, weightKg: number): Promise<void> {
  const { error } = await supabaseAdmin
    .from("workout_sets")
    .update({ reps, weight_kg: weightKg })
    .eq("id", setId);

  if (error) {
    throw dbError("Satz konnte nicht gespeichert werden", error);
  }
}

export async function deleteSet(setId: string): Promise<void> {
  const { error } = await supabaseAdmin.from("workout_sets").delete().eq("id", setId);
  if (error) {
    throw dbError("Satz konnte nicht gelöscht werden", error);
  }
}
