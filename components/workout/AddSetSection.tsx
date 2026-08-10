"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { AddSetForm } from "@/components/workout/AddSetForm";
import { estimateOneRepMax } from "@/lib/utils/oneRepMax";
import type { SetValuesInput } from "@/lib/validation/workouts";

/**
 * Steuert, ob das Satz-Formular offen oder hinter einem Link versteckt ist.
 *
 * Standardmäßig nur ein Eingabefeld: ist noch kein Satz erfasst, steht das
 * Formular sofort offen (der Bestwert als Vorgabe). Ist bereits einer da,
 * bleibt es hinter "+ weiteren Satz hinzufügen" verborgen und klappt nach dem
 * Speichern wieder zu – zusätzliche Sätze sind der Ausnahmefall, nicht der
 * Normalfall.
 */
export function AddSetSection({
  workoutId,
  exerciseId,
  hasSets,
  initialReps,
  initialWeightKg,
  recordOneRepMax,
}: {
  workoutId: string;
  exerciseId: string;
  hasSets: boolean;
  initialReps?: number;
  initialWeightKg?: number;
  recordOneRepMax: number | null;
}) {
  const [showForm, setShowForm] = useState(!hasSets);
  const [beatRecord, setBeatRecord] = useState(false);

  function handleSaved(values: SetValuesInput) {
    const oneRepMax = estimateOneRepMax(values.weightKg, values.reps);
    if (recordOneRepMax === null || oneRepMax > recordOneRepMax) {
      setBeatRecord(true);
    }
    setShowForm(false);
  }

  return (
    <div className="flex flex-col gap-2">
      {beatRecord && (
        <span className="self-start rounded-full bg-neutral-900 px-2.5 py-1 text-xs font-medium text-white">
          Neuer Rekord
        </span>
      )}

      {showForm ? (
        <AddSetForm
          workoutId={workoutId}
          exerciseId={exerciseId}
          initialReps={initialReps}
          initialWeightKg={initialWeightKg}
          onSaved={handleSaved}
        />
      ) : (
        <button
          type="button"
          onClick={() => {
            setShowForm(true);
            setBeatRecord(false);
          }}
          className="flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-dashed border-neutral-300 text-sm font-medium text-neutral-600 transition-colors hover:border-neutral-400 hover:bg-neutral-50 active:bg-neutral-50"
        >
          <Plus size={16} aria-hidden />
          Weiteren Satz
        </button>
      )}
    </div>
  );
}
