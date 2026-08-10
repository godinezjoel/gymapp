import { z } from "zod";

export const genderSchema = z.enum(["male", "female"]);
export type Gender = z.infer<typeof genderSchema>;

export const measurementSchema = z
  .object({
    loggedDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Bitte ein gültiges Datum wählen")
      .refine((val) => !Number.isNaN(new Date(`${val}T00:00:00`).getTime()), {
        message: "Ungültiges Datum",
      }),
    gender: genderSchema,
    heightCm: z
      .number({ error: "Größe erforderlich" })
      .gt(0, "Größe erforderlich")
      .lt(300, "Maximal 299 cm"),
    neckCm: z
      .number({ error: "Halsumfang erforderlich" })
      .gt(0, "Halsumfang erforderlich")
      .lt(100, "Maximal 99 cm"),
    waistCm: z
      .number({ error: "Taillenumfang erforderlich" })
      .gt(0, "Taillenumfang erforderlich")
      .lt(300, "Maximal 299 cm"),
    hipCm: z
      .number({ error: "Hüftumfang erforderlich" })
      .gt(0, "Hüftumfang erforderlich")
      .lt(300, "Maximal 299 cm")
      .optional(),
  })
  .refine((data) => data.gender !== "female" || data.hipCm !== undefined, {
    message: "Hüftumfang ist für Frauen erforderlich",
    path: ["hipCm"],
  })
  .refine(
    (data) => {
      const reference =
        data.gender === "male"
          ? data.waistCm - data.neckCm
          : data.waistCm + (data.hipCm ?? 0) - data.neckCm;
      return reference > 0;
    },
    {
      message: "Taille (+ Hüfte bei Frauen) muss größer als der Halsumfang sein",
      path: ["neckCm"],
    },
  );

export type MeasurementInput = z.infer<typeof measurementSchema>;
