"use client";

import { useMemo, useState } from "react";
import { Search, Trophy } from "lucide-react";
import { estimateOneRepMax } from "@/lib/utils/oneRepMax";
import { formatKg } from "@/lib/utils/format";
import type { ExerciseRecordEntry } from "@/lib/db/workouts";
import { cn } from "@/lib/utils/cn";

type RankedRecord = ExerciseRecordEntry & { oneRepMax: number };

const PODIUM_STYLES: Record<1 | 2 | 3, string> = {
  1: "order-2 bg-gradient-to-b from-amber-300 to-amber-500 pb-8 pt-6 text-amber-950",
  2: "order-1 bg-gradient-to-b from-neutral-200 to-neutral-300 pb-6 pt-5 text-neutral-700",
  3: "order-3 bg-gradient-to-b from-orange-300 to-orange-400 pb-6 pt-5 text-orange-950",
};

function PodiumCard({ record, rank }: { record: RankedRecord; rank: 1 | 2 | 3 }) {
  return (
    <div className={cn("flex flex-col items-center rounded-2xl px-3 text-center shadow-sm", PODIUM_STYLES[rank])}>
      <Trophy size={rank === 1 ? 26 : 20} strokeWidth={2} aria-hidden />
      <p className="mt-2 line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-tight">
        {record.exercise_name}
      </p>
      <p className="mt-1 text-2xl font-bold tabular-nums leading-none">{formatKg(record.oneRepMax)}</p>
      <p className="text-xs opacity-80">kg 1RM</p>
      <p className="mt-1.5 text-xs tabular-nums opacity-70">
        {formatKg(record.weight_kg!)} kg × {record.reps}
      </p>
    </div>
  );
}

function Row({ record, rank, barWidth }: { record: RankedRecord; rank: number; barWidth: number }) {
  return (
    <li className="relative overflow-hidden rounded-lg">
      <div
        aria-hidden
        className="absolute inset-y-0 left-0 rounded-lg bg-neutral-100"
        style={{ width: `${barWidth}%` }}
      />
      <div className="relative flex items-center gap-3 px-3 py-3">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-semibold tabular-nums text-neutral-400">
          {rank + 1}
        </span>
        <span className="min-w-0 flex-1 truncate text-sm text-neutral-700">{record.exercise_name}</span>
        <span className="shrink-0 whitespace-nowrap text-right tabular-nums">
          <span className="text-sm font-semibold text-neutral-900">≈{formatKg(record.oneRepMax)} kg</span>
          <span className="ml-1.5 text-xs text-neutral-400">
            {formatKg(record.weight_kg!)}×{record.reps}
          </span>
        </span>
      </div>
    </li>
  );
}

/**
 * Vollständige Rekordliste als eigene Seite statt eines aufklappbaren
 * Bereichs: bei vielen Übungen sprengte eine feste Kartenhöhe jeden Rahmen,
 * eine eigene Seite hat dagegen so viel Platz, wie sie braucht.
 */
export function RecordsList({ records }: { records: ExerciseRecordEntry[] }) {
  const [query, setQuery] = useState("");

  const ranked = useMemo<RankedRecord[]>(
    () =>
      records
        .filter((record) => record.exercise_name !== null && record.weight_kg !== null && record.reps !== null)
        .map((record) => ({
          ...record,
          oneRepMax: estimateOneRepMax(record.weight_kg!, record.reps!),
        }))
        .sort((left, right) => right.oneRepMax - left.oneRepMax),
    [records],
  );

  const maxOneRepMax = ranked[0]?.oneRepMax ?? 0;
  const trimmedQuery = query.trim().toLowerCase();
  const isSearching = trimmedQuery.length > 0;

  const filtered = isSearching
    ? ranked.filter((record) => record.exercise_name!.toLowerCase().includes(trimmedQuery))
    : ranked.slice(3);

  const podium = ranked.slice(0, 3);

  if (ranked.length === 0) {
    return <p className="text-sm text-neutral-500">Noch keine Rekorde – leg los.</p>;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="relative">
        <Search
          size={16}
          strokeWidth={1.75}
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
        />
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Übung suchen…"
          className="min-h-11 w-full rounded-lg border border-neutral-200 pl-9 pr-3 text-sm focus:border-neutral-400 focus:outline-none"
        />
      </div>

      {!isSearching && podium.length > 0 && (
        <div className="grid grid-cols-3 items-end gap-3">
          {podium.map((record, index) => (
            <PodiumCard key={record.exercise_name} record={record} rank={(index + 1) as 1 | 2 | 3} />
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-sm text-neutral-500">Keine Übung gefunden.</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {filtered.map((record) => (
            <Row
              key={record.exercise_name}
              record={record}
              rank={ranked.indexOf(record)}
              barWidth={maxOneRepMax > 0 ? Math.max(6, (record.oneRepMax / maxOneRepMax) * 100) : 0}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
