"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { formatKg } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

export type TodayExercisePreview = {
  id: string;
  exerciseName: string;
  record: { weightKg: number; reps: number } | null;
};

/**
 * Zugeklappte Übungsliste des heutigen Tages – der Punkt auf dem Dashboard ist
 * "was steht heute an", nicht die volle Übungsliste. Wer nachschauen will, was
 * beim letzten Mal lief, klappt auf statt zu scrollen.
 */
export function TodayExercisesDisclosure({
  exercises,
  variant = "dark",
}: {
  exercises: TodayExercisePreview[];
  variant?: "dark" | "light";
}) {
  const [isOpen, setIsOpen] = useState(false);

  if (exercises.length === 0) return null;

  const dark = variant === "dark";

  return (
    <div className={cn("mt-4 border-t pt-3", dark ? "border-white/10" : "border-neutral-200")}>
      <button
        type="button"
        onClick={() => setIsOpen((previous) => !previous)}
        aria-expanded={isOpen}
        className={cn(
          "flex min-h-11 w-full items-center justify-between gap-2 text-sm font-medium transition-colors",
          dark ? "text-neutral-300 hover:text-white" : "text-neutral-600 hover:text-neutral-900",
        )}
      >
        {exercises.length} {exercises.length === 1 ? "Übung" : "Übungen"}
        <ChevronDown
          size={18}
          aria-hidden
          className={cn("transition-transform motion-reduce:transition-none", isOpen && "rotate-180")}
        />
      </button>

      {isOpen && (
        <ul className="flex flex-col gap-2 pb-1 pt-2">
          {exercises.map((exercise) => (
            <li
              key={exercise.id}
              className={cn(
                "flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm",
                dark ? "bg-white/5" : "bg-neutral-50",
              )}
            >
              <span className="min-w-0 truncate font-medium">{exercise.exerciseName}</span>
              <span className={cn("shrink-0 tabular-nums", dark ? "text-neutral-400" : "text-neutral-500")}>
                {exercise.record
                  ? `zuletzt ${formatKg(exercise.record.weightKg)} kg × ${exercise.record.reps}`
                  : "noch kein Rekord"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
