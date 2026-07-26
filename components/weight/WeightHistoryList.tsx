import type { WeightLog } from "@/types";
import { formatKg, formatWorkoutDate } from "@/lib/utils/format";

export function WeightHistoryList({ logs }: { logs: WeightLog[] }) {
  return (
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
