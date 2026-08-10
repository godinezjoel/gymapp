import Link from "next/link";
import { Trophy } from "lucide-react";
import { estimateOneRepMax } from "@/lib/utils/oneRepMax";
import { formatKg } from "@/lib/utils/format";
import type { ExerciseRecordEntry } from "@/lib/db/workouts";
import { cn } from "@/lib/utils/cn";

type RankedRecord = ExerciseRecordEntry & { oneRepMax: number };

// Gold/Silber/Bronze für die drei stärksten Übungen nach geschätztem 1RM –
// alles danach ist eine schlichte, gleich gestaltete Liste.
const RANK_STYLES = [
  "bg-amber-400 text-amber-950",
  "bg-neutral-300 text-neutral-700",
  "bg-orange-400 text-orange-950",
] as const;

const PREVIEW_COUNT = 5;

/**
 * Kurzvorschau neben dem Gewichtsdiagramm: nur die Top 5 nach geschätztem
 * 1RM, statisch. Die vollständige, durchsuchbare Liste steht auf einer
 * eigenen Seite (/analytics/records) – eine feste Kartenhöhe hätte bei vielen
 * Übungen immer irgendwo überlaufen.
 */
export function RecordsSection({ records }: { records: ExerciseRecordEntry[] }) {
  const ranked: RankedRecord[] = records
    .filter((record) => record.exercise_name !== null && record.weight_kg !== null && record.reps !== null)
    .map((record) => ({
      ...record,
      oneRepMax: estimateOneRepMax(record.weight_kg!, record.reps!),
    }))
    .sort((left, right) => right.oneRepMax - left.oneRepMax);

  const maxOneRepMax = ranked[0]?.oneRepMax ?? 0;
  const preview = ranked.slice(0, PREVIEW_COUNT);

  return (
    <section className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-medium text-neutral-500">Rekorde</h2>
        <span className="text-sm tabular-nums text-neutral-400">{ranked.length}</span>
      </div>

      {ranked.length === 0 ? (
        <p className="mt-4 text-sm text-neutral-500">Noch keine Rekorde – leg los.</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-1.5">
          {preview.map((record, index) => {
            const rankStyle = RANK_STYLES[index];
            const barWidth = maxOneRepMax > 0 ? Math.max(6, (record.oneRepMax / maxOneRepMax) * 100) : 0;

            return (
              <li key={record.exercise_name} className="relative overflow-hidden rounded-lg">
                <div
                  aria-hidden
                  className="absolute inset-y-0 left-0 rounded-lg bg-neutral-100"
                  style={{ width: `${barWidth}%` }}
                />
                <div className="relative flex items-center gap-3 px-3 py-2.5">
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums",
                      rankStyle ?? "bg-neutral-100 text-neutral-400",
                    )}
                  >
                    {rankStyle ? <Trophy size={12} strokeWidth={2} aria-hidden /> : index + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm text-neutral-700">
                    {record.exercise_name}
                  </span>
                  <span className="shrink-0 whitespace-nowrap text-right tabular-nums">
                    <span className="text-sm font-semibold text-neutral-900">
                      ≈{formatKg(record.oneRepMax)} kg
                    </span>
                    <span className="ml-1.5 text-xs text-neutral-400">
                      {formatKg(record.weight_kg!)}×{record.reps}
                    </span>
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {ranked.length > PREVIEW_COUNT && (
        <Link
          href="/analytics/records"
          className="mt-3 min-h-11 self-start rounded-lg text-sm text-neutral-500 underline underline-offset-2 transition-colors hover:text-neutral-900"
        >
          Alle {ranked.length} anzeigen
        </Link>
      )}
    </section>
  );
}
