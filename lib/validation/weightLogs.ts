import { z } from "zod";

export const saveWeightLogSchema = z.object({
  loggedDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Please choose a valid date")
    .refine((val) => !Number.isNaN(new Date(`${val}T00:00:00`).getTime()), {
      message: "Invalid date",
    }),
  weightKg: z
    .number({ error: "Weight required" })
    .gt(0, "Weight required")
    .lt(400, "Max 399.9 kg"),
});
export type SaveWeightLogInput = z.infer<typeof saveWeightLogSchema>;
