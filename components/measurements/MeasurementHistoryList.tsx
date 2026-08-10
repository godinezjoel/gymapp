import type { MeasurementEntry } from "@/lib/db/measurements";
import { formatCm, formatPercent, formatWorkoutDate } from "@/lib/utils/format";

export function MeasurementHistoryList({ entries }: { entries: MeasurementEntry[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {entries.map((entry) => (
        <li
          key={entry.loggedDate}
          className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 px-4 py-3"
        >
          <span className="min-w-0 truncate text-sm text-neutral-600">
            {formatWorkoutDate(entry.loggedDate)}
          </span>
          {/* Nur noch Taille und Ergebnis: Größe und Hals ändern sich zwischen
              zwei Messungen praktisch nie und standen in jeder Zeile mit. */}
          <span className="shrink-0 text-sm tabular-nums text-neutral-400">
            {formatCm(entry.waistCm)} cm
          </span>
          <span className="shrink-0 font-medium tabular-nums">
            {formatPercent(entry.bodyFatPct)} %
          </span>
        </li>
      ))}
    </ul>
  );
}
