"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { editWorkoutSetsSchema } from "@/lib/validation/workouts";
import { editWorkoutSetsAction } from "@/actions/workouts";
import type { WorkoutDetail } from "@/lib/db/workouts";
import { cn } from "@/lib/utils/cn";

const FIELD_CLASS =
  "min-h-11 w-full rounded-lg border border-neutral-200 bg-white text-center text-base tabular-nums";

const formSchema = z.object({ sets: editWorkoutSetsSchema });
type FormValues = z.infer<typeof formSchema>;

function toFormValues(workout: WorkoutDetail): FormValues {
  return {
    sets: workout.exercises.flatMap((exercise) =>
      exercise.sets.map((set) => ({
        id: set.id,
        reps: set.reps ?? 0,
        weightKg: set.weight_kg ?? 0,
      })),
    ),
  };
}

/**
 * Alle Sätze einer Einheit auf einmal, vorbefüllt mit den gespeicherten
 * Werten – anders als SetRow (Speichern beim Verlassen des Feldes, gedacht
 * fürs Training selbst) sammelt dieses Formular Änderungen und überschreibt
 * sie erst mit dem Speichern-Knopf, für die nachträgliche Korrektur einer
 * bereits abgeschlossenen Einheit.
 */
export function EditWorkoutSheet({
  workout,
  onSaved,
}: {
  workout: WorkoutDetail;
  onSaved: () => void;
}) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: toFormValues(workout),
  });

  async function onSubmit(values: FormValues) {
    setSubmitError(null);
    try {
      await editWorkoutSetsAction(workout.id, values.sets);
      onSaved();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Changes could not be saved.",
      );
    }
  }

  const hasSets = workout.exercises.some((exercise) => exercise.sets.length > 0);
  if (!hasSets) {
    return <p className="text-sm text-neutral-500">No sets logged yet.</p>;
  }

  let fieldIndex = -1;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 pb-2">
      {workout.exercises.map((exercise) => {
        if (exercise.sets.length === 0) return null;

        return (
          <div key={exercise.id} className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-neutral-700">{exercise.exercise_name}</h3>
            <ul className="flex flex-col gap-2">
              {exercise.sets.map((set, index) => {
                fieldIndex += 1;
                const i = fieldIndex;
                return (
                  <li
                    key={set.id}
                    className="grid grid-cols-[1.25rem_minmax(0,1fr)_minmax(0,1fr)] items-center gap-2"
                  >
                    <span className="text-center text-sm tabular-nums text-neutral-400">
                      {index + 1}
                    </span>
                    <input type="hidden" {...register(`sets.${i}.id`)} />
                    <input
                      type="number"
                      inputMode="numeric"
                      aria-label={`Reps for ${exercise.exercise_name}, set ${index + 1}`}
                      className={FIELD_CLASS}
                      onFocus={(event) => event.target.select()}
                      {...register(`sets.${i}.reps`, { valueAsNumber: true })}
                    />
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.5"
                      aria-label={`Weight for ${exercise.exercise_name}, set ${index + 1}`}
                      className={FIELD_CLASS}
                      onFocus={(event) => event.target.select()}
                      {...register(`sets.${i}.weightKg`, { valueAsNumber: true })}
                    />
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}

      {errors.sets && (
        <p className="text-sm text-red-600">Please check the highlighted values.</p>
      )}
      {submitError && <p className="text-sm text-red-600">{submitError}</p>}

      {/* Klebt am unteren Rand des Sheets, wie im Plan-Editor: bei vielen
          Sätzen liegt der Speichern-Knopf sonst außerhalb der Daumenreichweite. */}
      <div className="sticky bottom-0 -mx-1 bg-gradient-to-t from-white via-white to-transparent px-1 pb-1 pt-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "min-h-12 w-full rounded-xl bg-neutral-900 text-base font-medium text-white transition-colors hover:bg-neutral-700 active:scale-[0.98]",
            isSubmitting && "opacity-60",
          )}
        >
          {isSubmitting ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
