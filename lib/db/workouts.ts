import "server-only";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { Workout, WorkoutExercise, WorkoutSet } from "@/types";

export type WorkoutListItem = Workout & {
  exerciseCount: number;
  setCount: number;
};

type WorkoutHistoryRow = Workout & {
  workout_exercises: { id: string; workout_sets: { id: string }[] }[];
};

export async function listWorkouts(): Promise<WorkoutListItem[]> {
  const { data, error } = await supabaseAdmin
    .from("workouts")
    .select("*, workout_exercises(id, workout_sets(id))")
    .order("workout_date", { ascending: false })
    .order("started_at", { ascending: false });

  if (error) {
    throw new Error(`Workouts konnten nicht geladen werden: ${error.message}`);
  }

  return ((data ?? []) as WorkoutHistoryRow[]).map(({ workout_exercises, ...workout }) => ({
    ...workout,
    exerciseCount: workout_exercises.length,
    setCount: workout_exercises.reduce((sum, ex) => sum + ex.workout_sets.length, 0),
  }));
}

export type WorkoutExerciseDetail = WorkoutExercise & { sets: WorkoutSet[] };
export type WorkoutDetail = Workout & { exercises: WorkoutExerciseDetail[] };

type WorkoutExerciseRow = WorkoutExercise & { workout_sets: WorkoutSet[] };

export async function getWorkoutDetail(workoutId: string): Promise<WorkoutDetail | null> {
  const { data: workout, error: workoutError } = await supabaseAdmin
    .from("workouts")
    .select("*")
    .eq("id", workoutId)
    .maybeSingle();

  if (workoutError) {
    throw new Error(`Workout konnte nicht geladen werden: ${workoutError.message}`);
  }
  if (!workout) return null;

  const { data: exercises, error: exercisesError } = await supabaseAdmin
    .from("workout_exercises")
    .select("*, workout_sets(*)")
    .eq("workout_id", workoutId)
    .order("order_index", { ascending: true })
    .order("set_number", { ascending: true, referencedTable: "workout_sets" });

  if (exercisesError) {
    throw new Error(`Übungen konnten nicht geladen werden: ${exercisesError.message}`);
  }

  return {
    ...workout,
    exercises: ((exercises ?? []) as WorkoutExerciseRow[]).map(({ workout_sets, ...exercise }) => ({
      ...exercise,
      sets: workout_sets,
    })),
  };
}

export async function createWorkout(workoutDate: string): Promise<Workout> {
  const now = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from("workouts")
    .insert({
      workout_date: workoutDate,
      // Dieses Modul kennt keinen Start/Stop-Sessionstatus – ein Workout gilt mit der
      // Erfassung sofort als abgeschlossen. Ohne finished_at würde der Unique-Index
      // "nur ein offenes Workout gleichzeitig" (idx_workouts_single_active) ab dem
      // zweiten Eintrag jede weitere Erstellung blockieren.
      started_at: now,
      finished_at: now,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Workout konnte nicht erstellt werden: ${error.message}`);
  }
  return data;
}

export async function addExercise(
  workoutId: string,
  exerciseName: string,
): Promise<WorkoutExercise> {
  const { data: last } = await supabaseAdmin
    .from("workout_exercises")
    .select("order_index")
    .eq("workout_id", workoutId)
    .order("order_index", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data, error } = await supabaseAdmin
    .from("workout_exercises")
    .insert({
      workout_id: workoutId,
      exercise_name: exerciseName,
      order_index: (last?.order_index ?? -1) + 1,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Übung konnte nicht hinzugefügt werden: ${error.message}`);
  }
  return data;
}

export async function deleteExercise(exerciseId: string): Promise<void> {
  const { error } = await supabaseAdmin.from("workout_exercises").delete().eq("id", exerciseId);
  if (error) {
    throw new Error(`Übung konnte nicht gelöscht werden: ${error.message}`);
  }
}

export async function addSet(
  exerciseId: string,
  reps: number,
  weightKg: number,
): Promise<WorkoutSet> {
  const { data: last } = await supabaseAdmin
    .from("workout_sets")
    .select("set_number")
    .eq("workout_exercise_id", exerciseId)
    .order("set_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data, error } = await supabaseAdmin
    .from("workout_sets")
    .insert({
      workout_exercise_id: exerciseId,
      set_number: (last?.set_number ?? 0) + 1,
      reps,
      weight_kg: weightKg,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Satz konnte nicht hinzugefügt werden: ${error.message}`);
  }
  return data;
}

export async function deleteSet(setId: string): Promise<void> {
  const { error } = await supabaseAdmin.from("workout_sets").delete().eq("id", setId);
  if (error) {
    throw new Error(`Satz konnte nicht gelöscht werden: ${error.message}`);
  }
}
