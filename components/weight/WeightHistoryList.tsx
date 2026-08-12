"use client";

import { List, ListItem } from "konsta/react";
import type { WeightLogEntry } from "@/lib/db/weightLogs";
import { formatKg, formatWorkoutDate } from "@/lib/utils/format";

export function WeightHistoryList({ logs }: { logs: WeightLogEntry[] }) {
  return (
    // nested: kein zusätzlicher vertikaler Außenabstand – die Seite steuert
    // den Abstand zu Nachbarelementen bereits selbst über ihr eigenes Grid.
    <List outline dividers nested className="overflow-hidden rounded-2xl">
      {logs.map((log) => (
        <ListItem
          key={log.id}
          title={
            <span className="text-sm text-neutral-600">{formatWorkoutDate(log.logged_date)}</span>
          }
          after={<span className="font-medium tabular-nums">{formatKg(log.weight_kg)} kg</span>}
        />
      ))}
    </List>
  );
}
