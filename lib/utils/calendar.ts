// ============================================================================
// Monatsraster für die Workout-Historie.
//
// Der angezeigte Monat steckt als "YYYY-MM" im Query-Parameter, nicht im
// Client-State: das Blättern sind dadurch normale <Link>-Navigationen und der
// Kalender bleibt eine reine Server-Komponente ohne Client-JS.
// ============================================================================

import { addDays, epochDayFromIso, isoFromEpochDay, weekdayIndex } from "@/lib/utils/date";

export const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

const MONTH_KEY_PATTERN = /^(\d{4})-(0[1-9]|1[0-2])$/;

export type CalendarDay = {
  date: string;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isFuture: boolean;
};

/** "YYYY-MM" des Monats, in dem das Datum liegt. */
export function monthKeyOf(isoDate: string): string {
  return isoDate.slice(0, 7);
}

export function isValidMonthKey(value: string | undefined): value is string {
  return typeof value === "string" && MONTH_KEY_PATTERN.test(value);
}

/** Monat verschieben, z. B. "2026-01" um -1 -> "2025-12". */
export function addMonths(monthKey: string, delta: number): string {
  const match = MONTH_KEY_PATTERN.exec(monthKey);
  if (!match) throw new Error(`Ungültiger Monat (erwartet YYYY-MM): ${monthKey}`);

  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1 + delta;
  // Division mit Abrundung, damit auch negative Verschiebungen über
  // Jahresgrenzen hinweg stimmen (-1 / 12 muss -1 ergeben, nicht 0).
  const targetYear = year + Math.floor(monthIndex / 12);
  const targetMonth = ((monthIndex % 12) + 12) % 12;
  return `${targetYear}-${String(targetMonth + 1).padStart(2, "0")}`;
}

export function firstDayOfMonth(monthKey: string): string {
  return `${monthKey}-01`;
}

export function daysInMonth(monthKey: string): number {
  const next = firstDayOfMonth(addMonths(monthKey, 1));
  return epochDayFromIso(next) - epochDayFromIso(firstDayOfMonth(monthKey));
}

const monthTitleFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** "July 2026" */
export function formatMonthTitle(monthKey: string): string {
  return monthTitleFormatter.format(new Date(`${firstDayOfMonth(monthKey)}T00:00:00Z`));
}

/**
 * Vollständige Wochen (Mo–So) für einen Monat, inklusive der angrenzenden Tage
 * aus Vor- und Folgemonat, damit das Raster keine Löcher hat.
 */
export function buildMonthGrid(monthKey: string, today: string): CalendarDay[][] {
  const first = firstDayOfMonth(monthKey);
  const leading = weekdayIndex(first);
  const total = daysInMonth(monthKey);
  const cells = Math.ceil((leading + total) / 7) * 7;
  const gridStart = epochDayFromIso(first) - leading;

  const weeks: CalendarDay[][] = [];
  for (let cell = 0; cell < cells; cell++) {
    const date = isoFromEpochDay(gridStart + cell);
    if (cell % 7 === 0) weeks.push([]);
    weeks[weeks.length - 1]?.push({
      date,
      dayOfMonth: Number(date.slice(8, 10)),
      isCurrentMonth: date.startsWith(monthKey),
      isToday: date === today,
      isFuture: date > today,
    });
  }
  return weeks;
}

/** Erster und letzter Tag des Rasters – der Bereich, den die Abfrage abdecken muss. */
export function monthGridRange(monthKey: string): { from: string; to: string } {
  const first = firstDayOfMonth(monthKey);
  const leading = weekdayIndex(first);
  const cells = Math.ceil((leading + daysInMonth(monthKey)) / 7) * 7;
  return { from: addDays(first, -leading), to: addDays(first, -leading + cells - 1) };
}
