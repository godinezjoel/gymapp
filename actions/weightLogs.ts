"use server";

import { revalidatePath } from "next/cache";
import * as db from "@/lib/db/weightLogs";
import { saveWeightLogSchema, type SaveWeightLogInput } from "@/lib/validation/weightLogs";

export async function saveWeightLogAction(input: SaveWeightLogInput): Promise<void> {
  const { loggedDate, weightKg } = saveWeightLogSchema.parse(input);
  await db.saveWeightLog(loggedDate, weightKg);
  revalidatePath("/analytics");
}
