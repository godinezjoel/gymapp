"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import * as db from "@/lib/db/workoutPlans";
import { workoutPlanSchema, type WorkoutPlanInput } from "@/lib/validation/workoutPlan";

// Wie in den übrigen Actions: das Formular validiert bereits clientseitig mit
// demselben Zod-Schema (ADR-08), das erneute .parse() hier schützt den Fall,
// dass die Action unter Umgehung der UI aufgerufen wird.

const planIdSchema = z.string().uuid("Ungültige Plan-ID");

// Der aktive Plan bestimmt den heutigen Tag auf dem Dashboard und die Vorlage
// beim Start eines Workouts. Jede Änderung an Plänen muss daher beide Seiten
// invalidieren, sonst steht dort der Stand von vorher.
function revalidatePlanViews(): void {
  revalidatePath("/workouts");
  revalidatePath("/");
}

export async function saveWorkoutPlanAction(input: WorkoutPlanInput): Promise<void> {
  const parsed = workoutPlanSchema.parse(input);
  await db.saveWorkoutPlan(parsed);

  revalidatePlanViews();
}

export async function setActiveWorkoutPlanAction(planId: string): Promise<void> {
  await db.setActiveWorkoutPlan(planIdSchema.parse(planId));

  revalidatePlanViews();
}

export async function deleteWorkoutPlanAction(planId: string): Promise<void> {
  await db.deleteWorkoutPlan(planIdSchema.parse(planId));

  revalidatePlanViews();
}
