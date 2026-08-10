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
import type { WeightLogEntry } from "@/lib/db/weightLogs";
import { formatKg, formatShortDate } from "@/lib/utils/format";
import { ChartTooltip } from "@/components/analytics/ChartTooltip";

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
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        {/* Fläche statt nackter Linie: bei einem Wertebereich von wenigen Kilo
            wirkt eine einzelne Linie im leeren Feld verloren. */}
        <defs>
          <linearGradient id="weightFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#171717" stopOpacity={0.14} />
            <stop offset="100%" stopColor="#171717" stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* Nur waagerechte Hilfslinien, durchgezogen und sehr hell: das
            gestrichelte Raster über beide Achsen stand vorher deutlicher da als
            die Messwerte selbst. */}
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
          // Ganze Kilo an der Achse; die Nachkommastelle steht im Tooltip, wo
          // sie gebraucht wird. Vorher trug jeder Tick eine Ziffer mehr.
          tickFormatter={(value: number) => String(Math.round(value))}
        />
        <Tooltip
          content={<ChartTooltip unit="kg" format={formatKg} />}
          cursor={{ stroke: "#d4d4d4", strokeWidth: 1 }}
        />

        <Area
          type="monotone"
          dataKey="weight"
          stroke="#171717"
          strokeWidth={2}
          fill="url(#weightFill)"
          // Ein Punkt je Messung ergibt bei täglichem Wiegen eine Perlenkette,
          // die die Kurve überdeckt – der aktive Punkt am Cursor genügt.
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0, fill: "#171717" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
