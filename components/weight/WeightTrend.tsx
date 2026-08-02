import type { WeightLogEntry } from "@/lib/db/weightLogs";
import { formatKg } from "@/lib/utils/format";

export function WeightTrend({
  current,
  previous,
}: {
  current: WeightLogEntry;
  previous: WeightLogEntry | null;
}) {
  const delta = previous ? current.weight_kg - previous.weight_kg : null;

  return (
    <div className="rounded-xl border border-neutral-200 p-4">
      <p className="text-sm text-neutral-500">Aktuelles Gewicht</p>
      <div className="mt-1 flex items-baseline gap-3">
        <p className="text-2xl font-semibold tabular-nums">{formatKg(current.weight_kg)} kg</p>
        {delta !== null && (
          <span className="flex items-center gap-1 text-sm font-medium tabular-nums text-neutral-600">
            <span aria-hidden>{delta > 0 ? "↑" : delta < 0 ? "↓" : "→"}</span>
            <span>{delta === 0 ? "±0,0" : `${delta > 0 ? "+" : ""}${formatKg(delta)}`} kg</span>
          </span>
        )}
      </div>
      {delta !== null && <p className="mt-1 text-xs text-neutral-400">zum letzten Eintrag</p>}
    </div>
  );
}
