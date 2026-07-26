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
import type { WeightLog } from "@/types";
import { formatKg, formatShortDate } from "@/lib/utils/format";

export function WeightChart({ logs }: { logs: WeightLog[] }) {
  // Verlaufsliste ist neueste-zuerst sortiert, das Diagramm braucht chronologische
  // Reihenfolge (älteste links).
  const data = [...logs]
    .sort((a, b) => a.logged_date.localeCompare(b.logged_date))
    .map((log) => ({ date: log.logged_date, weight: log.weight_kg }));

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
