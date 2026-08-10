"use client";

import { useEffect, useId, useState, type PointerEvent as ReactPointerEvent } from "react";
import { useFieldArray, useWatch, type UseFormReturn } from "react-hook-form";
import {
  ArrowDown,
  ArrowUp,
  ChevronRight,
  GripVertical,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { MAX_DAY_EXERCISES, type WorkoutPlanInput } from "@/lib/validation/workoutPlan";
import { MenuButton } from "@/components/ui/MenuButton";
import { cn } from "@/lib/utils/cn";

// Leere Zahlenfelder sind der Normalfall (alle drei Vorgaben sind optional).
// Ohne diese Normalisierung liefert ein geleertes number-Input "" und der
// Resolver meldete "Erwartet Zahl" statt es als "keine Vorgabe" zu lesen.
function asOptionalNumber(value: unknown): number | null {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

const NUMBER_FIELD_CLASS =
  "min-h-11 w-full rounded-lg border border-neutral-200 bg-white px-2 text-center text-base tabular-nums";

const FIELD_LABEL_CLASS = "text-center text-xs font-medium text-neutral-400";

type DragHandleProps = {
  onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerUp: () => void;
  onPointerCancel: () => void;
};

/**
 * Ein Tag des Zyklus als aufklappbare Karte.
 *
 * Zugeklappt zeigt die Karte nur Name und Umfang: ein Plan mit sechs Tagen à
 * fünf Übungen füllte sonst mehrere Bildschirmhöhen, und wer den vierten Tag
 * bearbeiten will, scrollt an drei ausgebreiteten Formularen vorbei.
 *
 * Die Kopfzeile trägt links den Ziehgriff und rechts ein ⋮-Menü. Vorher standen
 * dort drei Symbolknöpfe (hoch, runter, entfernen) neben einem dauerhaft
 * sichtbaren Namensfeld – zusammen mehr Bedienelemente als Inhalt. Umsortieren
 * geht jetzt direkt per Ziehen, alles Übrige steht benannt im Menü.
 */
export function PlanDayFields({
  form,
  dayIndex,
  dayCount,
  isOpen,
  onToggle,
  isDragging,
  dragOffset,
  dragHandleProps,
  onMoveUp,
  onMoveDown,
  onRemove,
}: {
  form: UseFormReturn<WorkoutPlanInput>;
  dayIndex: number;
  dayCount: number;
  isOpen: boolean;
  onToggle: () => void;
  isDragging: boolean;
  dragOffset: number;
  dragHandleProps: DragHandleProps;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}) {
  const { control, register, formState, setFocus } = form;
  const bodyId = useId();

  // Der Name steht normalerweise als Text da; erst „Umbenennen“ macht ein
  // Eingabefeld daraus. Ein dauerhaft sichtbares Textfeld pro Tag ließ die
  // Liste wie ein Formular aussehen, obwohl man meistens nur nachschlägt, was
  // an welchem Tag ansteht.
  const [isRenaming, setIsRenaming] = useState(false);

  const { fields, append, remove } = useFieldArray({
    control,
    name: `days.${dayIndex}.exercises`,
  });

  // Ein Ruhetag behält seine Übungen (versehentliches Umschalten soll die
  // Vorlage nicht löschen), zeigt sie aber nicht – dort steht nichts an.
  const isRest = useWatch({ control, name: `days.${dayIndex}.isRest` });
  // Für die Zusammenfassung in der Kopfzeile: ohne sie stünde dort eine leere
  // Zeile, sobald der Tag noch keinen Namen hat.
  const label = useWatch({ control, name: `days.${dayIndex}.label` });

  const dayErrors = formState.errors.days?.[dayIndex];

  // setFocus greift erst, wenn das Feld registriert ist – also nach dem Render,
  // der es einblendet.
  useEffect(() => {
    if (isRenaming) setFocus(`days.${dayIndex}.label`);
  }, [isRenaming, setFocus, dayIndex]);

  // Ein leerer Name ist ungültig; wer das Feld so verlässt, soll nicht mit einem
  // stumm zugeklappten Feld dastehen.
  const hasLabelError = Boolean(dayErrors?.label);

  const summary = isRest
    ? "Ruhetag"
    : `${fields.length} ${fields.length === 1 ? "Übung" : "Übungen"}`;

  return (
    <li
      // Folgt beim Ziehen dem Finger. Kein transition auf transform: der Wert
      // kommt aus jedem pointermove und würde sonst hinterherlaufen.
      style={isDragging ? { transform: `translateY(${dragOffset}px)` } : undefined}
      // overflow-hidden ist hier nicht möglich – es beschnitte das ⋮-Menü.
      // Stattdessen runden die Randelemente selbst ab (siehe unten).
      className={cn(
        "rounded-2xl border bg-neutral-50 transition-shadow",
        isDragging
          ? "relative z-10 border-neutral-300 shadow-xl shadow-black/15"
          : "border-neutral-200",
      )}
    >
      <div
        className={cn(
          "flex items-center gap-1 rounded-t-2xl bg-white px-1.5 py-2",
          !isOpen && "rounded-b-2xl",
        )}
      >
        <button
          type="button"
          {...dragHandleProps}
          onKeyDown={(event) => {
            // Der Griff selbst ist per Tastatur nicht zu ziehen; die Pfeiltasten
            // bilden dieselbe Wirkung ab. Dieselben Aktionen stehen zusätzlich
            // benannt im ⋮-Menü.
            if (event.key === "ArrowUp" && dayIndex > 0) {
              event.preventDefault();
              onMoveUp();
            }
            if (event.key === "ArrowDown" && dayIndex < dayCount - 1) {
              event.preventDefault();
              onMoveDown();
            }
          }}
          disabled={dayCount === 1}
          aria-label={`Tag ${dayIndex + 1} verschieben`}
          // touch-none: sonst deutet der Browser die Bewegung als Scrollgeste
          // und der Griff bekommt nie ein pointermove zu sehen.
          className={cn(
            "flex h-11 w-6 shrink-0 touch-none items-center justify-center rounded-lg text-neutral-300 transition-colors",
            "hover:bg-neutral-100 hover:text-neutral-500 disabled:opacity-40 disabled:hover:bg-transparent",
            isDragging ? "cursor-grabbing text-neutral-500" : "cursor-grab",
          )}
        >
          <GripVertical size={16} aria-hidden />
        </button>

        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={bodyId}
          aria-label={`Tag ${dayIndex + 1} ${isOpen ? "zuklappen" : "aufklappen"}`}
          className="flex h-11 shrink-0 items-center gap-1 rounded-lg pl-0.5 pr-0.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
        >
          <ChevronRight
            size={18}
            aria-hidden
            className={cn(
              "transition-transform motion-reduce:transition-none",
              isOpen && "rotate-90",
            )}
          />
          <span className="w-4 text-center text-sm tabular-nums">{dayIndex + 1}</span>
        </button>

        {isRenaming || hasLabelError ? (
          <input
            type="text"
            placeholder="z. B. Push"
            aria-label={`Name von Tag ${dayIndex + 1}`}
            {...register(`days.${dayIndex}.label`)}
            onBlur={() => setIsRenaming(false)}
            onKeyDown={(event) => {
              // Enter in einem Textfeld schickte sonst das ganze Formular ab.
              if (event.key === "Enter") {
                event.preventDefault();
                setIsRenaming(false);
              }
              if (event.key === "Escape") {
                event.stopPropagation();
                setIsRenaming(false);
              }
            }}
            className="min-h-11 min-w-0 flex-1 rounded-lg border border-neutral-200 px-3 text-base font-medium"
          />
        ) : (
          // Die ganze Zeile schaltet um, nicht nur das Winkelsymbol – ein
          // 18px-Ziel wäre auf dem Handy die einzige Möglichkeit, die Karte
          // wieder zu öffnen.
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={isOpen}
            aria-controls={bodyId}
            className="flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-lg px-2 text-left transition-colors hover:bg-neutral-50"
          >
            <span
              className={cn(
                "truncate text-base font-medium",
                !label && "font-normal italic text-neutral-400",
              )}
            >
              {label || "Ohne Namen"}
            </span>
            <span className="ml-auto shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-500">
              {summary}
            </span>
          </button>
        )}

        <MenuButton
          label={`Aktionen für Tag ${dayIndex + 1}`}
          actions={[
            { label: "Umbenennen", icon: Pencil, onSelect: () => setIsRenaming(true) },
            {
              label: "Nach oben",
              icon: ArrowUp,
              onSelect: onMoveUp,
              disabled: dayIndex === 0,
            },
            {
              label: "Nach unten",
              icon: ArrowDown,
              onSelect: onMoveDown,
              disabled: dayIndex === dayCount - 1,
            },
            {
              label: "Löschen",
              icon: Trash2,
              onSelect: onRemove,
              disabled: dayCount === 1,
              destructive: true,
            },
          ]}
        />
      </div>

      {dayErrors?.label?.message && (
        <p className="bg-white px-3 pb-2 pl-11 text-sm text-red-600">{dayErrors.label.message}</p>
      )}

      {/* Zugeklappt bleibt der Inhalt ungerendert. react-hook-form behält die
          Werte trotzdem (shouldUnregister ist standardmäßig aus) – dasselbe
          Verhalten, auf das sich die Ruhetag-Umschaltung unten schon stützt. */}
      {isOpen && (
        <div id={bodyId}>
          <label
            className={cn(
              "flex min-h-11 items-center gap-2 border-t border-neutral-200 bg-white px-3 text-sm text-neutral-600",
              // Bei einem Ruhetag ist das die letzte Zeile der Karte und muss
              // die untere Rundung selbst mitbringen.
              isRest && "rounded-b-2xl",
            )}
          >
            <input
              type="checkbox"
              {...register(`days.${dayIndex}.isRest`)}
              className="h-5 w-5 rounded border-neutral-300"
            />
            Ruhetag
          </label>

          {!isRest && (
            <div className="flex flex-col gap-2 border-t border-neutral-200 p-3">
              {fields.length > 0 && (
                <div className="flex flex-col gap-2">
                  {fields.map((field, exerciseIndex) => {
                    const exerciseErrors = dayErrors?.exercises?.[exerciseIndex];

                    return (
                      // Eigene Karte statt einer Reihe nackter Felder: in einer
                      // Liste aus fünf Übungen war vorher nicht zu sehen, welche
                      // Zahlen zu welchem Namen gehören.
                      <div
                        key={field.id}
                        className="flex flex-col gap-2 rounded-xl border border-neutral-200 bg-white p-2.5"
                      >
                        {/* Ab `sm` steht die Übung in einer Zeile: Name und die
                            drei Vorgaben nebeneinander. Untereinander gestapelt
                            wäre im breiten Dialog die halbe Zeile leer und die
                            Liste doppelt so hoch. items-end richtet den
                            Namen an den Feldern aus, über denen eine
                            Beschriftung sitzt. */}
                        <div className="flex items-start gap-2 sm:items-end">
                          <span className="flex h-11 w-4 shrink-0 items-center justify-center text-xs tabular-nums text-neutral-400">
                            {exerciseIndex + 1}
                          </span>

                          <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-end">
                            <input
                              type="text"
                              placeholder="z. B. Bankdrücken"
                              aria-label={`Übung ${exerciseIndex + 1} in Tag ${dayIndex + 1}`}
                              {...register(
                                `days.${dayIndex}.exercises.${exerciseIndex}.exerciseName`,
                              )}
                              className="min-h-11 min-w-0 flex-1 rounded-lg border border-neutral-200 bg-white px-3 text-base font-medium"
                            />

                            {/* Beschriftungen statt Platzhalter: die
                                verschwinden beim ersten Tastendruck, und danach
                                stand da "8 80" ohne jeden Hinweis, was davon
                                Wiederholungen und was Kilogramm sind. Beide
                                Vorgaben sind optional – leer heißt "wird beim
                                Training erfasst", nicht 0. Keine Sätze-Vorgabe
                                mehr: ein Workout startet immer mit genau einem
                                Satz, weitere legt man dort selbst an. */}
                            <div className="grid grid-cols-2 gap-2 sm:w-40 sm:shrink-0">
                              <label className="flex flex-col gap-1">
                                <span className={FIELD_LABEL_CLASS}>Wdh.</span>
                                <input
                                  type="number"
                                  inputMode="numeric"
                                  aria-label={`Vorgabe Wiederholungen für Übung ${exerciseIndex + 1}`}
                                  {...register(
                                    `days.${dayIndex}.exercises.${exerciseIndex}.defaultReps`,
                                    { setValueAs: asOptionalNumber },
                                  )}
                                  className={NUMBER_FIELD_CLASS}
                                />
                              </label>
                              <label className="flex flex-col gap-1">
                                <span className={FIELD_LABEL_CLASS}>kg</span>
                                <input
                                  type="number"
                                  inputMode="decimal"
                                  step="0.5"
                                  aria-label={`Vorgabe Gewicht für Übung ${exerciseIndex + 1}`}
                                  {...register(
                                    `days.${dayIndex}.exercises.${exerciseIndex}.defaultWeightKg`,
                                    { setValueAs: asOptionalNumber },
                                  )}
                                  className={NUMBER_FIELD_CLASS}
                                />
                              </label>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => remove(exerciseIndex)}
                            aria-label={`Übung ${exerciseIndex + 1} entfernen`}
                            className="flex h-11 w-8 shrink-0 items-center justify-center rounded-lg text-red-500 transition-colors hover:bg-red-50"
                          >
                            <X size={16} aria-hidden />
                          </button>
                        </div>

                        {exerciseErrors && (
                          <p className="text-sm text-red-600">
                            {exerciseErrors.exerciseName?.message ??
                              exerciseErrors.defaultReps?.message ??
                              exerciseErrors.defaultWeightKg?.message}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <button
                type="button"
                onClick={() =>
                  append({
                    exerciseName: "",
                    defaultReps: null,
                    defaultWeightKg: null,
                  })
                }
                disabled={fields.length >= MAX_DAY_EXERCISES}
                className={cn(
                  "flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-dashed border-neutral-300 text-sm font-medium text-neutral-600 transition-colors",
                  "hover:border-neutral-400 hover:bg-white active:bg-white disabled:opacity-40 disabled:hover:border-neutral-300 disabled:hover:bg-transparent",
                )}
              >
                <Plus size={16} aria-hidden />
                Übung
              </button>
            </div>
          )}
        </div>
      )}
    </li>
  );
}
