"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { addExerciseAction } from "@/actions/workouts";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { ExerciseSelectorSheet } from "@/components/exercise/ExerciseSelectorSheet";
import type { ExerciseCatalogEntry } from "@/lib/db/exercises";
import { cn } from "@/lib/utils/cn";

export function AddExerciseForm({ workoutId }: { workoutId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function onSelect(exercise: ExerciseCatalogEntry) {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      // Kein router.refresh(): revalidatePath in der Action liefert die neue
      // RSC-Payload bereits mit der Action-Antwort mit.
      await addExerciseAction(workoutId, { exerciseId: exercise.id });
      setIsOpen(false);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Übung konnte nicht hinzugefügt werden.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-dashed border-neutral-300 p-4">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        disabled={isSubmitting}
        className={cn(
          "flex min-h-11 items-center justify-center gap-1.5 rounded-lg bg-neutral-100 py-3 text-base font-medium text-neutral-900 transition-colors hover:bg-neutral-200 active:scale-[0.98]",
          isSubmitting && "opacity-60",
        )}
      >
        <Plus size={18} strokeWidth={2} aria-hidden />
        Übung hinzufügen
      </button>

      {submitError && <p className="text-sm text-red-600">{submitError}</p>}

      <BottomSheet open={isOpen} onClose={() => setIsOpen(false)} title="Übung auswählen">
        <ExerciseSelectorSheet onSelect={onSelect} />
      </BottomSheet>
    </div>
  );
}
