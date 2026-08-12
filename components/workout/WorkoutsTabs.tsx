"use client";

import { useState } from "react";
import { Segmented, SegmentedButton } from "konsta/react";
import { PlanManager } from "@/components/plan/PlanManager";
import { WorkoutHistorySection } from "@/components/workout/WorkoutHistorySection";
import type { WorkoutHistoryEntry } from "@/lib/db/workouts";
import type { WorkoutPlan } from "@/lib/utils/cycle";

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
      {/* strong: Konstas Variante mit weißer, gleitender Pille auf grauer
          Schiene – exakt das bisherige Design, jetzt aus der Komponente statt
          von Hand gebaut. */}
      <Segmented strong>
        {TABS.map(({ value, label }) => (
          <SegmentedButton key={value} active={tab === value} onClick={() => setTab(value)}>
            {label}
          </SegmentedButton>
        ))}
      </Segmented>

      {tab === "verlauf" ? (
        <WorkoutHistorySection
          history={history}
          workoutCount={workoutCount}
          avgDaysPerWeek={avgDaysPerWeek}
        />
      ) : (
        <PlanManager plans={plans} />
      )}
    </div>
  );
}
