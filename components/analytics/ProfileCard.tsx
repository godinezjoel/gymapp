import { User } from "lucide-react";
import type { WeightLogEntry } from "@/lib/db/weightLogs";
import type { MeasurementEntry } from "@/lib/db/measurements";
import type { WorkoutPlan } from "@/lib/utils/cycle";
import { bmi } from "@/lib/utils/analytics";
import { formatBmi, formatCm, formatCompactDate } from "@/lib/utils/format";

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-lg font-semibold tabular-nums leading-tight">{value}</span>
      <span className="text-xs text-neutral-400">{label}</span>
    </div>
  );
}

/**
 * Kopfkarte der Analytics-Seite: wer man ist, in Zahlen.
 *
 * Die App kennt keinen Nutzerdatensatz (ein Nutzer hinter einer Passphrase) –
 * das "Profil" ist deshalb vollständig aus den erfassten Reihen abgeleitet.
 *
 * Bewusst ohne Gewicht und Körperfett: beide stehen als Kacheln direkt darunter
 * und noch einmal über ihrem Diagramm. Hier bleibt, was sich selten ändert.
 */
export function ProfileCard({
  latestWeight,
  latestMeasurement,
  workoutCount,
  firstEntryDate,
  activePlan,
}: {
  latestWeight: WeightLogEntry | null;
  latestMeasurement: MeasurementEntry | null;
  workoutCount: number;
  firstEntryDate: string | null;
  activePlan: WorkoutPlan | null;
}) {
  const heightCm = latestMeasurement?.heightCm ?? null;
  const weightKg = latestWeight?.weight_kg ?? null;
  const bodyMassIndex = weightKg !== null && heightCm !== null ? bmi(weightKg, heightCm) : null;

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-white">
          <User size={20} aria-hidden />
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-semibold">Dein Profil</h2>
          <p className="text-sm text-neutral-500">
            {workoutCount} {workoutCount === 1 ? "Workout" : "Workouts"}
            {firstEntryDate && <> · seit {formatCompactDate(firstEntryDate)}</>}
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-4 border-t border-neutral-100 pt-4">
        <Fact label="Größe" value={heightCm !== null ? `${formatCm(heightCm)} cm` : "—"} />
        <Fact label="BMI" value={bodyMassIndex !== null ? formatBmi(bodyMassIndex) : "—"} />
        <Fact label="Plan" value={activePlan ? activePlan.name : "—"} />
      </div>
    </section>
  );
}
