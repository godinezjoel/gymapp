"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { MeasurementEntry } from "@/lib/db/measurements";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { LogWeightForm } from "@/components/weight/LogWeightForm";
import { MeasurementCalculatorForm } from "@/components/measurements/MeasurementCalculatorForm";

type OpenSheet = "weight" | "measurement" | null;

/**
 * Die beiden Eingabeformulare hinter je einem Knopf.
 *
 * Ausgeklappt standen sie zusammen für gut zwei Bildschirmhöhen Formularfelder –
 * auf einer Seite, die man in aller Regel öffnet, um Zahlen anzuschauen, nicht
 * um welche einzutragen. Als Sheet bleiben sie einen Tap entfernt, ohne die
 * Auswertung nach unten zu schieben.
 */
export function LogEntryBar({
  lastWeightKg,
  lastMeasurement,
}: {
  lastWeightKg: number | null;
  lastMeasurement: MeasurementEntry | null;
}) {
  const [open, setOpen] = useState<OpenSheet>(null);

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setOpen("weight")}
          className="flex min-h-11 items-center gap-1.5 rounded-full bg-neutral-900 px-4 text-sm font-medium text-white transition-colors hover:bg-neutral-700 active:scale-95"
        >
          <Plus size={16} aria-hidden />
          Weight
        </button>
        <button
          type="button"
          onClick={() => setOpen("measurement")}
          className="flex min-h-11 items-center gap-1.5 rounded-full border border-neutral-200 px-4 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 active:scale-95"
        >
          <Plus size={16} aria-hidden />
          Measurements
        </button>
      </div>

      <BottomSheet open={open === "weight"} onClose={() => setOpen(null)} title="Log weight">
        <LogWeightForm lastWeightKg={lastWeightKg} onSaved={() => setOpen(null)} />
      </BottomSheet>

      <BottomSheet
        open={open === "measurement"}
        onClose={() => setOpen(null)}
        title="Log measurements"
      >
        <MeasurementCalculatorForm lastEntry={lastMeasurement} onSaved={() => setOpen(null)} />
      </BottomSheet>
    </>
  );
}
