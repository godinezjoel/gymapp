"use client";

import { useMemo, useState } from "react";
import { Controller, useForm, useWatch, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { measurementSchema, type MeasurementInput } from "@/lib/validation/measurements";
import { saveMeasurementAction } from "@/actions/measurements";
import { calculateBodyFatPercentage } from "@/lib/utils/bodyFat";
import { formatPercent } from "@/lib/utils/format";
import { GenderToggle } from "@/components/measurements/GenderToggle";
import { cn } from "@/lib/utils/cn";
import type { MeasurementEntry } from "@/lib/db/measurements";

function todayIso(): string {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 10);
}

const numberField = {
  setValueAs: (v: string) => (v === "" ? NaN : Number(String(v).replace(",", "."))),
};
// Für hipCm: leer muss zu `undefined` werden (nicht NaN), sonst greift Zods
// .optional() nie und die eigentliche "für Frauen erforderlich"-Meldung wird nie
// erreicht, weil der Basis-Typfehler (NaN) zuerst feuert.
const optionalNumberField = {
  setValueAs: (v: string) => (v === "" ? undefined : Number(String(v).replace(",", "."))),
};

// Eigene Komponente, damit die Live-Vorschau bei jedem Tastendruck neu rendert,
// ohne das gesamte Formular (fünf Eingabefelder, GenderToggle, Submit-Button)
// mitzuziehen. useWatch abonniert gezielt die fünf Felder, die in die Formel
// eingehen – loggedDate löst dadurch keinen Rerender der Vorschau mehr aus.
function BodyFatPreview({ control }: { control: Control<MeasurementInput> }) {
  const [gender, heightCm, neckCm, waistCm, hipCm] = useWatch({
    control,
    name: ["gender", "heightCm", "neckCm", "waistCm", "hipCm"],
  });

  const livePreview = useMemo(() => {
    const isComplete =
      gender &&
      Number.isFinite(heightCm) &&
      Number.isFinite(neckCm) &&
      Number.isFinite(waistCm) &&
      (gender === "male" || Number.isFinite(hipCm));
    if (!isComplete) return null;

    const computed = calculateBodyFatPercentage({ gender, heightCm, neckCm, waistCm, hipCm });
    return Number.isFinite(computed) ? computed : null;
  }, [gender, heightCm, neckCm, waistCm, hipCm]);

  return (
    <div className="rounded-lg bg-neutral-50 px-4 py-3">
      <p className="text-sm text-neutral-500">Body fat (US Navy formula)</p>
      <p
        className={cn(
          "text-2xl font-semibold tabular-nums",
          livePreview === null && "text-neutral-300",
        )}
      >
        {livePreview !== null ? `${formatPercent(livePreview)} %` : "—"}
      </p>
    </div>
  );
}

export function MeasurementCalculatorForm({
  lastEntry,
  onSaved,
}: {
  lastEntry: MeasurementEntry | null;
  onSaved?: () => void;
}) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MeasurementInput>({
    resolver: zodResolver(measurementSchema),
    defaultValues: {
      loggedDate: todayIso(),
      gender: "male",
      heightCm: lastEntry?.heightCm ?? undefined,
      neckCm: lastEntry?.neckCm ?? undefined,
      waistCm: lastEntry?.waistCm ?? undefined,
      hipCm: lastEntry?.hipCm ?? undefined,
    },
  });

  // Nur das Geschlecht steuert die Sichtbarkeit des Hüft-Felds; die Zahlenfelder
  // werden bewusst nicht hier abonniert, sonst rendert das ganze Formular bei
  // jedem Tastendruck neu (dafür ist BodyFatPreview zuständig).
  const gender = useWatch({ control, name: "gender" });

  async function onSubmit(data: MeasurementInput) {
    setSubmitError(null);
    setSavedMessage(null);
    try {
      // Kein router.refresh(): revalidatePath in der Action liefert die neue
      // RSC-Payload bereits mit der Action-Antwort mit.
      await saveMeasurementAction(data);
      reset(data);
      // Im Sheet schließt der Aufrufer; siehe LogWeightForm.
      if (onSaved) {
        onSaved();
        return;
      }
      setSavedMessage("Saved.");
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Measurement could not be saved.",
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
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-neutral-700">Date</span>
        <input
          type="date"
          {...register("loggedDate")}
          className="min-h-11 rounded-lg border border-neutral-300 px-3 py-3 text-base"
        />
      </label>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-neutral-700">Gender</span>
        <Controller
          control={control}
          name="gender"
          render={({ field }) => <GenderToggle value={field.value} onChange={field.onChange} />}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-neutral-700">Height (cm)</span>
          <input
            type="text"
            inputMode="decimal"
            placeholder="e.g. 180"
            {...register("heightCm", numberField)}
            className="min-h-11 rounded-lg border border-neutral-300 px-3 py-3 text-base tabular-nums"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-neutral-700">Neck (cm)</span>
          <input
            type="text"
            inputMode="decimal"
            placeholder="e.g. 38"
            {...register("neckCm", numberField)}
            className="min-h-11 rounded-lg border border-neutral-300 px-3 py-3 text-base tabular-nums"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-neutral-700">Waist (cm)</span>
          <input
            type="text"
            inputMode="decimal"
            placeholder="e.g. 85"
            {...register("waistCm", numberField)}
            className="min-h-11 rounded-lg border border-neutral-300 px-3 py-3 text-base tabular-nums"
          />
        </label>
        {gender === "female" && (
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-neutral-700">Hip (cm)</span>
            <input
              type="text"
              inputMode="decimal"
              placeholder="e.g. 95"
              {...register("hipCm", optionalNumberField)}
              className="min-h-11 rounded-lg border border-neutral-300 px-3 py-3 text-base tabular-nums"
            />
          </label>
        )}
      </div>

      {Object.values(errors).length > 0 && (
        <p className="text-sm text-red-600">
          {errors.loggedDate?.message ??
            errors.heightCm?.message ??
            errors.neckCm?.message ??
            errors.waistCm?.message ??
            errors.hipCm?.message}
        </p>
      )}
      {submitError && <p className="text-sm text-red-600">{submitError}</p>}
      {savedMessage && !submitError && <p className="text-sm text-emerald-600">{savedMessage}</p>}

      <BodyFatPreview control={control} />

      <button
        type="submit"
        disabled={isSubmitting}
        className={cn(
          "min-h-11 rounded-lg bg-neutral-900 py-3 text-base font-medium text-white transition-colors hover:bg-neutral-700 active:scale-[0.98]",
          isSubmitting && "opacity-60",
        )}
      >
        {isSubmitting ? "Saving…" : "Save measurement"}
      </button>
    </form>
  );
}
