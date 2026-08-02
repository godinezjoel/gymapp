"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addExerciseSchema, type AddExerciseInput } from "@/lib/validation/workouts";
import { addExerciseAction } from "@/actions/workouts";
import { cn } from "@/lib/utils/cn";

export function AddExerciseForm({ workoutId }: { workoutId: string }) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddExerciseInput>({
    resolver: zodResolver(addExerciseSchema),
    defaultValues: { exerciseName: "" },
  });

  async function onSubmit(values: AddExerciseInput) {
    setSubmitError(null);
    try {
      // Kein router.refresh(): revalidatePath in der Action liefert die neue
      // RSC-Payload bereits mit der Action-Antwort mit.
      await addExerciseAction(workoutId, values);
      reset({ exerciseName: "" });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Übung konnte nicht hinzugefügt werden.");
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-2 rounded-xl border border-dashed border-neutral-300 p-4"
    >
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-neutral-700">Übung hinzufügen</span>
        <input
          type="text"
          placeholder="z. B. Bankdrücken"
          {...register("exerciseName")}
          className="min-h-11 rounded-lg border border-neutral-300 px-3 py-3 text-base"
        />
        {errors.exerciseName && (
          <span className="text-sm text-red-600">{errors.exerciseName.message}</span>
        )}
      </label>

      {submitError && <p className="text-sm text-red-600">{submitError}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className={cn(
          "min-h-11 rounded-lg bg-neutral-100 py-3 text-base font-medium text-neutral-900 transition-colors hover:bg-neutral-200 active:scale-[0.98]",
          isSubmitting && "opacity-60",
        )}
      >
        + Übung
      </button>
    </form>
  );
}
