"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { ExerciseCollapseContext } from "@/components/workout/ExerciseCollapseContext";
import { cn } from "@/lib/utils/cn";

/**
 * Rahmen um Rekord-Box und Satzliste einer Übung. Bestätigt man einen Satz
 * (Haken in SetRow), klappt der Bereich zu – die Sätze sind während des
 * Trainings nur so lange interessant, bis der aktuelle bestätigt ist, danach
 * lenken sie nur von der nächsten Übung ab. Zusätzlich lässt sich der Bereich
 * jederzeit manuell auf- und wieder zuklappen (nicht nur einmalig über das
 * Bestätigen), etwa um einen weiteren Satz anzuhängen und danach erneut aus
 * dem Weg zu räumen.
 */
export function ExerciseSetsPanel({
  children,
  isDone = false,
}: {
  children: React.ReactNode;
  isDone?: boolean;
}) {
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={() => setCollapsed(false)}
        className={cn(
          "mt-3 flex min-h-11 w-full items-center justify-center gap-1.5 rounded-lg border-t pt-3 text-sm font-medium transition-colors",
          isDone
            ? "border-emerald-100 text-emerald-700 hover:text-emerald-800"
            : "border-neutral-100 text-neutral-500 hover:text-neutral-900",
        )}
      >
        <ChevronDown size={16} aria-hidden />
        {isDone ? "Done · Show sets" : "Show sets"}
      </button>
    );
  }

  return (
    <ExerciseCollapseContext.Provider value={() => setCollapsed(true)}>
      {children}
      <button
        type="button"
        onClick={() => setCollapsed(true)}
        className="mt-2 flex min-h-11 w-full items-center justify-center gap-1.5 text-sm font-medium text-neutral-400 transition-colors hover:text-neutral-700"
      >
        <ChevronUp size={16} aria-hidden />
        Hide sets
      </button>
    </ExerciseCollapseContext.Provider>
  );
}
