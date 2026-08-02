// ============================================================================
// Kalenderarithmetik auf ISO-Datumsstrings (YYYY-MM-DD).
//
// Gemeinsame Grundlage für Trainingssplit (cycle.ts), Kalender (calendar.ts)
// und Streak (streak.ts). Bewusst ohne Abhängigkeiten, damit sie auf Server und
// Client identisch rechnet und isoliert prüfbar bleibt.
// ============================================================================

// Zeitzone der App. Der heutige Tag muss serverseitig deterministisch bestimmt
// werden: läuft der Server in UTC (Vercel-Default), wäre in Deutschland
// zwischen 00:00 und 02:00 Ortszeit noch "gestern". Fest verdrahtet, weil die
// App für einen Nutzer in einer Zeitzone gebaut ist.
export const APP_TIME_ZONE = "Europe/Berlin";

const isoDatePartsFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: APP_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Heutiges Datum in der App-Zeitzone als YYYY-MM-DD. */
export function todayInAppTimeZone(now: Date = new Date()): string {
  // Über formatToParts statt format(), damit das Ergebnis nicht davon abhängt,
  // in welcher Reihenfolge die ICU-Version die Bestandteile zusammensetzt.
  const parts = isoDatePartsFormatter.formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const MS_PER_DAY = 86_400_000;

// Tage seit der Unix-Epoche. Über Date.UTC statt lokaler Zeit, weil eine
// Differenz in Millisekunden über eine Sommerzeitgrenze hinweg um eine Stunde
// verschoben wäre und beim Abrunden einen ganzen Tag verschlucken könnte.
export function epochDayFromIso(isoDate: string): number {
  const match = ISO_DATE_PATTERN.exec(isoDate);
  if (!match) {
    throw new Error(`Ungültiges Datum (erwartet YYYY-MM-DD): ${isoDate}`);
  }
  return Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])) / MS_PER_DAY;
}

export function isoFromEpochDay(epochDay: number): string {
  const date = new Date(epochDay * MS_PER_DAY);
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${date.getUTCFullYear()}-${month}-${day}`;
}

/** Ganze Kalendertage zwischen zwei ISO-Daten (negativ, wenn `to` früher liegt). */
export function daysBetween(fromIsoDate: string, toIsoDate: string): number {
  return epochDayFromIso(toIsoDate) - epochDayFromIso(fromIsoDate);
}

/** ISO-Datum um `days` Tage verschieben (auch negativ). */
export function addDays(isoDate: string, days: number): string {
  return isoFromEpochDay(epochDayFromIso(isoDate) + days);
}

/** Wochentag mit Montag = 0 … Sonntag = 6 (deutsche Kalenderkonvention). */
export function weekdayIndex(isoDate: string): number {
  const jsDay = new Date(epochDayFromIso(isoDate) * MS_PER_DAY).getUTCDay(); // 0 = Sonntag
  return (jsDay + 6) % 7;
}
