"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { WorkoutExerciseDetail } from "@/lib/db/workouts";
import { deleteExerciseAction, deleteSetAction } from "@/actions/workouts";
import { AddSetForm } from "@/components/workout/AddSetForm";
import { cn } from "@/lib/utils/cn";

export function ExerciseCard({
  workoutId,
  exercise,
}: {
  workoutId: string;
  exercise: WorkoutExerciseDetail;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDeleteExercise() {
    if (!window.confirm(`"${exercise.exercise_name}" inklusive aller Sätze entfernen?`)) return;
    setError(null);
    startTransition(async () => {
      try {
        await deleteExerciseAction(workoutId, exercise.id);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Übung konnte nicht gelöscht werden.");
      }
    });
  }

  function handleDeleteSet(setId: string, index: number) {
    if (!window.confirm(`Satz ${index + 1} löschen?`)) return;
    setError(null);
    startTransition(async () => {
      try {
        await deleteSetAction(workoutId, setId);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Satz konnte nicht gelöscht werden.");
      }
    });
  }

  return (
    <div className={cn("rounded-xl border border-neutral-200 p-4", isPending && "opacity-60")}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-medium">{exercise.exercise_name}</h2>
        <button
          type="button"
          onClick={handleDeleteExercise}
          disabled={isPending}
          className="min-h-11 shrink-0 px-2 text-sm text-red-600 active:scale-95"
          aria-label={`${exercise.exercise_name} entfernen`}
        >
          Entfernen
        </button>
      </div>

      {exercise.sets.length > 0 && (
        <ul className="mt-3 flex flex-col gap-2">
          {exercise.sets.map((set, index) => (
            <li
              key={set.id}
              className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2 text-sm"
            >
              <span className="w-6 text-neutral-400">{index + 1}</span>
              <span className="flex-1 tabular-nums">
                {set.reps} Wdh. × {set.weight_kg ?? 0} kg
              </span>
              <button
                type="button"
                onClick={() => handleDeleteSet(set.id, index)}
                disabled={isPending}
                aria-label={`Satz ${index + 1} löschen`}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg text-red-600 active:bg-red-50"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <div className="mt-3">
        <AddSetForm workoutId={workoutId} exerciseId={exercise.id} />
      </div>
    </div>
  );
}
