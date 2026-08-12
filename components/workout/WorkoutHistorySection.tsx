"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { List, ListItem } from "konsta/react";
import { WEEKDAY_LABELS, formatMonthTitle, monthKeyOf } from "@/lib/utils/calendar";
import { weekdayIndex } from "@/lib/utils/date";
import type { WorkoutHistoryEntry } from "@/lib/db/workouts";
import { cn } from "@/lib/utils/cn";

function groupByMonth(
  entries: WorkoutHistoryEntry[],
): { monthKey: string; entries: WorkoutHistoryEntry[] }[] {
  const groups = new Map<string, WorkoutHistoryEntry[]>();
  for (const entry of entries) {
    const key = monthKeyOf(entry.workout_date);
    const bucket = groups.get(key);
    if (bucket) bucket.push(entry);
    else groups.set(key, [entry]);
  }
  // Die Abfrage liefert bereits neueste zuerst; Map behält Einfügereihenfolge,
  // die Monate stehen also automatisch chronologisch absteigend.
  return Array.from(groups, ([monthKey, groupEntries]) => ({ monthKey, entries: groupEntries }));
}

/**
 * Ein Monat als eigenständige, standardmäßig geschlossene Sektion. Die
 * Höhenanimation misst die tatsächliche Inhaltshöhe (scrollHeight) und
 * animiert darauf über max-height – zuverlässiger als die reine
 * CSS-Grid-Technik (0fr/1fr), die bei einem Container ohne definierte Höhe
 * je nach Engine unterschiedlich aufgelöst wird.
 */
function MonthGroup({ monthKey, entries }: { monthKey: string; entries: WorkoutHistoryEntry[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [maxHeight, setMaxHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setMaxHeight(isOpen ? contentRef.current.scrollHeight : 0);
    }
  }, [isOpen]);

  return (
    <section className="overflow-hidden rounded-3xl border border-neutral-200">
      <button
        type="button"
        onClick={() => setIsOpen((previous) => !previous)}
        aria-expanded={isOpen}
        className="flex min-h-11 w-full items-center justify-between gap-2 px-4 py-3 text-left transition-colors hover:bg-neutral-50 active:bg-neutral-50"
      >
        <span className="text-base font-semibold text-neutral-900">
          {formatMonthTitle(monthKey)}
        </span>
        <span className="flex items-center gap-1.5 text-sm text-neutral-400">
          {entries.length} {entries.length === 1 ? "Workout" : "Workouts"}
          <ChevronDown
            size={16}
            strokeWidth={1.75}
            aria-hidden
            className={cn(
              "transition-transform motion-reduce:transition-none",
              isOpen && "rotate-180",
            )}
          />
        </span>
      </button>

      <div
        style={{ maxHeight }}
        className="overflow-hidden transition-[max-height] duration-300 ease-out motion-reduce:transition-none"
      >
        <div ref={contentRef}>
          <List nested dividers className="border-t border-neutral-100">
            {entries.map((entry) => (
              <ListItem
                key={entry.id}
                link
                chevron
                // component setzt das äußere <li>-Element, für den klickbaren
                // Link selbst ist linkComponent zuständig – component={Link}
                // hier hätte Next.js' <Link> ohne href als <li> gerendert und
                // die Seite zum Absturz gebracht. Der Typ von linkComponent
                // ist zu eng gefasst (nur string), akzeptiert zur Laufzeit
                // aber jede Komponente wie `component` auch.
                linkComponent={Link as unknown as string}
                href={`/workouts/${entry.id}`}
                media={
                  <span className="flex w-9 shrink-0 flex-col items-center">
                    <span className="text-[11px] font-medium text-neutral-400 uppercase">
                      {WEEKDAY_LABELS[weekdayIndex(entry.workout_date)]}
                    </span>
                    <span className="text-base font-semibold text-neutral-900 tabular-nums">
                      {entry.workout_date.slice(8, 10)}
                    </span>
                  </span>
                }
                title={entry.name ?? "Workout"}
                after={
                  <span className="text-sm text-neutral-500 tabular-nums">
                    {entry.set_count} {entry.set_count === 1 ? "Satz" : "Sätze"}
                  </span>
                }
              />
            ))}
          </List>
        </div>
      </div>
    </section>
  );
}

export function WorkoutHistorySection({
  history,
  workoutCount,
  avgDaysPerWeek,
}: {
  history: WorkoutHistoryEntry[];
  workoutCount: number;
  avgDaysPerWeek: number;
}) {
  if (history.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-300 p-8 text-center">
        <p className="text-sm text-neutral-500">
          Noch keine Workouts erfasst. Starte dein erstes über &quot;Heute&quot;.
        </p>
      </div>
    );
  }

  const groups = groupByMonth(history);

  return (
    <div className="flex flex-col gap-4">
      <section className="flex items-center justify-around rounded-3xl border border-neutral-200 py-5">
        <div className="text-center">
          <p className="text-2xl font-bold text-neutral-900 tabular-nums">{workoutCount}</p>
          <p className="mt-0.5 text-sm text-neutral-500">Workouts gesamt</p>
        </div>
        <div aria-hidden className="h-10 w-px bg-neutral-200" />
        <div className="text-center">
          <p className="text-2xl font-bold text-neutral-900 tabular-nums">
            {avgDaysPerWeek.toFixed(1).replace(".", ",")}
          </p>
          <p className="mt-0.5 text-sm text-neutral-500">Ø Tage/Woche</p>
        </div>
      </section>

      <div className="flex flex-col gap-3">
        {groups.map((group) => (
          <MonthGroup key={group.monthKey} monthKey={group.monthKey} entries={group.entries} />
        ))}
      </div>
    </div>
  );
}
