import "server-only";
import { dbError } from "@/lib/db/error";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { WorkoutPlan } from "@/lib/utils/cycle";
import type { WorkoutPlanInput } from "@/lib/validation/workoutPlan";

// Ein Request, zwei Joins: Tage und deren Übungen werden eingebettet statt
// nachgeladen. Die Reihenfolge kommt aus der Datenbank (cycle_index /
// order_index), damit sie nicht an zwei Stellen definiert ist.
//
// Bewusst ein einziges String-Literal statt umbrochener Konkatenation:
// supabase-js leitet den Ergebnistyp aus dem Literal ab, und "a" + "b" hat in
// TypeScript den Typ string – die Zeilen kämen dann als GenericStringError
// zurück statt als Datensatz.
// prettier-ignore
const PLAN_SELECT = "id, name, start_date, is_active, workout_plan_days(id, cycle_index, label, is_rest, workout_plan_day_exercises(id, order_index, exercise_id, exercises(name), default_reps, default_weight_kg))";

type PlanRow = {
  id: string;
  name: string;
  start_date: string;
  is_active: boolean;
  workout_plan_days: {
    id: string;
    cycle_index: number;
    label: string;
    is_rest: boolean;
    workout_plan_day_exercises: {
      id: string;
      order_index: number;
      exercise_id: string;
      exercises: { name: string } | null;
      default_reps: number | null;
      default_weight_kg: number | null;
    }[];
  }[];
};

function toWorkoutPlan(row: PlanRow): WorkoutPlan {
  return {
    id: row.id,
    name: row.name,
    startDate: row.start_date,
    isActive: row.is_active,
    days: row.workout_plan_days.map((day) => ({
      id: day.id,
      cycleIndex: day.cycle_index,
      label: day.label,
      isRest: day.is_rest,
      exercises: day.workout_plan_day_exercises.map((exercise) => ({
        id: exercise.id,
        exerciseId: exercise.exercise_id,
        // exercises kann nur fehlen, wenn eine Übung aus dem Katalog entfernt
        // würde – das gibt es (noch) nicht, exercise_id ist not null mit FK.
        exerciseName: exercise.exercises?.name ?? "",
        defaultReps: exercise.default_reps,
        defaultWeightKg: exercise.default_weight_kg,
      })),
    })),
  };
}

// Die Sortierklauseln gehören zur Projektion, nicht zum Aufrufer – sonst kann
// eine Abfrage die Tage in Zufallsreihenfolge liefern und die Rotationsrechnung
// greift auf den falschen Tag.
function selectPlans() {
  return supabaseAdmin
    .from("workout_plans")
    .select(PLAN_SELECT)
    .order("created_at", { ascending: true })
    .order("cycle_index", { ascending: true, referencedTable: "workout_plan_days" })
    .order("order_index", {
      ascending: true,
      referencedTable: "workout_plan_days.workout_plan_day_exercises",
    });
}

/**
 * Alle Pläne samt Tagen und Übungen.
 *
 * Bewusst vollständig statt nur der Kopfdaten: die Planseite öffnet den Editor
 * als Bottom Sheet, und ein Sheet, das erst nach dem Aufklappen nachlädt,
 * fühlt sich auf dem Handy sofort langsam an. Ein Plan sind wenige Kilobyte.
 */
export async function listWorkoutPlans(): Promise<WorkoutPlan[]> {
  const { data, error } = await selectPlans();

  if (error) {
    throw dbError("Training plans could not be loaded", error);
  }
  return ((data ?? []) as PlanRow[]).map(toWorkoutPlan);
}

/** Der aktive Plan – Datenquelle für "welcher Tag ist heute". */
export async function getActiveWorkoutPlan(): Promise<WorkoutPlan | null> {
  const { data, error } = await selectPlans().eq("is_active", true).maybeSingle();

  if (error) {
    throw dbError("Active training plan could not be loaded", error);
  }
  return data ? toWorkoutPlan(data as PlanRow) : null;
}

/**
 * Plan anlegen oder komplett ersetzen; gibt die ID zurück.
 *
 * Über die RPC save_workout_plan, weil delete + insert von Tagen und Übungen in
 * einer Transaktion laufen müssen: als getrennte PostgREST-Requests stünde der
 * Plan nach einem fehlgeschlagenen Insert ohne Tage da. Nebeneffekt: ein
 * Roundtrip statt vieler.
 */
export async function saveWorkoutPlan(input: WorkoutPlanInput): Promise<string> {
  const days = input.days.map((day) => ({
    label: day.label,
    is_rest: day.isRest,
    exercises: day.exercises.map((exercise) => ({
      exercise_id: exercise.exerciseId,
      default_reps: exercise.defaultReps,
      default_weight_kg: exercise.defaultWeightKg,
    })),
  }));

  const { data, error } = await supabaseAdmin.rpc("save_workout_plan", {
    p_name: input.name,
    p_start_date: input.startDate,
    p_days: days,
    // Weggelassen heißt "neuer Plan" – der SQL-Parameter hat DEFAULT null.
    ...(input.id ? { p_plan_id: input.id } : {}),
  });

  if (error) {
    throw dbError("Training plan could not be saved", error);
  }
  return data;
}

export async function setActiveWorkoutPlan(planId: string): Promise<void> {
  const { error } = await supabaseAdmin.rpc("set_active_workout_plan", { p_plan_id: planId });

  if (error) {
    throw dbError("Training plan could not be activated", error);
  }
}

export async function deleteWorkoutPlan(planId: string): Promise<void> {
  const { error } = await supabaseAdmin.rpc("delete_workout_plan", { p_plan_id: planId });

  if (error) {
    throw dbError("Training plan could not be deleted", error);
  }
}
