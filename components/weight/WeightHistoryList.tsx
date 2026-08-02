import type { WeightLogEntry } from "@/lib/db/weightLogs";
import { formatKg, formatWorkoutDate } from "@/lib/utils/format";

export function WeightHistoryList({ logs }: { logs: WeightLogEntry[] }) {
  return (
    // Einspaltig: die Liste steht auf der Analytics-Seite bereits in einer
    // eigenen Spalte neben den Messungen, ein zweites Raster darin ergäbe
    // Zeilen, in denen das ausgeschriebene Datum umbricht.
    <ul className="flex flex-col gap-2">
      {logs.map((log) => (
        <li
          key={log.id}
          className="flex items-center justify-between rounded-lg border border-neutral-200 px-4 py-3"
        >
          <span className="text-sm text-neutral-600">{formatWorkoutDate(log.logged_date)}</span>
          <span className="font-medium tabular-nums">{formatKg(log.weight_kg)} kg</span>
        </li>
      ))}
    </ul>
  );
}
