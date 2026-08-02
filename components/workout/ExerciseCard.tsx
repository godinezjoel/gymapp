import type { WorkoutExerciseDetail } from "@/lib/db/workouts";
import { deleteExerciseAction } from "@/actions/workouts";
import { formatKg, formatVolumeKg } from "@/lib/utils/format";
import { AddSetForm } from "@/components/workout/AddSetForm";
import { SetRow, SET_GRID_CLASS } from "@/components/workout/SetRow";
import { ExerciseMenu } from "@/components/workout/ExerciseMenu";
import { cn } from "@/lib/utils/cn";

// Beides ist optional in der Datenbank: ein Satz kann erfasst sein, bevor Zahlen
// dranstehen. Für die Summen zählt ein fehlender Wert als 0, nicht als Lücke.
function summarize(exercise: WorkoutExerciseDetail) {
  let totalReps = 0;
  let volumeKg = 0;
  let topWeightKg = 0;

  for (const set of exercise.sets) {
    const reps = set.reps ?? 0;
    const weight = set.weight_kg ?? 0;
    totalReps += reps;
    volumeKg += reps * weight;
    topWeightKg = Math.max(topWeightKg, weight);
  }

  return { totalReps, volumeKg, topWeightKg };
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-lg font-semibold tabular-nums leading-tight">{value}</span>
      <span className="text-xs text-neutral-400">{label}</span>
    </div>
  );
}

// Server-Komponente: Überschrift, Kennzahlen und Rahmen sind statisches Markup
// und müssen nicht als React-Baum in den Browser. Interaktiv sind nur die
// Satzzeilen, das Menü und das Satz-Formular – die sind einzeln ausgelagert.
// Die Actions werden per .bind vorbelegt; eine gebundene Server Action ist über
// die RSC-Grenze serialisierbar, eine gewöhnliche Closure wäre es nicht.
export function ExerciseCard({
  workoutId,
  exercise,
}: {
  workoutId: string;
  exercise: WorkoutExerciseDetail;
}) {
  const { totalReps, volumeKg, topWeightKg } = summarize(exercise);
  const hasSets = exercise.sets.length > 0;

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

      {/* Die Kennzahlen sind der eigentliche Grund, eine erfasste Übung später
          noch einmal aufzuschlagen – aus den nackten Satzzeilen musste man sie
          bisher im Kopf zusammenrechnen. */}
      {hasSets && (
        <div className="mt-3 grid grid-cols-3 gap-2 border-y border-neutral-100 py-3">
          <Stat label="Wdh. gesamt" value={String(totalReps)} />
          <Stat label="Volumen" value={`${formatVolumeKg(volumeKg)} kg`} />
          <Stat label="Bestes Set" value={`${formatKg(topWeightKg)} kg`} />
        </div>
      )}

      {hasSets && (
        <>
          {/* Einheiten einmal als Spaltenüberschrift statt hinter jedem Feld:
              in einer Liste aus acht Sätzen stand "Wdh." und "kg" bisher
              sechzehnmal da. */}
          <div
            className={cn(
              SET_GRID_CLASS,
              "mt-3 px-2 pb-1 text-xs font-medium uppercase tracking-wide text-neutral-400",
            )}
          >
            <span className="text-center">#</span>
            <span className="text-center">Wdh.</span>
            <span className="text-center">kg</span>
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
        <AddSetForm workoutId={workoutId} exerciseId={exercise.id} />
      </div>
    </div>
  );
}
