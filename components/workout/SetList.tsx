"use client";

import { useState, useTransition } from "react";
import { Hash, Plus, Repeat, Weight } from "lucide-react";
import { estimateOneRepMax } from "@/lib/utils/oneRepMax";
import { addSetAction } from "@/actions/workouts";
import { SetRow, SET_GRID_CLASS } from "@/components/workout/SetRow";
import type { WorkoutSetDetail } from "@/lib/db/workouts";
import { cn } from "@/lib/utils/cn";

/**
 * Einzige Stelle, die eine Satzliste rendert: Kopfzeile und Sätze (SetRow) im
 * selben <ul> mit demselben Raster (SET_GRID_CLASS).
 *
 * "Weiteren Satz" legt den Satz direkt mit Vorbelegung (letzter Rekord) an,
 * statt erst ein leeres Formular zu öffnen – ein Tap statt tippen + Haken.
 * Der neue Satz landet unmarkiert in der Liste; Wdh./kg lassen sich wie bei
 * jedem anderen Satz direkt im Feld korrigieren, abgehakt wird er über den
 * Haken in SetRow, sobald er tatsächlich absolviert ist.
 */
export function SetList({
  workoutId,
  exerciseId,
  sets,
  initialReps = 8,
  initialWeightKg = 0,
  recordOneRepMax,
}: {
  workoutId: string;
  exerciseId: string;
  sets: WorkoutSetDetail[];
  initialReps?: number;
  initialWeightKg?: number;
  recordOneRepMax: number | null;
}) {
  const hasSets = sets.length > 0;
  const [isPending, startTransition] = useTransition();
  const [beatRecord, setBeatRecord] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleAddSet() {
    setError(null);
    startTransition(async () => {
      try {
        await addSetAction(workoutId, exerciseId, { reps: initialReps, weightKg: initialWeightKg });
        const oneRepMax = estimateOneRepMax(initialWeightKg, initialReps);
        if (recordOneRepMax === null || oneRepMax > recordOneRepMax) {
          setBeatRecord(true);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Satz konnte nicht hinzugefügt werden.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      {beatRecord && (
        <span className="self-start rounded-full bg-neutral-900 px-2.5 py-1 text-xs font-medium text-white">
          Neuer Rekord
        </span>
      )}

      {hasSets && (
        <>
          {/* Einheiten einmal als Spaltenüberschrift statt hinter jedem Feld. */}
          <div className={cn(SET_GRID_CLASS, "px-2 pb-2")}>
            <span className="flex items-center justify-center text-neutral-300">
              <Hash size={13} strokeWidth={2.25} aria-hidden />
            </span>
            <span className="flex items-center justify-center gap-1 rounded-full bg-neutral-100 py-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
              <Weight size={12} strokeWidth={2.25} aria-hidden />
              kg
            </span>
            <span className="flex items-center justify-center gap-1 rounded-full bg-neutral-100 py-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
              <Repeat size={12} strokeWidth={2.25} aria-hidden />
              Wdh.
            </span>
            <span />
            <span />
          </div>

          <ul className="flex flex-col">
            {sets.map((set, index) => (
              <SetRow
                key={set.id}
                workoutId={workoutId}
                setId={set.id}
                position={index + 1}
                reps={set.reps}
                weightKg={set.weight_kg}
                isCompleted={set.is_completed}
              />
            ))}
          </ul>
        </>
      )}

      <button
        type="button"
        onClick={handleAddSet}
        disabled={isPending}
        className="flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-dashed border-neutral-300 text-sm font-medium text-neutral-600 transition-colors hover:border-neutral-400 hover:bg-neutral-50 active:bg-neutral-50 disabled:opacity-60"
      >
        <Plus size={16} aria-hidden />
        {isPending ? "Wird hinzugefügt…" : "Weiteren Satz"}
      </button>

      {error && <p className="pl-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
