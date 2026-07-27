"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MeasurementEntry } from "@/lib/db/measurements";
import { formatPercent, formatShortDate } from "@/lib/utils/format";

export function BodyFatChart({ entries }: { entries: MeasurementEntry[] }) {
  // Historie ist neueste-zuerst sortiert, das Diagramm braucht chronologische
  // Reihenfolge (älteste links).
  const data = [...entries]
    .sort((a, b) => a.loggedDate.localeCompare(b.loggedDate))
    .map((entry) => ({ date: entry.loggedDate, bodyFatPct: entry.bodyFatPct }));

  return (
    <div className="h-56 w-full rounded-xl border border-neutral-200 p-2">
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
            tickFormatter={(value: number) => formatPercent(value)}
          />
          <Tooltip
            formatter={(value: number) => [`${formatPercent(value)} %`, "Körperfett"]}
            labelFormatter={(label: string) => formatShortDate(label)}
          />
          <Line
            type="monotone"
            dataKey="bodyFatPct"
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
