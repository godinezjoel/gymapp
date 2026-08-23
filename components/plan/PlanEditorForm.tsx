"use client";

import { useEffect, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import {
  workoutPlanSchema,
  MAX_CYCLE_DAYS,
  type WorkoutPlanInput,
} from "@/lib/validation/workoutPlan";
import { saveWorkoutPlanAction } from "@/actions/workoutPlans";
import type { WorkoutPlan } from "@/lib/utils/cycle";
import { todayInAppTimeZone } from "@/lib/utils/date";
import { PlanDayFields } from "@/components/plan/PlanDayFields";
import { useDragReorder } from "@/hooks/useDragReorder";
import { cn } from "@/lib/utils/cn";

// Startpunkt für einen leeren Plan: nur die Tagesnamen. Übungen bleiben leer –
// eine vorgegebene Übungsauswahl wäre geraten, die Rotation dagegen ist der
// verbreitetste Fall und spart die ersten Taps.
const DEFAULT_DAYS: WorkoutPlanInput["days"] = [
  { label: "Push", isRest: false, exercises: [] },
  { label: "Pull", isRest: false, exercises: [] },
  { label: "Legs", isRest: false, exercises: [] },
  { label: "Rest", isRest: true, exercises: [] },
];

function toFormValues(plan: WorkoutPlan | null): WorkoutPlanInput {
  if (!plan) {
    return { id: null, name: "", startDate: todayInAppTimeZone(), days: DEFAULT_DAYS };
  }
  return {
    id: plan.id,
    name: plan.name,
    startDate: plan.startDate,
    days: plan.days.map((day) => ({
      label: day.label,
      isRest: day.isRest,
      exercises: day.exercises.map((exercise) => ({
        exerciseId: exercise.exerciseId,
        exerciseName: exercise.exerciseName,
        defaultReps: exercise.defaultReps,
        defaultWeightKg: exercise.defaultWeightKg,
      })),
    })),
  };
}

/**
 * Anlegen und Bearbeiten teilen dasselbe Formular – der einzige Unterschied ist
 * die vorbelegte ID. Zwei getrennte Formulare würden zwangsläufig
 * auseinanderlaufen.
 */
export function PlanEditorForm({
  plan,
  onSaved,
}: {
  plan: WorkoutPlan | null;
  onSaved: () => void;
}) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<WorkoutPlanInput>({
    resolver: zodResolver(workoutPlanSchema),
    defaultValues: toFormValues(plan),
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  const { fields, append, remove, move } = useFieldArray({ control, name: "days" });

  // Aufklapp-Zustand pro Tag, geführt über die von useFieldArray vergebene ID:
  // die überlebt Verschieben und Löschen, der Index nicht. Alles startet
  // zugeklappt – der Überblick über den Zyklus ist beim Öffnen die Frage, nicht
  // die einzelne Übung.
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({});

  // Ein gerade angelegter Tag ist leer und soll sofort befüllbar sein.
  const dayCountRef = useRef(fields.length);
  useEffect(() => {
    if (fields.length > dayCountRef.current) {
      const added = fields[fields.length - 1];
      if (added) setOpenIds((previous) => ({ ...previous, [added.id]: true }));
    }
    dayCountRef.current = fields.length;
  }, [fields]);

  const { listRef, dragIndex, dragOffset, handleProps } = useDragReorder({ onMove: move });

  const areAllOpen = fields.length > 0 && fields.every((field) => openIds[field.id]);

  function toggleAll() {
    setOpenIds(Object.fromEntries(fields.map((field) => [field.id, !areAllOpen])));
  }

  async function onSubmit(values: WorkoutPlanInput) {
    setSubmitError(null);
    try {
      // Kein router.refresh(): revalidatePath in der Action liefert die neue
      // RSC-Payload bereits mit der Action-Antwort mit.
      await saveWorkoutPlanAction(values);
      onSaved();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Training plan could not be saved.",
      );
    }
  }

  // Fehler aus dem Array können pro Zeile oder am Array selbst hängen.
  const daysError = errors.days?.message ?? errors.days?.root?.message;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 pb-2">
      <div className="flex gap-3">
        <label className="flex flex-1 flex-col gap-1.5">
          <span className="text-sm font-medium text-neutral-700">Name</span>
          <input
            type="text"
            placeholder="e.g. PPL"
            autoComplete="off"
            {...register("name")}
            className="min-h-11 rounded-lg border border-neutral-200 px-3 text-base"
          />
        </label>
        <label className="flex flex-1 flex-col gap-1.5">
          <span className="text-sm font-medium text-neutral-700">Start date</span>
          <input
            type="date"
            {...register("startDate")}
            className="min-h-11 rounded-lg border border-neutral-200 px-3 text-base"
          />
        </label>
      </div>

      {(errors.name ?? errors.startDate) && (
        <p className="text-sm text-red-600">{errors.name?.message ?? errors.startDate?.message}</p>
      )}

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-neutral-700">
            Cycle ({fields.length} {fields.length === 1 ? "day" : "days"})
          </span>
          <button
            type="button"
            onClick={toggleAll}
            className="rounded-lg px-2 py-1 text-sm text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
          >
            {areAllOpen ? "Collapse all" : "Expand all"}
          </button>
        </div>

        {/* Der Ziehgriff jeder Karte meldet sich über handleProps hier an –
            useDragReorder muss alle Zeilen vermessen können und braucht deshalb
            die Liste, nicht die einzelne Karte. */}
        <ul ref={listRef} className="flex flex-col gap-3">
          {fields.map((field, index) => (
            <PlanDayFields
              key={field.id}
              form={form}
              dayIndex={index}
              dayCount={fields.length}
              isDragging={dragIndex === index}
              dragOffset={dragOffset}
              dragHandleProps={handleProps(index)}
              // Ein Tag mit Fehler klappt auf und bleibt offen: eine
              // Fehlermeldung hinter einer zugeklappten Karte wäre nach dem
              // Absenden nirgends zu sehen, das Formular schiene nur kaputt.
              isOpen={(openIds[field.id] ?? false) || Boolean(errors.days?.[index])}
              onToggle={() =>
                setOpenIds((previous) => ({ ...previous, [field.id]: !previous[field.id] }))
              }
              onMoveUp={() => move(index, index - 1)}
              onMoveDown={() => move(index, index + 1)}
              onRemove={() => remove(index)}
            />
          ))}
        </ul>

        <button
          type="button"
          onClick={() => append({ label: "", isRest: false, exercises: [] })}
          disabled={fields.length >= MAX_CYCLE_DAYS}
          className="flex min-h-12 items-center justify-center gap-1.5 rounded-xl border border-dashed border-neutral-300 text-base font-medium text-neutral-700 transition-colors hover:border-neutral-400 hover:bg-neutral-50 active:bg-neutral-50 disabled:opacity-40 disabled:hover:border-neutral-300 disabled:hover:bg-transparent"
        >
          <Plus size={18} aria-hidden />
          Day
        </button>
      </div>

      {daysError && <p className="text-sm text-red-600">{daysError}</p>}
      {submitError && <p className="text-sm text-red-600">{submitError}</p>}

      {/* Klebt am unteren Rand des Sheets: bei einem langen Zyklus liegt der
          Speichern-Knopf sonst außerhalb der Reichweite des Daumens. */}
      <div className="sticky bottom-0 -mx-1 bg-gradient-to-t from-white via-white to-transparent px-1 pb-1 pt-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "min-h-12 w-full rounded-xl bg-neutral-900 text-base font-medium text-white transition-colors hover:bg-neutral-700 active:scale-[0.98]",
            isSubmitting && "opacity-60",
          )}
        >
          {isSubmitting ? "Saving…" : plan ? "Save changes" : "Create plan"}
        </button>
      </div>
    </form>
  );
}
