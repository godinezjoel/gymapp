"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Minus, Plus } from "lucide-react";
import { saveWeightLogSchema, type SaveWeightLogInput } from "@/lib/validation/weightLogs";
import { saveWeightLogAction } from "@/actions/weightLogs";
import { cn } from "@/lib/utils/cn";

function todayIso(): string {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 10);
}

// Deckt den praktisch relevanten Bereich ab (Schema erlaubt bis knapp 400,
// aber ein Schieberegler über den vollen Bereich wäre pro Pixel viel zu grob).
const SLIDER_MIN_KG = 30;
const SLIDER_MAX_KG = 250;
const FINE_STEP_KG = 0.1;

function clampToSlider(value: number): number {
  return Math.min(SLIDER_MAX_KG, Math.max(SLIDER_MIN_KG, value));
}

// Deutsches Dezimalkomma fürs Tippen, ohne feste Nachkommastellen zu
// erzwingen – der Slider rundet auf 0,1, per Tastatur soll aber auch ein
// genauerer Wert (z. B. 82,45) eintippbar sein.
function toInputText(value: number): string {
  return String(value).replace(".", ",");
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
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SaveWeightLogInput>({
    resolver: zodResolver(saveWeightLogSchema),
    defaultValues: { loggedDate: todayIso(), weightKg: clampToSlider(lastWeightKg ?? 70) },
  });

  const weightKg = watch("weightKg");
  const sliderField = register("weightKg", { valueAsNumber: true });

  // Eigener Text neben dem Slider-Feld, weil ein Feldname sich nicht zweimal
  // registrieren lässt (der Ref würde kollidieren) – Slider und Eingabefeld
  // bleiben deshalb per Hand synchron, statt beide direkt an RHF zu hängen.
  const [weightText, setWeightText] = useState(() => toInputText(clampToSlider(lastWeightKg ?? 70)));

  function setWeight(value: number, text?: string) {
    setValue("weightKg", value, { shouldValidate: true });
    setWeightText(text ?? toInputText(value));
  }

  function adjustWeight(deltaKg: number) {
    const next = Math.round(clampToSlider((weightKg || 0) + deltaKg) * 10) / 10;
    setWeight(next);
  }

  function handleWeightTextChange(raw: string) {
    setWeightText(raw);
    const parsed = Number(raw.trim().replace(",", "."));
    if (raw.trim() !== "" && Number.isFinite(parsed)) {
      setValue("weightKg", parsed, { shouldValidate: true });
    }
  }

  async function onSubmit(values: SaveWeightLogInput) {
    setSubmitError(null);
    setSavedMessage(null);
    try {
      // Kein router.refresh(): revalidatePath in der Action liefert die neue
      // RSC-Payload bereits mit der Action-Antwort mit.
      await saveWeightLogAction(values);
      reset({ loggedDate: todayIso(), weightKg: values.weightKg });
      setWeightText(toInputText(values.weightKg));
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
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-neutral-700">Datum</span>
        <input
          type="date"
          {...register("loggedDate")}
          className="min-h-11 rounded-lg border border-neutral-300 px-3 py-3 text-base"
        />
      </label>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-neutral-700">Gewicht</span>

        <div className="flex items-center justify-center gap-1.5">
          <input
            type="text"
            inputMode="decimal"
            value={weightText}
            onChange={(event) => handleWeightTextChange(event.target.value)}
            onFocus={(event) => event.target.select()}
            aria-label="Gewicht in kg"
            className="w-28 rounded-lg border border-transparent text-center text-4xl font-semibold tabular-nums focus:border-neutral-300 focus:outline-none"
          />
          <span className="text-lg font-medium text-neutral-400">kg</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => adjustWeight(-FINE_STEP_KG)}
            aria-label="0,1 kg weniger"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-neutral-300 text-neutral-600 transition-colors hover:bg-neutral-50 active:scale-95"
          >
            <Minus size={18} aria-hidden />
          </button>

          <input
            type="range"
            min={SLIDER_MIN_KG}
            max={SLIDER_MAX_KG}
            step={FINE_STEP_KG}
            {...sliderField}
            onChange={(event) => {
              sliderField.onChange(event);
              setWeightText(toInputText(Number(event.target.value)));
            }}
            className="h-2 w-full flex-1 accent-neutral-900"
            aria-label="Gewicht in kg (Slider)"
          />

          <button
            type="button"
            onClick={() => adjustWeight(FINE_STEP_KG)}
            aria-label="0,1 kg mehr"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-neutral-300 text-neutral-600 transition-colors hover:bg-neutral-50 active:scale-95"
          >
            <Plus size={18} aria-hidden />
          </button>
        </div>
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
