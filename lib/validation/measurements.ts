import { z } from "zod";

export const genderSchema = z.enum(["male", "female"]);
export type Gender = z.infer<typeof genderSchema>;

export const measurementSchema = z
  .object({
    loggedDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Please choose a valid date")
      .refine((val) => !Number.isNaN(new Date(`${val}T00:00:00`).getTime()), {
        message: "Invalid date",
      }),
    gender: genderSchema,
    heightCm: z
      .number({ error: "Height required" })
      .gt(0, "Height required")
      .lt(300, "Max 299 cm"),
    neckCm: z
      .number({ error: "Neck circumference required" })
      .gt(0, "Neck circumference required")
      .lt(100, "Max 99 cm"),
    waistCm: z
      .number({ error: "Waist circumference required" })
      .gt(0, "Waist circumference required")
      .lt(300, "Max 299 cm"),
    hipCm: z
      .number({ error: "Hip circumference required" })
      .gt(0, "Hip circumference required")
      .lt(300, "Max 299 cm")
      .optional(),
  })
  .refine((data) => data.gender !== "female" || data.hipCm !== undefined, {
    message: "Hip circumference is required for women",
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
      message: "Waist (+ hip for women) must be greater than the neck circumference",
      path: ["neckCm"],
    },
  );

export type MeasurementInput = z.infer<typeof measurementSchema>;
