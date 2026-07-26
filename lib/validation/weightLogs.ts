import { z } from "zod";

export const saveWeightLogSchema = z.object({
  loggedDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Bitte ein gültiges Datum wählen")
    .refine((val) => !Number.isNaN(new Date(`${val}T00:00:00`).getTime()), {
      message: "Ungültiges Datum",
    }),
  weightKg: z
    .number({ invalid_type_error: "Gewicht erforderlich" })
    .gt(0, "Gewicht erforderlich")
    .lt(400, "Maximal 399,9 kg"),
});
export type SaveWeightLogInput = z.infer<typeof saveWeightLogSchema>;
