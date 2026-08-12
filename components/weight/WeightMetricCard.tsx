"use client";

import { useMemo, useState } from "react";
import type { WeightLogEntry } from "@/lib/db/weightLogs";
import { weightLogsWithinDays, weightWindowStats } from "@/lib/utils/analytics";
import { formatKg, formatSigned } from "@/lib/utils/format";
import { MetricFooterItem } from "@/components/analytics/MetricCard";
import { WeightChartLazy } from "@/components/weight/WeightChartLazy";

// "Alle" hat keinen Cutoff (null), die übrigen Optionen filtern über
// weightLogsWithinDays. Feste Liste statt freier Zahleneingabe: das deckt die
// gängigen Zeiträume ab, ohne dass ein Nutzer ein ungültiges "0 Tage" eintippt.
const TIMEFRAMES = [
  { days: 7, label: "7 Tage" },
  { days: 30, label: "30 Tage" },
  { days: 90, label: "90 Tage" },
  { days: 365, label: "1 Jahr" },
  { days: null, label: "Alle" },
] as const;

type TimeframeDays = number | null;

export function WeightMetricCard({
  logs,
  today,
}: {
  logs: WeightLogEntry[];
  today: string;
}) {
  const [days, setDays] = useState<TimeframeDays>(30);

  const filteredLogs = useMemo(() => weightLogsWithinDays(logs, today, days), [logs, today, days]);
  const stats = useMemo(() => weightWindowStats(filteredLogs), [filteredLogs]);

  const latestWeight = logs[0]?.weight_kg ?? null;
  if (latestWeight === null) return null;

  return (
    <section className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-medium text-neutral-500">Gewichtsverlauf</h2>
          <p className="mt-1 text-3xl font-semibold tabular-nums leading-none">
            {formatKg(latestWeight)} kg
          </p>
        </div>

        <select
          value={days === null ? "all" : String(days)}
          onChange={(event) => {
            const value = event.target.value;
            setDays(value === "all" ? null : Number(value));
          }}
          aria-label="Zeitraum"
          className="rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-sm text-neutral-600 transition-colors hover:border-neutral-300 focus:outline-none focus:ring-1 focus:ring-neutral-300"
        >
          {TIMEFRAMES.map(({ days: value, label }) => (
            <option key={label} value={value === null ? "all" : value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 h-48 w-full lg:h-64">
        <WeightChartLazy logs={filteredLogs} />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 border-t border-neutral-100 pt-4">
        <MetricFooterItem
          label="Veränderung"
          value={stats.change === null ? "—" : `${formatSigned(stats.change, formatKg)} kg`}
        />
        <MetricFooterItem
          label="Durchschnitt"
          value={stats.average === null ? "—" : `${formatKg(stats.average)} kg`}
        />
        <MetricFooterItem
          label="Min – Max"
          value={
            stats.min === null || stats.max === null
              ? "—"
              : `${formatKg(stats.min)} – ${formatKg(stats.max)}`
          }
        />
      </div>
    </section>
  );
}
