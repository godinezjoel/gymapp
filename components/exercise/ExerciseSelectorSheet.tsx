"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Loader2, Plus, Search } from "lucide-react";
import { loadExerciseSelectorDataAction, createExerciseAction } from "@/actions/exercises";
import type { ExerciseCatalogEntry, LastPerformance } from "@/lib/db/exercises";
import {
  MUSCLE_GROUPS,
  MUSCLE_GROUP_LABELS,
  EXERCISE_CATEGORIES,
  EXERCISE_CATEGORY_LABELS,
  type MuscleGroup,
  type ExerciseCategory,
} from "@/lib/constants/exercises";
import { formatKg, formatShortDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

const CHIP_CLASS =
  "shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors";
const CHIP_ACTIVE = "border-neutral-900 bg-neutral-900 text-white";
const CHIP_INACTIVE = "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400";

/**
 * Übungsauswahl: Suche + Filter über den ganzen Katalog auf einmal (siehe
 * listExercises), damit sich jede Eingabe sofort auswirkt statt bei jedem
 * Tastendruck einen Server-Roundtrip zu brauchen. Wer nichts Passendes
 * findet, legt direkt hier eine Custom-Übung an – der Suchtext wird als Name
 * vorgeschlagen, damit das nicht wie ein Umweg wirkt.
 *
 * Bewusst nur der Inhalt, kein eigenes BottomSheet: der Aufrufer hält
 * `open`/`onClose` selbst (siehe EditWorkoutSheet-Muster) und entscheidet
 * damit auch, ob "Abbrechen" das Sheet schließt oder eine Ebene zurückgeht.
 */
export function ExerciseSelectorSheet({
  onSelect,
}: {
  onSelect: (exercise: ExerciseCatalogEntry) => void;
}) {
  const [exercises, setExercises] = useState<ExerciseCatalogEntry[] | null>(null);
  const [lastPerformances, setLastPerformances] = useState<Map<string, LastPerformance>>(new Map());
  const [loadError, setLoadError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [muscleFilter, setMuscleFilter] = useState<MuscleGroup | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<ExerciseCategory | "all">("all");
  const [calisthenicsOnly, setCalisthenicsOnly] = useState(false);

  const [mode, setMode] = useState<"browse" | "create">("browse");

  useEffect(() => {
    let cancelled = false;
    loadExerciseSelectorDataAction()
      .then(({ exercises: loaded, lastPerformances: loadedLast }) => {
        if (cancelled) return;
        setExercises(loaded);
        setLastPerformances(new Map(loadedLast));
      })
      .catch(() => {
        if (!cancelled) setLoadError("Übungskatalog konnte nicht geladen werden.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const trimmedQuery = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!exercises) return [];

    const matches = exercises.filter((exercise) => {
      if (trimmedQuery && !exercise.name.toLowerCase().includes(trimmedQuery)) return false;
      if (muscleFilter !== "all" && exercise.primary_muscle_group !== muscleFilter) return false;
      if (categoryFilter !== "all" && exercise.category !== categoryFilter) return false;
      if (calisthenicsOnly && !exercise.is_calisthenics) return false;
      return true;
    });

    // Zuletzt gemacht zuerst (wie in Hevy/Strong): wer trainiert, wiederholt
    // meist dieselben paar Übungen – die sollen nicht unter hundert nie
    // benutzten stehen. Danach alphabetisch.
    return [...matches].sort((left, right) => {
      const leftDate = lastPerformances.get(left.id)?.workoutDate;
      const rightDate = lastPerformances.get(right.id)?.workoutDate;
      if (leftDate && rightDate) return rightDate.localeCompare(leftDate);
      if (leftDate) return -1;
      if (rightDate) return 1;
      return left.name.localeCompare(right.name);
    });
  }, [exercises, trimmedQuery, muscleFilter, categoryFilter, calisthenicsOnly, lastPerformances]);

  if (mode === "create") {
    return (
      <CreateExerciseForm
        initialName={query.trim()}
        onCreated={(exercise) => onSelect(exercise)}
        onCancel={() => setMode("browse")}
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search
          size={16}
          strokeWidth={1.75}
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
        />
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Übung suchen…"
          autoFocus
          className="min-h-11 w-full rounded-lg border border-neutral-200 pl-9 pr-3 text-base focus:border-neutral-400 focus:outline-none"
        />
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-0.5">
        <button
          type="button"
          onClick={() => setMuscleFilter("all")}
          className={cn(CHIP_CLASS, muscleFilter === "all" ? CHIP_ACTIVE : CHIP_INACTIVE)}
        >
          Alle Muskeln
        </button>
        {MUSCLE_GROUPS.map((group) => (
          <button
            key={group}
            type="button"
            onClick={() => setMuscleFilter(muscleFilter === group ? "all" : group)}
            className={cn(CHIP_CLASS, muscleFilter === group ? CHIP_ACTIVE : CHIP_INACTIVE)}
          >
            {MUSCLE_GROUP_LABELS[group]}
          </button>
        ))}
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-0.5">
        <button
          type="button"
          onClick={() => setCategoryFilter("all")}
          className={cn(CHIP_CLASS, categoryFilter === "all" ? CHIP_ACTIVE : CHIP_INACTIVE)}
        >
          Alle Geräte
        </button>
        {EXERCISE_CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setCategoryFilter(categoryFilter === category ? "all" : category)}
            className={cn(CHIP_CLASS, categoryFilter === category ? CHIP_ACTIVE : CHIP_INACTIVE)}
          >
            {EXERCISE_CATEGORY_LABELS[category]}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setCalisthenicsOnly((value) => !value)}
          className={cn(CHIP_CLASS, calisthenicsOnly ? CHIP_ACTIVE : CHIP_INACTIVE)}
        >
          Nur Calisthenics
        </button>
      </div>

      {loadError && <p className="text-sm text-red-600">{loadError}</p>}

      {!exercises && !loadError && (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-neutral-400">
          <Loader2 size={16} className="animate-spin" aria-hidden />
          Katalog wird geladen…
        </div>
      )}

      {exercises && (
        <ul className="flex flex-col gap-1">
          {filtered.map((exercise) => {
            const last = lastPerformances.get(exercise.id);
            return (
              <li key={exercise.id}>
                <button
                  type="button"
                  onClick={() => onSelect(exercise)}
                  className="flex min-h-14 w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-neutral-50 active:bg-neutral-100"
                >
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-medium text-neutral-900">
                        {exercise.name}
                      </span>
                      {last && (
                        <span
                          aria-label="Bereits trainiert"
                          className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500"
                        />
                      )}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-neutral-400">
                      {MUSCLE_GROUP_LABELS[exercise.primary_muscle_group as MuscleGroup] ??
                        exercise.primary_muscle_group}
                      {last &&
                        last.weightKg !== null &&
                        last.reps !== null &&
                        ` · zuletzt ${formatKg(last.weightKg)} kg × ${last.reps} (${formatShortDate(last.workoutDate)})`}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}

          {exercises && filtered.length === 0 && (
            <li className="py-6 text-center text-sm text-neutral-500">Keine Übung gefunden.</li>
          )}

          <li>
            <button
              type="button"
              onClick={() => setMode("create")}
              className="flex min-h-11 w-full items-center gap-2 rounded-xl border border-dashed border-neutral-300 px-3 text-sm font-medium text-neutral-600 transition-colors hover:border-neutral-400 hover:bg-neutral-50"
            >
              <Plus size={16} aria-hidden />
              {trimmedQuery ? `"${query.trim()}" neu anlegen` : "Neue Übung anlegen"}
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}

function CreateExerciseForm({
  initialName,
  onCreated,
  onCancel,
}: {
  initialName: string;
  onCreated: (exercise: ExerciseCatalogEntry) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initialName);
  const [primaryMuscleGroup, setPrimaryMuscleGroup] = useState<MuscleGroup>("other");
  const [category, setCategory] = useState<ExerciseCategory>("other");
  const [isCalisthenics, setIsCalisthenics] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const exercise = await createExerciseAction({
        name,
        primaryMuscleGroup,
        category,
        isCalisthenics,
      });
      onCreated(exercise);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Übung konnte nicht angelegt werden.");
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-neutral-700">Name</span>
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="z. B. Bankdrücken"
          autoFocus
          className="min-h-11 rounded-lg border border-neutral-300 px-3 py-3 text-base"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-neutral-700">Muskelgruppe</span>
        <select
          value={primaryMuscleGroup}
          onChange={(event) => setPrimaryMuscleGroup(event.target.value as MuscleGroup)}
          className="min-h-11 rounded-lg border border-neutral-300 bg-white px-3 text-base"
        >
          {MUSCLE_GROUPS.map((group) => (
            <option key={group} value={group}>
              {MUSCLE_GROUP_LABELS[group]}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-neutral-700">Gerät / Kategorie</span>
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value as ExerciseCategory)}
          className="min-h-11 rounded-lg border border-neutral-300 bg-white px-3 text-base"
        >
          {EXERCISE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {EXERCISE_CATEGORY_LABELS[cat]}
            </option>
          ))}
        </select>
      </label>

      <label className="flex min-h-11 items-center gap-2 text-sm text-neutral-700">
        <input
          type="checkbox"
          checked={isCalisthenics}
          onChange={(event) => setIsCalisthenics(event.target.checked)}
          className="h-5 w-5 rounded border-neutral-300"
        />
        Calisthenics / Körpergewicht
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="min-h-11 flex-1 rounded-lg border border-neutral-200 text-base font-medium text-neutral-600 transition-colors hover:bg-neutral-50"
        >
          Zurück
        </button>
        <button
          type="submit"
          disabled={isSubmitting || name.trim().length === 0}
          className={cn(
            "flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-lg bg-neutral-900 text-base font-medium text-white transition-colors hover:bg-neutral-700",
            (isSubmitting || name.trim().length === 0) && "opacity-60",
          )}
        >
          <Check size={16} aria-hidden />
          Anlegen
        </button>
      </div>
    </form>
  );
}
