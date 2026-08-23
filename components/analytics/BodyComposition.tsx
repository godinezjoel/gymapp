import type { MeasurementEntry } from "@/lib/db/measurements";
import type { WeightLogEntry } from "@/lib/db/weightLogs";
import { bodyComposition, waistToHeightRatio, weightOnOrBefore } from "@/lib/utils/analytics";
import { formatKg, formatRatio, formatSigned } from "@/lib/utils/format";

function Part({
  label,
  value,
  delta,
  dotClass,
}: {
  label: string;
  value: string;
  delta: string | null;
  dotClass: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5">
        <span aria-hidden className={`h-2 w-2 shrink-0 rounded-full ${dotClass}`} />
        <span className="text-xs text-neutral-400">{label}</span>
      </div>
      <p className="mt-0.5 text-base font-semibold tabular-nums leading-tight">{value}</p>
      {delta && <p className="text-xs tabular-nums text-neutral-400">{delta}</p>}
    </div>
  );
}

/**
 * Aufteilung in Fett- und Magermasse – als Fußzeile der Körperfett-Karte.
 *
 * Bewusst keine eigene Karte mit eigener Überschrift: die Zahlen sind nichts
 * anderes als der Körperfettanteil darüber, auf das Gewicht umgerechnet. Als
 * zweite Karte stand derselbe Wert ein drittes Mal auf der Seite.
 *
 * Gewicht und Maße werden unabhängig voneinander erfasst, deshalb wird zur
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
    return <p className="text-sm text-neutral-400">No weight logged yet.</p>;
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
    <div>
      {/* Ein Balken statt zweier Zahlen nebeneinander: das Verhältnis ist die
          Aussage, nicht die Einzelwerte. */}
      <div
        className="flex h-2 overflow-hidden rounded-full bg-neutral-100"
        role="img"
        aria-label={`Fat mass ${formatKg(current.fatMassKg)} kilograms, lean mass ${formatKg(current.leanMassKg)} kilograms`}
      >
        <div className="bg-orange-400" style={{ width: `${fatShare}%` }} />
        <div className="flex-1 bg-neutral-900" />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-4">
        <Part
          label="Fat mass"
          dotClass="bg-orange-400"
          value={`${formatKg(current.fatMassKg)} kg`}
          delta={
            before ? `${formatSigned(current.fatMassKg - before.fatMassKg, formatKg)} kg` : null
          }
        />
        <Part
          label="Lean mass"
          dotClass="bg-neutral-900"
          value={`${formatKg(current.leanMassKg)} kg`}
          delta={
            before ? `${formatSigned(current.leanMassKg - before.leanMassKg, formatKg)} kg` : null
          }
        />
        {ratio !== null && (
          <div>
            <span className="text-xs text-neutral-400">Waist/height</span>
            <p className="mt-0.5 text-base font-semibold tabular-nums leading-tight">
              {formatRatio(ratio)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
