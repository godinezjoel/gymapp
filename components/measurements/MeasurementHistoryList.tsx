"use client";

import { List, ListItem } from "konsta/react";
import type { MeasurementEntry } from "@/lib/db/measurements";
import { formatCm, formatPercent, formatWorkoutDate } from "@/lib/utils/format";

export function MeasurementHistoryList({ entries }: { entries: MeasurementEntry[] }) {
  return (
    <List outline dividers nested className="overflow-hidden rounded-2xl">
      {entries.map((entry) => (
        <ListItem
          key={entry.loggedDate}
          title={
            <span className="truncate text-sm text-neutral-600">
              {formatWorkoutDate(entry.loggedDate)}
            </span>
          }
          after={
            // Nur noch Taille und Ergebnis: Größe und Hals ändern sich zwischen
            // zwei Messungen praktisch nie und standen in jeder Zeile mit.
            <span className="flex shrink-0 items-baseline gap-1.5 tabular-nums">
              <span className="text-sm text-neutral-400">{formatCm(entry.waistCm)} cm</span>
              <span className="font-medium">{formatPercent(entry.bodyFatPct)} %</span>
            </span>
          }
        />
      ))}
    </List>
  );
}
