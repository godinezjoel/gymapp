import { Hash, Repeat, Weight } from "lucide-react";
import { formatKg } from "@/lib/utils/format";
import { estimateOneRepMax } from "@/lib/utils/oneRepMax";
import { getExerciseHistory, getExerciseRecord } from "@/lib/db/workouts";
import type { WorkoutExerciseDetail } from "@/lib/db/workouts";
import { deleteExerciseAction } from "@/actions/workouts";
import { AddSetSection } from "@/components/workout/AddSetSection";
import { SetRow, SET_GRID_CLASS } from "@/components/workout/SetRow";
import { ExerciseMenu } from "@/components/workout/ExerciseMenu";
import { cn } from "@/lib/utils/cn";

/**
 * "3x dasselbe Gewicht, geh hoch"-Hinweis: beruht auf den letzten drei
 * Einheiten dieser Übung, unabhängig vom Allzeit-Rekord – der Rekord kann
 * Wochen zurückliegen, dieser Hinweis reagiert auf den aktuellen Trend.
 */
function sameWeightStreakBadge(history: Awaited<ReturnType<typeof getExerciseHistory>>): number | null {
  if (history.length < 3) return null;

  const topWeights = history.slice(0, 3).map((entry) => {
    let topWeight = 0;
    for (const set of entry.sets) {
      topWeight = Math.max(topWeight, set.weight_kg ?? 0);
    }
    return topWeight;
  });

  const first = topWeights[0] ?? 0;
  return first > 0 && topWeights.every((weight) => weight === first) ? first : null;
}

// Server-Komponente: Überschrift, Kennzahlen und Rahmen sind statisches Markup
// und müssen nicht als React-Baum in den Browser. Interaktiv sind nur die
// Satzzeilen, das Menü und der Satz-Bereich – die sind einzeln ausgelagert.
// Die Actions werden per .bind vorbelegt; eine gebundene Server Action ist über
// die RSC-Grenze serialisierbar, eine gewöhnliche Closure wäre es nicht.
export async function ExerciseCard({
  workoutId,
  exercise,
}: {
  workoutId: string;
  exercise: WorkoutExerciseDetail;
}) {
  // Unabhängige Abfragen: parallel statt nacheinander.
  const [history, record] = await Promise.all([
    getExerciseHistory(exercise.exercise_name, 3),
    getExerciseRecord(exercise.exercise_name),
  ]);

  const hasSets = exercise.sets.length > 0;
  const badgeWeightKg = sameWeightStreakBadge(history);
  const recordOneRepMax =
    record && record.weight_kg !== null && record.reps !== null
      ? estimateOneRepMax(record.weight_kg, record.reps)
      : null;

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 transition-colors hover:border-neutral-300">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-base font-semibold">{exercise.exercise_name}</h2>
          <p className="mt-0.5 text-sm text-neutral-500">
            {hasSets
              ? `${exercise.sets.length} ${exercise.sets.length === 1 ? "Satz" : "Sätze"}`
              : "Noch kein Satz erfasst"}
          </p>
        </div>

        <ExerciseMenu
          exerciseName={exercise.exercise_name}
          onDelete={deleteExerciseAction.bind(null, workoutId, exercise.id)}
        />
      </div>

      {/* Der Rekord (bestes geschätztes 1RM über den ganzen Verlauf) ist der
          eigentliche Grund, eine Übung zu öffnen: er entscheidet über die
          Vorbefüllung unten und darüber, was es zu schlagen gilt. */}
      {record && record.weight_kg !== null && record.reps !== null && (
        <div className="mt-3 rounded-xl bg-neutral-50 px-3 py-3 text-sm text-neutral-600">
          <div className="flex items-center justify-between gap-3">
            <span className="font-medium text-neutral-700">Rekord</span>
            {badgeWeightKg !== null && (
              <span className="rounded-full bg-neutral-900 px-2.5 py-1 text-xs font-medium text-white">
                3x gleich · {formatKg(badgeWeightKg)} kg
              </span>
            )}
          </div>
          <p className="mt-1 tabular-nums text-neutral-500">
            {formatKg(record.weight_kg)} kg × {record.reps} Wdh.
            {recordOneRepMax !== null && ` · ≈${formatKg(recordOneRepMax)} kg 1RM`}
          </p>
        </div>
      )}

      {hasSets && (
        <>
          {/* Einheiten einmal als Spaltenüberschrift statt hinter jedem Feld:
              in einer Liste aus acht Sätzen stand "Wdh." und "kg" bisher
              sechzehnmal da. Kleine Pillen statt nackter Grossbuchstaben, mit
              Symbol – lesbar auf einen Blick statt als reiner Fliesstext. */}
          <div className={cn(SET_GRID_CLASS, "mt-3 px-2 pb-2")}>
            <span className="flex items-center justify-center text-neutral-300">
              <Hash size={13} strokeWidth={2.25} aria-hidden />
            </span>
            <span className="flex items-center justify-center gap-1 rounded-full bg-neutral-100 py-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
              <Repeat size={12} strokeWidth={2.25} aria-hidden />
              Wdh.
            </span>
            <span className="flex items-center justify-center gap-1 rounded-full bg-neutral-100 py-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
              <Weight size={12} strokeWidth={2.25} aria-hidden />
              kg
            </span>
            <span />
          </div>

          <ul className="flex flex-col">
            {exercise.sets.map((set, index) => (
              <SetRow
                key={set.id}
                workoutId={workoutId}
                setId={set.id}
                position={index + 1}
                reps={set.reps}
                weightKg={set.weight_kg}
              />
            ))}
          </ul>
        </>
      )}

      <div className="mt-3 border-t border-neutral-100 pt-3">
        <AddSetSection
          workoutId={workoutId}
          exerciseId={exercise.id}
          hasSets={hasSets}
          initialReps={record?.reps ?? undefined}
          initialWeightKg={record?.weight_kg ?? undefined}
          recordOneRepMax={recordOneRepMax}
        />
      </div>
    </div>
  );
}
