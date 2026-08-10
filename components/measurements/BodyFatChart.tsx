"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MeasurementEntry } from "@/lib/db/measurements";
import { formatPercent, formatShortDate } from "@/lib/utils/format";
import { ChartTooltip } from "@/components/analytics/ChartTooltip";

export function BodyFatChart({ entries }: { entries: MeasurementEntry[] }) {
  // Historie ist neueste-zuerst sortiert, das Diagramm braucht chronologische
  // Reihenfolge (älteste links). Rückwärts durchlaufen statt neu sortieren: die
  // Abfrage garantiert die Ordnung bereits, das spart das O(n log n).
  // useMemo, damit recharts nicht bei jedem Rerender eine neue data-Referenz
  // sieht und Skalen/Layout neu berechnet.
  const data = useMemo(
    () =>
      entries
        .slice()
        .reverse()
        .map((entry) => ({ date: entry.loggedDate, bodyFatPct: entry.bodyFatPct })),
    [entries],
  );

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        {/* Orange wie die Fettmasse in der Körperzusammensetzung – dieselbe
            Größe soll auf der Seite nicht zweimal verschieden aussehen. */}
        <defs>
          <linearGradient id="bodyFatFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity={0.24} />
            <stop offset="100%" stopColor="#fb923c" stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid vertical={false} stroke="#f5f5f5" />

        <XAxis
          dataKey="date"
          tickFormatter={formatShortDate}
          tick={{ fontSize: 11, fill: "#a3a3a3" }}
          tickLine={false}
          axisLine={false}
          minTickGap={44}
        />
        <YAxis
          domain={["dataMin - 1", "dataMax + 1"]}
          tick={{ fontSize: 11, fill: "#a3a3a3" }}
          tickLine={false}
          axisLine={false}
          width={32}
          tickFormatter={(value: number) => String(Math.round(value))}
        />
        <Tooltip
          content={<ChartTooltip unit="%" format={formatPercent} />}
          cursor={{ stroke: "#d4d4d4", strokeWidth: 1 }}
        />

        <Area
          type="monotone"
          dataKey="bodyFatPct"
          stroke="#f97316"
          strokeWidth={2}
          fill="url(#bodyFatFill)"
          // Messungen sind selten – hier bleiben die Punkte sichtbar, sonst
          // wäre bei drei Werten kaum zu erkennen, wo gemessen wurde.
          dot={{ r: 3, strokeWidth: 0, fill: "#f97316" }}
          activeDot={{ r: 5, strokeWidth: 0, fill: "#f97316" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
