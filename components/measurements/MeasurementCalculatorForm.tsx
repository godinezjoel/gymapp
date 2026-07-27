"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
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

export function MeasurementCalculatorForm({ lastEntry }: { lastEntry: MeasurementEntry | null }) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
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

  const values = watch();
  const isComplete =
    values.gender &&
    Number.isFinite(values.heightCm) &&
    Number.isFinite(values.neckCm) &&
    Number.isFinite(values.waistCm) &&
    (values.gender === "male" || Number.isFinite(values.hipCm));

  let livePreview: number | null = null;
  if (isComplete) {
    const computed = calculateBodyFatPercentage(values);
    if (Number.isFinite(computed)) livePreview = computed;
  }

  async function onSubmit(data: MeasurementInput) {
    setSubmitError(null);
    setSavedMessage(null);
    try {
      await saveMeasurementAction(data);
      reset(data);
      setSavedMessage("Gespeichert.");
      router.refresh();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Messung konnte nicht gespeichert werden.",
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 rounded-xl border border-neutral-200 p-4"
    >
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-neutral-700">Datum</span>
        <input
          type="date"
          {...register("loggedDate")}
          className="min-h-11 rounded-lg border border-neutral-300 px-3 py-3 text-base"
        />
      </label>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-neutral-700">Geschlecht</span>
        <Controller
          control={control}
          name="gender"
          render={({ field }) => <GenderToggle value={field.value} onChange={field.onChange} />}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-neutral-700">Größe (cm)</span>
          <input
            type="text"
            inputMode="decimal"
            placeholder="z. B. 180"
            {...register("heightCm", numberField)}
            className="min-h-11 rounded-lg border border-neutral-300 px-3 py-3 text-base tabular-nums"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-neutral-700">Hals (cm)</span>
          <input
            type="text"
            inputMode="decimal"
            placeholder="z. B. 38"
            {...register("neckCm", numberField)}
            className="min-h-11 rounded-lg border border-neutral-300 px-3 py-3 text-base tabular-nums"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-neutral-700">Taille (cm)</span>
          <input
            type="text"
            inputMode="decimal"
            placeholder="z. B. 85"
            {...register("waistCm", numberField)}
            className="min-h-11 rounded-lg border border-neutral-300 px-3 py-3 text-base tabular-nums"
          />
        </label>
        {values.gender === "female" && (
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-neutral-700">Hüfte (cm)</span>
            <input
              type="text"
              inputMode="decimal"
              placeholder="z. B. 95"
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

      <div className="rounded-lg bg-neutral-50 px-4 py-3">
        <p className="text-sm text-neutral-500">Körperfettanteil (US-Navy-Formel)</p>
        <p
          className={cn(
            "text-2xl font-semibold tabular-nums",
            livePreview === null && "text-neutral-300",
          )}
        >
          {livePreview !== null ? `${formatPercent(livePreview)} %` : "—"}
        </p>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={cn(
          "min-h-11 rounded-lg bg-neutral-900 py-3 text-base font-medium text-white active:scale-[0.98]",
          isSubmitting && "opacity-60",
        )}
      >
        {isSubmitting ? "Wird gespeichert…" : "Messung speichern"}
      </button>
    </form>
  );
}
