"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { saveWeightLogSchema, type SaveWeightLogInput } from "@/lib/validation/weightLogs";
import { saveWeightLogAction } from "@/actions/weightLogs";
import { cn } from "@/lib/utils/cn";

function todayIso(): string {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 10);
}

export function LogWeightForm({
  lastWeightKg,
  onSaved,
}: {
  lastWeightKg: number | null;
  onSaved?: () => void;
}) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SaveWeightLogInput>({
    resolver: zodResolver(saveWeightLogSchema),
    defaultValues: { loggedDate: todayIso(), weightKg: lastWeightKg ?? 70 },
  });

  async function onSubmit(values: SaveWeightLogInput) {
    setSubmitError(null);
    setSavedMessage(null);
    try {
      // Kein router.refresh(): revalidatePath in der Action liefert die neue
      // RSC-Payload bereits mit der Action-Antwort mit.
      await saveWeightLogAction(values);
      reset({ loggedDate: todayIso(), weightKg: values.weightKg });
      // Im Sheet schließt der Aufrufer; die Bestätigung wäre dort nur ein
      // Aufblitzen im Moment des Verschwindens.
      if (onSaved) {
        onSaved();
        return;
      }
      setSavedMessage("Gespeichert.");
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Gewicht konnte nicht gespeichert werden.",
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      // Ohne Kartenrahmen: das Formular steht ausschließlich im Sheet, das
      // seinen eigenen Rahmen bereits mitbringt.
      className="flex flex-col gap-4 pb-2"
    >
      <div className="flex gap-3">
        <label className="flex flex-1 flex-col gap-1.5">
          <span className="text-sm font-medium text-neutral-700">Datum</span>
          <input
            type="date"
            {...register("loggedDate")}
            className="min-h-11 rounded-lg border border-neutral-300 px-3 py-3 text-base"
          />
        </label>
        <label className="flex flex-1 flex-col gap-1.5">
          <span className="text-sm font-medium text-neutral-700">Gewicht (kg)</span>
          <input
            type="text"
            inputMode="decimal"
            placeholder="z. B. 82,4"
            {...register("weightKg", {
              setValueAs: (v) => (v === "" ? NaN : Number(String(v).replace(",", "."))),
            })}
            className="min-h-11 rounded-lg border border-neutral-300 px-3 py-3 text-base tabular-nums"
          />
        </label>
      </div>

      {(errors.loggedDate ?? errors.weightKg) && (
        <p className="text-sm text-red-600">
          {errors.loggedDate?.message ?? errors.weightKg?.message}
        </p>
      )}
      {submitError && <p className="text-sm text-red-600">{submitError}</p>}
      {savedMessage && !submitError && <p className="text-sm text-emerald-600">{savedMessage}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className={cn(
          "min-h-11 rounded-lg bg-neutral-900 py-3 text-base font-medium text-white transition-colors hover:bg-neutral-700 active:scale-[0.98]",
          isSubmitting && "opacity-60",
        )}
      >
        {isSubmitting ? "Wird gespeichert…" : "Gewicht speichern"}
      </button>
    </form>
  );
}
