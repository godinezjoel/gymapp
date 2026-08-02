"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { setValuesSchema, type SetValuesInput } from "@/lib/validation/workouts";
import { addSetAction } from "@/actions/workouts";
import { NumberStepper } from "@/components/workout/NumberStepper";
import { cn } from "@/lib/utils/cn";

export function AddSetForm({ workoutId, exerciseId }: { workoutId: string; exerciseId: string }) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SetValuesInput>({
    resolver: zodResolver(setValuesSchema),
    defaultValues: { reps: 8, weightKg: 0 },
  });

  async function onSubmit(values: SetValuesInput) {
    setSubmitError(null);
    try {
      // Kein router.refresh(): addSetAction ruft revalidatePath auf, Next
      // liefert die neue RSC-Payload bereits mit der Action-Antwort aus. Ein
      // zusätzlicher refresh() wäre ein zweiter Server-Render derselben Seite.
      await addSetAction(workoutId, exerciseId, values);
      reset(values);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Satz konnte nicht hinzugefügt werden.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
      <div className="flex gap-3">
        <Controller
          control={control}
          name="reps"
          render={({ field }) => (
            <NumberStepper
              label="Wdh."
              value={field.value}
              onChange={field.onChange}
              step={1}
              min={0}
              max={200}
            />
          )}
        />
        <Controller
          control={control}
          name="weightKg"
          render={({ field }) => (
            <NumberStepper
              label="kg"
              value={field.value}
              onChange={field.onChange}
              step={2.5}
              min={0}
              max={500}
            />
          )}
        />
      </div>

      {(errors.reps ?? errors.weightKg) && (
        <p className="text-sm text-red-600">{errors.reps?.message ?? errors.weightKg?.message}</p>
      )}
      {submitError && <p className="text-sm text-red-600">{submitError}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className={cn(
          "min-h-11 rounded-lg bg-neutral-900 py-3 text-base font-medium text-white transition-colors hover:bg-neutral-700 active:scale-[0.98]",
          isSubmitting && "opacity-60",
        )}
      >
        + Satz
      </button>
    </form>
  );
}
