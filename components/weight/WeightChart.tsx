"use client";

import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { WeightLogEntry } from "@/lib/db/weightLogs";
import { formatKg, formatShortDate } from "@/lib/utils/format";

export function WeightChart({ logs }: { logs: WeightLogEntry[] }) {
  // Verlaufsliste ist neueste-zuerst sortiert, das Diagramm braucht chronologische
  // Reihenfolge (älteste links). Rückwärts durchlaufen statt neu sortieren: die
  // Abfrage garantiert die Ordnung bereits, das spart das O(n log n).
  // useMemo, damit recharts nicht bei jedem Rerender eine neue data-Referenz
  // sieht und Skalen/Layout neu berechnet.
  const data = useMemo(
    () =>
      logs
        .slice()
        .reverse()
        .map((log) => ({ date: log.logged_date, weight: log.weight_kg })),
    [logs],
  );

  return (
    // Höhe muss mit ChartSkeleton übereinstimmen, sonst springt das Layout,
    // sobald das nachgeladene recharts-Bundle den Platzhalter ersetzt.
    <div className="h-56 w-full rounded-xl border border-neutral-200 p-2 lg:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -16 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
          <XAxis
            dataKey="date"
            tickFormatter={formatShortDate}
            tick={{ fontSize: 11 }}
            minTickGap={24}
          />
          <YAxis
            domain={["dataMin - 1", "dataMax + 1"]}
            tick={{ fontSize: 11 }}
            width={40}
            tickFormatter={(value: number) => formatKg(value)}
          />
          <Tooltip
            formatter={(value: number) => [`${formatKg(value)} kg`, "Gewicht"]}
            labelFormatter={(label: string) => formatShortDate(label)}
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="#171717"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
