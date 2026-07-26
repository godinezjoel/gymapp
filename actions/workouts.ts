"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as db from "@/lib/db/workouts";
import {
  addExerciseSchema,
  addSetSchema,
  createWorkoutSchema,
  type AddExerciseInput,
  type AddSetInput,
  type CreateWorkoutInput,
} from "@/lib/validation/workouts";

// Die Formulare validieren bereits clientseitig mit demselben Zod-Schema (RHF +
// zodResolver, ADR-08). Das erneute `.parse()` hier ist eine Verteidigungslinie
// für den Fall, dass eine Action direkt (unter Umgehung der UI) aufgerufen wird.

export async function createWorkoutAction(input: CreateWorkoutInput): Promise<void> {
  const { workoutDate } = createWorkoutSchema.parse(input);
  const workout = await db.createWorkout(workoutDate);
  revalidatePath("/workouts");
  redirect(`/workouts/${workout.id}`);
}

export async function addExerciseAction(workoutId: string, input: AddExerciseInput): Promise<void> {
  const { exerciseName } = addExerciseSchema.parse(input);
  await db.addExercise(workoutId, exerciseName);
  revalidatePath(`/workouts/${workoutId}`);
}

export async function deleteExerciseAction(workoutId: string, exerciseId: string): Promise<void> {
  await db.deleteExercise(exerciseId);
  revalidatePath(`/workouts/${workoutId}`);
}

export async function addSetAction(
  workoutId: string,
  exerciseId: string,
  input: AddSetInput,
): Promise<void> {
  const { reps, weightKg } = addSetSchema.parse(input);
  await db.addSet(exerciseId, reps, weightKg);
  revalidatePath(`/workouts/${workoutId}`);
}

export async function deleteSetAction(workoutId: string, setId: string): Promise<void> {
  await db.deleteSet(setId);
  revalidatePath(`/workouts/${workoutId}`);
}
