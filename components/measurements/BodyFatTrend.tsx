import type { MeasurementEntry } from "@/lib/db/measurements";
import { formatPercent } from "@/lib/utils/format";

export function BodyFatTrend({
  current,
  previous,
}: {
  current: MeasurementEntry;
  previous: MeasurementEntry | null;
}) {
  const delta = previous ? current.bodyFatPct - previous.bodyFatPct : null;

  return (
    <div className="rounded-xl border border-neutral-200 p-4">
      <p className="text-sm text-neutral-500">Körperfettanteil</p>
      <div className="mt-1 flex items-baseline gap-3">
        <p className="text-2xl font-semibold tabular-nums">{formatPercent(current.bodyFatPct)} %</p>
        {delta !== null && (
          <span className="flex items-center gap-1 text-sm font-medium tabular-nums text-neutral-600">
            <span aria-hidden>{delta > 0 ? "↑" : delta < 0 ? "↓" : "→"}</span>
            <span>{delta === 0 ? "±0,0" : `${delta > 0 ? "+" : ""}${formatPercent(delta)}`} %</span>
          </span>
        )}
      </div>
      {delta !== null && <p className="mt-1 text-xs text-neutral-400">zum letzten Eintrag</p>}
    </div>
  );
}
