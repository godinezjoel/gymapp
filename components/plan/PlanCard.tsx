"use client";

import { useState, useTransition } from "react";
import { Check, ChevronRight } from "lucide-react";
import { deleteWorkoutPlanAction, setActiveWorkoutPlanAction } from "@/actions/workoutPlans";
import type { WorkoutPlanSummary } from "@/lib/utils/cycle";
import { formatCompactDate } from "@/lib/utils/format";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { cn } from "@/lib/utils/cn";

/**
 * Eine Plankarte. Die Karte selbst öffnet den Editor; Aktivieren und Löschen
 * sitzen in einer eigenen Zeile darunter, damit sie nicht als verschachtelte
 * Buttons im Kartenknopf liegen (das wäre ungültiges Markup und auf dem Handy
 * eine Trefferfläche, die zwei Dinge gleichzeitig meint).
 */
export function PlanCard({ plan, onEdit }: { plan: WorkoutPlanSummary; onEdit: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function activate() {
    setError(null);
    startTransition(async () => {
      try {
        await setActiveWorkoutPlanAction(plan.id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Plan could not be activated.");
      }
    });
  }

  return (
    <li
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border transition-colors",
        plan.isActive
          ? "border-neutral-900 bg-neutral-900 text-white"
          : "border-neutral-200 bg-white hover:border-neutral-300",
      )}
    >
      <button
        type="button"
        onClick={onEdit}
        className={cn(
          // flex-1: im Kartenraster sind die Karten unterschiedlich hoch, und
          // die Aktionszeile soll trotzdem überall am unteren Rand stehen.
          "flex w-full flex-1 items-center gap-3 px-4 pb-3 pt-4 text-left transition-colors active:opacity-70",
          plan.isActive ? "hover:bg-neutral-800" : "hover:bg-neutral-50",
        )}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-lg font-semibold">{plan.name}</h2>
            {plan.isActive && (
              <span className="flex shrink-0 items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-xs font-medium">
                <Check size={12} strokeWidth={3} aria-hidden />
                Active
              </span>
            )}
          </div>
          <p
            className={cn(
              "mt-0.5 text-sm",
              plan.isActive ? "text-neutral-400" : "text-neutral-500",
            )}
          >
            {plan.dayCount} {plan.dayCount === 1 ? "day" : "days"} · from{" "}
            {formatCompactDate(plan.startDate)}
          </p>
        </div>

        <ChevronRight
          size={20}
          aria-hidden
          className={plan.isActive ? "text-neutral-500" : "text-neutral-300"}
        />
      </button>

      <div
        className={cn(
          "flex items-center justify-between border-t px-2",
          plan.isActive ? "border-white/10" : "border-neutral-100",
        )}
      >
        {plan.isActive ? (
          <span className="px-2 py-1 text-sm text-neutral-400">Used everywhere</span>
        ) : (
          <button
            type="button"
            onClick={activate}
            disabled={isPending}
            className={cn(
              "min-h-11 rounded-lg px-2 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-100 active:opacity-60",
              isPending && "opacity-40",
            )}
          >
            Activate
          </button>
        )}

        <DeleteButton
          confirmMessage={`Delete "${plan.name}"? Already logged workouts are kept.`}
          onDelete={deleteWorkoutPlanAction.bind(null, plan.id)}
          label={`Delete ${plan.name}`}
          className={cn(
            "min-h-11 rounded-lg px-2 text-sm transition-colors active:opacity-60",
            plan.isActive ? "text-red-400 hover:bg-white/10" : "text-red-600 hover:bg-red-50",
          )}
        >
          Delete
        </DeleteButton>
      </div>

      {error && <p className="px-4 pb-3 text-sm text-red-400">{error}</p>}
    </li>
  );
}
