"use server";

import { revalidatePath } from "next/cache";
import * as db from "@/lib/db/measurements";
import { measurementSchema, type MeasurementInput } from "@/lib/validation/measurements";

export async function saveMeasurementAction(input: MeasurementInput): Promise<void> {
  const parsed = measurementSchema.parse(input);
  await db.saveMeasurement(parsed);
  revalidatePath("/analytics");
}
