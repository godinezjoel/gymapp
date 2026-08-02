import type { MeasurementEntry } from "@/lib/db/measurements";
import type { WeightLogEntry } from "@/lib/db/weightLogs";
import { bodyComposition, waistToHeightRatio, weightOnOrBefore } from "@/lib/utils/analytics";
import { formatCompactDate, formatKg, formatRatio, formatSigned } from "@/lib/utils/format";

/**
 * Fett- und Magermasse aus Gewicht und Körperfettanteil.
 *
 * Beide Reihen werden unabhängig voneinander erfasst, deshalb wird zu jeder
 * Messung das zuletzt davor eingetragene Gewicht gesucht. Ohne passendes
 * Gewicht lässt sich nichts rechnen – dann steht hier ein Hinweis statt einer
 * erfundenen Zahl.
 */
export function BodyComposition({
  latest,
  previous,
  weightLogs,
}: {
  latest: MeasurementEntry;
  previous: MeasurementEntry | null;
  weightLogs: WeightLogEntry[];
}) {
  const currentWeight = weightOnOrBefore(weightLogs, latest.loggedDate) ?? weightLogs[0] ?? null;

  if (!currentWeight) {
    return (
      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h3 className="text-base font-semibold">Körperzusammensetzung</h3>
        <p className="mt-2 text-sm text-neutral-500">
          Sobald ein Gewicht eingetragen ist, wird der Körperfettanteil hier in Fett- und Magermasse
          aufgeteilt.
        </p>
      </section>
    );
  }

  const current = bodyComposition(currentWeight.weight_kg, latest.bodyFatPct);

  const previousWeight = previous ? weightOnOrBefore(weightLogs, previous.loggedDate) : null;
  const before =
    previous && previousWeight
      ? bodyComposition(previousWeight.weight_kg, previous.bodyFatPct)
      : null;

  const total = current.fatMassKg + current.leanMassKg;
  const fatShare = total > 0 ? (current.fatMassKg / total) * 100 : 0;
  const ratio = waistToHeightRatio(latest.waistCm, latest.heightCm);

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5">
      <h3 className="text-base font-semibold">Körperzusammensetzung</h3>
      <p className="mt-0.5 text-sm text-neutral-500">
        Stand {formatCompactDate(latest.loggedDate)} · {formatKg(currentWeight.weight_kg)} kg
      </p>

      {/* Ein Balken statt zweier Zahlen nebeneinander: das Verhältnis ist die
          Aussage, nicht die Einzelwerte. */}
      <div
        className="mt-4 flex h-3 overflow-hidden rounded-full bg-neutral-100"
        role="img"
        aria-label={`Fettmasse ${formatKg(current.fatMassKg)} Kilogramm, Magermasse ${formatKg(current.leanMassKg)} Kilogramm`}
      >
        <div className="bg-orange-400" style={{ width: `${fatShare}%` }} />
        <div className="flex-1 bg-neutral-900" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <div className="flex items-center gap-1.5">
            <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-orange-400" />
            <span className="text-xs text-neutral-400">Fettmasse</span>
          </div>
          <p className="mt-0.5 text-lg font-semibold tabular-nums">
            {formatKg(current.fatMassKg)} kg
          </p>
          {before && (
            <p className="text-xs tabular-nums text-neutral-500">
              {formatSigned(current.fatMassKg - before.fatMassKg, formatKg)} kg seit{" "}
              {formatCompactDate(previous!.loggedDate)}
            </p>
          )}
        </div>

        <div>
          <div className="flex items-center gap-1.5">
            <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-neutral-900" />
            <span className="text-xs text-neutral-400">Magermasse</span>
          </div>
          <p className="mt-0.5 text-lg font-semibold tabular-nums">
            {formatKg(current.leanMassKg)} kg
          </p>
          {before && (
            <p className="text-xs tabular-nums text-neutral-500">
              {formatSigned(current.leanMassKg - before.leanMassKg, formatKg)} kg seit{" "}
              {formatCompactDate(previous!.loggedDate)}
            </p>
          )}
        </div>
      </div>

      {ratio !== null && (
        <p className="mt-4 border-t border-neutral-100 pt-3 text-sm text-neutral-500">
          Taille zu Größe:{" "}
          <span className="font-medium tabular-nums text-neutral-900">{formatRatio(ratio)}</span>{" "}
          <span className="text-neutral-400">
            (Taille {formatKg(latest.waistCm)} cm bei {formatKg(latest.heightCm)} cm)
          </span>
        </p>
      )}
    </section>
  );
}
