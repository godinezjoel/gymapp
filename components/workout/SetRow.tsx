"use client";

import { useRef, useState, useTransition } from "react";
import { Check } from "lucide-react";
import { updateSetAction, deleteSetAction, setCompletedAction } from "@/actions/workouts";
import { setValuesSchema } from "@/lib/validation/workouts";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { cn } from "@/lib/utils/cn";

export const FIELD_CLASS =
  "min-h-11 w-full rounded-lg border border-neutral-200 bg-white text-center text-base tabular-nums";

/**
 * Spaltenraster einer Satzzeile: Nummer, Wiederholungen, Gewicht, Erledigt,
 * Löschen.
 *
 * Von SetList für Kopfzeile und Satzzeilen (SetRow) wiederverwendet – beide
 * müssen exakt dasselbe Raster benutzen, sonst stehen Überschrift und Werte
 * versetzt.
 */
export const SET_GRID_CLASS =
  "grid grid-cols-[1.25rem_minmax(0,1fr)_minmax(0,1fr)_2rem_2rem] items-center gap-2";

/**
 * Ein Satz im Protokoll – direkt an Ort und Stelle bearbeitbar.
 *
 * Unkontrollierte Eingaben mit defaultValue: nach dem Speichern rendert die
 * Seite über revalidatePath neu, und kontrollierte Felder würden dabei den
 * gerade getippten Wert überschreiben, sobald die Antwort eintrifft.
 *
 * Gespeichert wird beim Verlassen des Feldes und nur bei echter Änderung –
 * jeder Tastendruck wäre ein Request, und ein Speichern-Knopf pro Satz wäre
 * beim Training ein Tap zu viel.
 */
export function SetRow({
  workoutId,
  setId,
  position,
  reps,
  weightKg,
  isCompleted,
}: {
  workoutId: string;
  setId: string;
  position: number;
  reps: number | null;
  weightKg: number | null;
  isCompleted: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const repsRef = useRef<HTMLInputElement>(null);
  const weightRef = useRef<HTMLInputElement>(null);
  // Zuletzt bestätigter Stand, um unveränderte Felder nicht zu speichern.
  const savedRef = useRef({ reps: reps ?? 0, weightKg: weightKg ?? 0 });

  // Optimistisch statt auf revalidatePath zu warten: das Abhaken soll sich
  // beim Training sofort anfühlen, nicht erst nach einem Roundtrip. Bei
  // einem Fehler springt der Haken zurück.
  const [completed, setCompletedOptimistic] = useState(isCompleted);

  function commit() {
    const candidate = {
      reps: Number(repsRef.current?.value),
      weightKg: Number(weightRef.current?.value),
    };

    if (
      candidate.reps === savedRef.current.reps &&
      candidate.weightKg === savedRef.current.weightKg
    ) {
      setError(null);
      return;
    }

    // Dasselbe Schema wie in der Action (ADR-08): der Fehler steht sofort am
    // Feld, statt erst über den Server zurückzukommen.
    const parsed = setValuesSchema.safeParse(candidate);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Ungültiger Wert.");
      return;
    }

    setError(null);
    savedRef.current = parsed.data;

    startTransition(async () => {
      try {
        await updateSetAction(workoutId, setId, parsed.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Satz konnte nicht gespeichert werden.");
      }
    });
  }

  function toggleCompleted() {
    const next = !completed;
    setCompletedOptimistic(next);
    startTransition(async () => {
      try {
        await setCompletedAction(workoutId, setId, next);
      } catch (err) {
        setCompletedOptimistic(!next);
        setError(err instanceof Error ? err.message : "Status konnte nicht gespeichert werden.");
      }
    });
  }

  return (
    <li
      className={cn(
        "rounded-lg px-2 py-1.5 transition-colors",
        completed ? "bg-emerald-50 hover:bg-emerald-100/70" : "hover:bg-neutral-50",
        isPending && "opacity-60",
      )}
    >
      <div className={SET_GRID_CLASS}>
        <span
          className={cn(
            "text-center text-sm tabular-nums",
            completed ? "text-emerald-700" : "text-neutral-400",
          )}
        >
          {position}
        </span>

        <input
          ref={weightRef}
          type="number"
          inputMode="decimal"
          step="0.5"
          defaultValue={weightKg ?? 0}
          onBlur={commit}
          // Antippen überschreibt direkt, statt den Cursor irgendwo im Wert zu
          // setzen – beim Training wird korrigiert, nicht ergänzt.
          onFocus={(event) => event.target.select()}
          aria-label={`Gewicht von Satz ${position}`}
          className={cn(FIELD_CLASS, completed && "border-emerald-200 bg-emerald-50/60")}
        />

        <input
          ref={repsRef}
          type="number"
          inputMode="numeric"
          defaultValue={reps ?? 0}
          onBlur={commit}
          onFocus={(event) => event.target.select()}
          aria-label={`Wiederholungen von Satz ${position}`}
          className={cn(FIELD_CLASS, completed && "border-emerald-200 bg-emerald-50/60")}
        />

        <button
          type="button"
          onClick={toggleCompleted}
          aria-pressed={completed}
          aria-label={completed ? `Satz ${position} als offen markieren` : `Satz ${position} loggen`}
          className={cn(
            "flex h-11 w-8 items-center justify-center rounded-lg transition-colors active:scale-95",
            completed
              ? "bg-emerald-500 text-white hover:bg-emerald-600"
              : "border border-dashed border-neutral-300 text-transparent hover:border-neutral-400 hover:bg-neutral-50",
          )}
        >
          <Check size={16} strokeWidth={2.5} aria-hidden />
        </button>

        <DeleteButton
          confirmMessage={`Satz ${position} löschen?`}
          onDelete={deleteSetAction.bind(null, workoutId, setId)}
          label={`Satz ${position} löschen`}
          className="flex h-11 w-8 items-center justify-center rounded-lg text-lg text-red-500 transition-colors hover:bg-red-50 active:opacity-60"
        >
          ×
        </DeleteButton>
      </div>

      {error && <p className="pl-7 pt-1 text-sm text-red-600">{error}</p>}
    </li>
  );
}
