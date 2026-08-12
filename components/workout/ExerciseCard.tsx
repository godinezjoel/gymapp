import { formatKg } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { estimateOneRepMax, effectiveWeightKg } from "@/lib/utils/oneRepMax";
import { getExerciseHistory, getExerciseRecord } from "@/lib/db/workouts";
import { getLatestBodyweight } from "@/lib/db/weightLogs";
import type { WorkoutExerciseDetail } from "@/lib/db/workouts";
import { deleteExerciseAction } from "@/actions/workouts";
import { SetList } from "@/components/workout/SetList";
import { ExerciseMenu } from "@/components/workout/ExerciseMenu";
import { ExerciseSetsPanel } from "@/components/workout/ExerciseSetsPanel";

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
  // Unabhängige Abfragen: parallel statt nacheinander. Das aktuelle
  // Körpergewicht wird nur für Calisthenics-Übungen gebraucht (Vorbelegung
  // eines neuen Satzes), der Rekord selbst trägt sein eigenes historisches
  // Körpergewicht (bodyweight_kg) bereits aus der View mit.
  const [history, record, currentBodyweightKg] = await Promise.all([
    getExerciseHistory(exercise.exercise_id, 3),
    getExerciseRecord(exercise.exercise_id),
    exercise.is_calisthenics ? getLatestBodyweight() : Promise.resolve(null),
  ]);

  const hasSets = exercise.sets.length > 0;
  const isDone = hasSets && exercise.sets.every((set) => set.is_completed);
  const badgeWeightKg = sameWeightStreakBadge(history);
  const recordOneRepMax =
    record && record.weight_kg !== null && record.reps !== null
      ? estimateOneRepMax(
          effectiveWeightKg(record.weight_kg, record.bodyweight_kg, record.is_calisthenics ?? false),
          record.reps,
        )
      : null;

  return (
    <div
      className={cn(
        "rounded-2xl border bg-white p-4 transition-colors",
        isDone ? "border-emerald-200 hover:border-emerald-300" : "border-neutral-200 hover:border-neutral-300",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h2 className={cn("truncate text-base font-semibold", isDone && "text-emerald-800")}>
            {exercise.exercise_name}
          </h2>
          <p className={cn("mt-0.5 text-sm", isDone ? "text-emerald-600" : "text-neutral-500")}>
            {hasSets
              ? `${exercise.sets.length} ${exercise.sets.length === 1 ? "Satz" : "Sätze"}${isDone ? " · erledigt" : ""}`
              : "Noch kein Satz erfasst"}
          </p>
        </div>

        <ExerciseMenu
          exerciseName={exercise.exercise_name}
          onDelete={deleteExerciseAction.bind(null, workoutId, exercise.id)}
        />
      </div>

      <ExerciseSetsPanel isDone={isDone}>
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

        {/* Einzige Stelle, die eine Satzliste rendert (SetList) – bestehende und
            neu hinzugefügte Sätze laufen dadurch über dieselbe Komponente und
            sehen exakt gleich aus, unabhängig davon, ob die Übung aus der
            Vorlage kam, manuell oder aus der Übungsbibliothek hinzugefügt wurde
            oder schon vorher da war. */}
        <div className="mt-3 border-t border-neutral-100 pt-3">
          <SetList
            workoutId={workoutId}
            exerciseId={exercise.id}
            sets={exercise.sets}
            initialReps={record?.reps ?? undefined}
            initialWeightKg={record?.weight_kg ?? undefined}
            recordOneRepMax={recordOneRepMax}
            isCalisthenics={exercise.is_calisthenics}
            bodyweightKg={currentBodyweightKg}
          />
        </div>
      </ExerciseSetsPanel>
    </div>
  );
}
