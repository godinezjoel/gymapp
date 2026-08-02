import type { MeasurementEntry } from "@/lib/db/measurements";
import { formatCm, formatPercent, formatWorkoutDate } from "@/lib/utils/format";

export function MeasurementHistoryList({ entries }: { entries: MeasurementEntry[] }) {
  return (
    // Einspaltig – siehe WeightHistoryList.
    <ul className="flex flex-col gap-2">
      {entries.map((entry) => (
        <li key={entry.loggedDate} className="rounded-lg border border-neutral-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-600">{formatWorkoutDate(entry.loggedDate)}</span>
            <span className="font-medium tabular-nums">{formatPercent(entry.bodyFatPct)} % KF</span>
          </div>
          <p className="mt-1 text-xs tabular-nums text-neutral-400">
            Größe {formatCm(entry.heightCm)} cm · Hals {formatCm(entry.neckCm)} cm · Taille{" "}
            {formatCm(entry.waistCm)} cm
            {entry.hipCm !== null && <> · Hüfte {formatCm(entry.hipCm)} cm</>}
          </p>
        </li>
      ))}
    </ul>
  );
}
