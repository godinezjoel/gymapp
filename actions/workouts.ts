"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as db from "@/lib/db/workouts";
import { getActiveWorkoutPlan } from "@/lib/db/workoutPlans";
import { templateDayFor } from "@/lib/utils/cycle";
import { z } from "zod";
import {
  addExerciseSchema,
  createWorkoutSchema,
  editWorkoutSetsSchema,
  setValuesSchema,
  todayRecordSchema,
  type AddExerciseInput,
  type CreateWorkoutInput,
  type EditWorkoutSetsInput,
  type SetValuesInput,
  type TodayRecordInput,
} from "@/lib/validation/workouts";

const workoutIdSchema = z.string().uuid("Invalid workout ID");

// Die Formulare validieren bereits clientseitig mit demselben Zod-Schema (RHF +
// zodResolver, ADR-08). Das erneute `.parse()` hier ist eine Verteidigungslinie
// für den Fall, dass eine Action direkt (unter Umgehung der UI) aufgerufen wird.

/**
 * Workout für ein Datum starten – vorbefüllt aus der Vorlage des Plantages.
 *
 * Der Plan wird hier aufgelöst und nicht in der Datenbankfunktion, damit die
 * Rotationsrechnung (cycle.ts) die einzige Quelle bleibt, die weiß, welcher Tag
 * an welchem Datum ansteht.
 */
export async function createWorkoutAction(input: CreateWorkoutInput): Promise<void> {
  const { workoutDate } = createWorkoutSchema.parse(input);

  const plan = await getActiveWorkoutPlan();
  const templateDay = templateDayFor(plan, workoutDate);

  const workoutId = await db.createWorkoutFromPlanDay(
    workoutDate,
    plan?.id ?? null,
    templateDay?.id ?? null,
  );

  revalidatePath("/workouts");
  redirect(`/workouts/${workoutId}`);
}

export async function addExerciseAction(workoutId: string, input: AddExerciseInput): Promise<void> {
  const { exerciseId } = addExerciseSchema.parse(input);
  await db.addExercise(workoutId, exerciseId);
  revalidatePath(`/workouts/${workoutId}`);
}

export async function deleteExerciseAction(workoutId: string, exerciseId: string): Promise<void> {
  await db.deleteExercise(exerciseId);
  revalidatePath(`/workouts/${workoutId}`);
}

export async function addSetAction(
  workoutId: string,
  exerciseId: string,
  input: SetValuesInput,
): Promise<void> {
  const { reps, weightKg } = setValuesSchema.parse(input);
  await db.addSet(exerciseId, reps, weightKg, false);
  revalidatePath(`/workouts/${workoutId}`);
}

// Betrifft nur dieses Protokoll. Sätze, die aus einer Vorlage kopiert wurden,
// haben keine Verbindung mehr zu ihr – die Vorlage bleibt unverändert.
export async function updateSetAction(
  workoutId: string,
  setId: string,
  input: SetValuesInput,
): Promise<void> {
  const { reps, weightKg } = setValuesSchema.parse(input);
  await db.updateSet(setId, reps, weightKg);
  revalidatePath(`/workouts/${workoutId}`);
}

export async function deleteSetAction(workoutId: string, setId: string): Promise<void> {
  await db.deleteSet(setId);
  revalidatePath(`/workouts/${workoutId}`);
}

export async function setCompletedAction(
  workoutId: string,
  setId: string,
  isCompleted: boolean,
): Promise<void> {
  await db.setCompleted(setId, isCompleted);
  revalidatePath(`/workouts/${workoutId}`);
}

// Für das Bearbeiten-Sheet: alle Sätze der Einheit auf einmal überschreiben,
// bestätigt mit einem Speichern-Knopf statt Feld für Feld beim Verlassen.
export async function editWorkoutSetsAction(
  workoutId: string,
  input: EditWorkoutSetsInput,
): Promise<void> {
  const sets = editWorkoutSetsSchema.parse(input);
  await db.updateWorkoutSets(sets);
  revalidatePath(`/workouts/${workoutId}`);
}

// Rekordfeld auf der vereinfachten Startseite: schreibt direkt, ohne den
// Umweg über ein eigenes Workout-Formular – siehe upsertTodayExerciseRecord.
export async function updateTodayRecordAction(input: TodayRecordInput): Promise<void> {
  const { exerciseId, workoutDate, reps, weightKg } = todayRecordSchema.parse(input);
  await db.upsertTodayExerciseRecord(workoutDate, exerciseId, reps, weightKg);
  revalidatePath("/");
}

export async function deleteWorkoutAction(workoutId: string): Promise<void> {
  await db.deleteWorkout(workoutIdSchema.parse(workoutId));
  revalidatePath("/workouts");
}
