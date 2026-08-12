"use client";

import { useState } from "react";
import { PlanManager } from "@/components/plan/PlanManager";
import { WorkoutHistorySection } from "@/components/workout/WorkoutHistorySection";
import type { WorkoutHistoryEntry } from "@/lib/db/workouts";
import type { WorkoutPlan } from "@/lib/utils/cycle";
import { cn } from "@/lib/utils/cn";

export type WorkoutsTab = "verlauf" | "plaene";

const TABS: { value: WorkoutsTab; label: string }[] = [
  { value: "verlauf", label: "Verlauf" },
  { value: "plaene", label: "Pläne" },
];

/**
 * Segmented Control + Tabinhalt, beide vorab serverseitig geladen. Ein Wechsel
 * ist dadurch ein reiner Client-State-Wechsel ohne Netzwerk-Roundtrip – dafür
 * tauscht der `history`/`plans`-Stand erst wieder aus, wenn die Seite neu
 * angefordert wird (z.B. nach einer Server Action, die revalidatePath auslöst).
 */
export function WorkoutsTabs({
  initialTab,
  history,
  workoutCount,
  avgDaysPerWeek,
  plans,
}: {
  initialTab: WorkoutsTab;
  history: WorkoutHistoryEntry[];
  workoutCount: number;
  avgDaysPerWeek: number;
  plans: WorkoutPlan[];
}) {
  const [tab, setTab] = useState<WorkoutsTab>(initialTab);

  return (
    <div className="flex flex-col gap-5">
      <div className="relative flex rounded-full bg-neutral-100 p-1">
        <span
          aria-hidden
          className={cn(
            "absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-white shadow-sm transition-transform duration-300 ease-out motion-reduce:transition-none",
            tab === "plaene" && "translate-x-full",
          )}
        />
        {TABS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            aria-pressed={tab === value}
            className={cn(
              "relative z-10 min-h-9 flex-1 rounded-full text-sm font-medium transition-colors",
              tab === value ? "text-neutral-900" : "text-neutral-500",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "verlauf" ? (
        <WorkoutHistorySection history={history} workoutCount={workoutCount} avgDaysPerWeek={avgDaysPerWeek} />
      ) : (
        <PlanManager plans={plans} />
      )}
    </div>
  );
}
