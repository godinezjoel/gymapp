"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toPlanSummary, type WorkoutPlan } from "@/lib/utils/cycle";
import { PlanCard } from "@/components/plan/PlanCard";
import { PlanEditorForm } from "@/components/plan/PlanEditorForm";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { NavAddButton } from "@/components/layout/NavAddButton";

type EditorTarget = { mode: "create" } | { mode: "edit"; planId: string };

/**
 * Kartenliste plus Editor-Sheet.
 *
 * `target` wird beim Schließen bewusst nicht zurückgesetzt: das Sheet fährt
 * noch 300 ms aus, und ein sofort geleerter Inhalt würde dabei sichtbar
 * verschwinden. Der Inhalt verschwindet stattdessen mit dem Sheet, wenn dieses
 * sich selbst aus dem Baum nimmt.
 */
export function PlanManager({ plans }: { plans: WorkoutPlan[] }) {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [target, setTarget] = useState<EditorTarget>({ mode: "create" });

  // Über die ID nachschlagen statt das Objekt zu halten: nach dem Speichern
  // rendert der Server neu, und beim erneuten Öffnen soll der frische Stand
  // im Formular stehen, nicht der von vorhin.
  const editedPlan =
    target.mode === "edit" ? (plans.find((plan) => plan.id === target.planId) ?? null) : null;

  function openCreate() {
    setTarget({ mode: "create" });
    setIsEditorOpen(true);
  }

  function openEdit(planId: string) {
    setTarget({ mode: "edit", planId });
    setIsEditorOpen(true);
  }

  return (
    <>
      {/* Am Desktop steht der Knopf in der Werkzeugleiste statt als
          Aktionsknopf in der Bildschirmecke: dort klebte er am rechten
          Fensterrand, meterweit von der zentrierten Liste entfernt, zu der er
          gehört. */}
      <div className="hidden items-center justify-between gap-3 md:flex">
        <span className="text-sm text-neutral-500">
          {plans.length} {plans.length === 1 ? "Plan" : "Pläne"}
        </span>
        <button
          type="button"
          onClick={openCreate}
          className="flex min-h-11 items-center gap-1.5 rounded-full bg-neutral-900 px-4 text-sm font-medium text-white transition-colors hover:bg-neutral-700"
        >
          <Plus size={18} aria-hidden />
          Neuer Plan
        </button>
      </div>

      {plans.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 p-8 text-center">
          <p className="text-sm text-neutral-500">
            Noch kein Trainingsplan. Leg einen an – der erste wird automatisch der aktive.
          </p>
        </div>
      ) : (
        // Die Karten sind niedrig und schmal; untereinander gestapelt füllen
        // sie am Desktop eine Spalte in einem ansonsten leeren Fenster.
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={toPlanSummary(plan)} onEdit={() => openEdit(plan.id)} />
          ))}
        </ul>
      )}

      {/* Auf dem Handy der einzige Weg, einen Plan anzulegen – erscheint neben
          der schwebenden Navigation statt als eigener Knopf in der Ecke. */}
      <NavAddButton onClick={openCreate} label="Neuen Trainingsplan anlegen" />

      <BottomSheet
        open={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        title={editedPlan ? editedPlan.name : "Neuer Plan"}
      >
        <PlanEditorForm
          key={target.mode === "edit" ? target.planId : "create"}
          plan={editedPlan}
          onSaved={() => setIsEditorOpen(false)}
        />
      </BottomSheet>
    </>
  );
}
