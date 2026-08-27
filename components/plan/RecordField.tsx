"use client";

import { useRef, useState, useTransition } from "react";
import { updateTodayRecordAction } from "@/actions/workouts";
import { setValuesSchema } from "@/lib/validation/workouts";
import { cn } from "@/lib/utils/cn";

/**
 * Der Rekord einer Übung, direkt in der Zeile bearbeitbar – kein Formular,
 * kein Sheet. Wie ein Notizen-Feld: antippen, Wert ändern, verlassen,
 * gespeichert. Speichert nur bei tatsächlicher Änderung, damit ein bloßes
 * Antippen ohne Tippen keinen unnötigen Request auslöst.
 */
export function RecordField({
  exerciseId,
  workoutDate,
  weightKg,
  reps,
}: {
  exerciseId: string;
  workoutDate: string;
  weightKg: number | null;
  reps: number | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const weightRef = useRef<HTMLInputElement>(null);
  const repsRef = useRef<HTMLInputElement>(null);

  function handleBlur() {
    const candidate = {
      weightKg: Number(weightRef.current?.value),
      reps: Number(repsRef.current?.value),
    };

    // Unverändert -> nichts zu speichern.
    if (candidate.weightKg === (weightKg ?? 0) && candidate.reps === (reps ?? 0)) return;

    const parsed = setValuesSchema.safeParse(candidate);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid value.");
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        await updateTodayRecordAction({ exerciseId, workoutDate, ...parsed.data });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not be saved.");
      }
    });
  }

  return (
    <span className={cn("flex items-center gap-1 tabular-nums", isPending && "opacity-50")}>
      <input
        ref={weightRef}
        type="number"
        inputMode="decimal"
        step="0.5"
        defaultValue={weightKg ?? ""}
        placeholder="–"
        onFocus={(event) => event.target.select()}
        onBlur={handleBlur}
        aria-label="Weight (kg)"
        className="w-12 rounded-md border-none bg-transparent p-0 text-right text-base focus:bg-neutral-100 focus:outline-none"
      />
      <span className="text-neutral-400">kg ×</span>
      <input
        ref={repsRef}
        type="number"
        inputMode="numeric"
        defaultValue={reps ?? ""}
        placeholder="–"
        onFocus={(event) => event.target.select()}
        onBlur={handleBlur}
        aria-label="Reps"
        className="w-9 rounded-md border-none bg-transparent p-0 text-base focus:bg-neutral-100 focus:outline-none"
      />
      {error && <span className="sr-only" role="alert">{error}</span>}
    </span>
  );
}
