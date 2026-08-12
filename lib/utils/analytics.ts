// ============================================================================
// Abgeleitete Kennzahlen der Analytics-Seite.
//
// Reine Funktionen ohne Datenbankzugriff: die Rohdaten (Gewicht, Maße,
// Trainingstage) liegen bereits vor, hier wird nur gerechnet. Dadurch bleiben
// die Formeln an einer Stelle und isoliert prüfbar, statt in der Seite zwischen
// dem Markup zu stehen.
// ============================================================================

import { addDays, daysBetween, weekdayIndex } from "@/lib/utils/date";
import type { WeightLogEntry } from "@/lib/db/weightLogs";
import type { MeasurementEntry } from "@/lib/db/measurements";

/**
 * Body-Mass-Index.
 *
 * Bewusst ohne Einstufung ("Normal", "Übergewicht"): der BMI unterscheidet nicht
 * zwischen Muskel- und Fettmasse und stuft trainierte Menschen regelmäßig zu
 * hoch ein. Als Zahl neben dem Körperfettanteil ist er brauchbar, als Urteil
 * nicht.
 */
export function bmi(weightKg: number, heightCm: number): number | null {
  if (heightCm <= 0) return null;
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

export type BodyComposition = { fatMassKg: number; leanMassKg: number };

/**
 * Aufteilung des Körpergewichts in Fett- und Magermasse.
 *
 * Die aussagekräftigste Zahl der App für jemanden, der trainiert: das
 * Gesamtgewicht allein sagt nicht, ob eine Zunahme Muskel oder Fett war.
 */
export function bodyComposition(weightKg: number, bodyFatPct: number): BodyComposition {
  const fatMassKg = weightKg * (bodyFatPct / 100);
  return { fatMassKg, leanMassKg: weightKg - fatMassKg };
}

/**
 * Verhältnis Taille zu Körpergröße – ein gängiger Orientierungswert, der ohne
 * Waage auskommt und anders als der BMI die Fettverteilung berücksichtigt.
 */
export function waistToHeightRatio(waistCm: number, heightCm: number): number | null {
  if (heightCm <= 0) return null;
  return waistCm / heightCm;
}

/**
 * Der jüngste Eintrag, der nicht nach `isoDate` liegt.
 *
 * Gewicht und Maße werden unabhängig voneinander erfasst; um zu einer Messung
 * das passende Gewicht zu finden, braucht es den zeitlich nächsten davorliegenden
 * Wert. `logs` ist neueste-zuerst sortiert, der erste Treffer ist damit der
 * gesuchte.
 */
export function weightOnOrBefore(logs: WeightLogEntry[], isoDate: string): WeightLogEntry | null {
  return logs.find((log) => log.logged_date <= isoDate) ?? null;
}

/**
 * Gewichtsänderung gegenüber dem jüngsten Eintrag, der mindestens `days`
 * zurückliegt. Null, wenn die Historie noch nicht so weit reicht – dann ist
 * "±0" die falsche Auskunft, es gibt schlicht keinen Vergleichswert.
 */
export function weightChangeOver(
  logs: WeightLogEntry[],
  days: number,
  today: string,
): number | null {
  const current = logs[0];
  if (!current) return null;

  const cutoff = addDays(today, -days);
  // ISO-Daten sind lexikografisch vergleichbar – kein Parsen nötig.
  const past = logs.find((log) => log.logged_date <= cutoff);
  if (!past) return null;

  return current.weight_kg - past.weight_kg;
}

/**
 * Gewichtseinträge innerhalb eines Zeitfensters, `null` steht für "Alle".
 *
 * `logs` ist neueste-zuerst sortiert, das Filtern ändert daran nichts – Chart
 * und Statistik erwarten beide diese Reihenfolge.
 */
export function weightLogsWithinDays(
  logs: WeightLogEntry[],
  today: string,
  days: number | null,
): WeightLogEntry[] {
  if (days === null) return logs;
  const cutoff = addDays(today, -days);
  return logs.filter((log) => log.logged_date >= cutoff);
}

export type WeightWindowStats = {
  change: number | null;
  average: number | null;
  min: number | null;
  max: number | null;
};

/**
 * Veränderung, Durchschnitt und Spanne innerhalb eines bereits gefilterten
 * Zeitfensters.
 *
 * Die Veränderung braucht mindestens zwei Einträge (jüngster minus ältester
 * im Fenster) – bei nur einem Wert gibt es noch keine Richtung, "±0" wäre
 * eine falsche Auskunft.
 */
export function weightWindowStats(logs: WeightLogEntry[]): WeightWindowStats {
  if (logs.length === 0) return { change: null, average: null, min: null, max: null };

  const weights = logs.map((log) => log.weight_kg);
  const change = weights.length > 1 ? weights[0]! - weights[weights.length - 1]! : null;
  const average = weights.reduce((sum, weight) => sum + weight, 0) / weights.length;

  return { change, average, min: Math.min(...weights), max: Math.max(...weights) };
}

export type WeekBucket = { weekStart: string; days: number };

/**
 * Trainingstage je Kalenderwoche (Montag als Wochenbeginn), älteste Woche
 * zuerst.
 *
 * Zwei Einheiten am selben Tag zählen wie in der Streak-Berechnung als ein Tag:
 * sonst ließe sich die Kurve durch mehrfaches Anlegen aufblähen.
 */
export function weeklyWorkoutDays(
  workoutDates: string[],
  today: string,
  weeks: number,
): WeekBucket[] {
  const currentWeekStart = addDays(today, -weekdayIndex(today));
  const buckets: WeekBucket[] = [];
  for (let index = weeks - 1; index >= 0; index--) {
    buckets.push({ weekStart: addDays(currentWeekStart, -7 * index), days: 0 });
  }

  const firstStart = buckets[0]?.weekStart;
  if (!firstStart) return buckets;

  for (const date of new Set(workoutDates)) {
    if (date < firstStart || date > today) continue;
    const bucket = buckets[Math.floor(daysBetween(firstStart, date) / 7)];
    if (bucket) bucket.days += 1;
  }

  return buckets;
}

/** Durchschnittliche Trainingstage pro Woche über die übergebenen Wochen. */
export function averageWorkoutDaysPerWeek(buckets: WeekBucket[]): number {
  if (buckets.length === 0) return 0;
  const total = buckets.reduce((sum, bucket) => sum + bucket.days, 0);
  return total / buckets.length;
}

/**
 * Frühestes Datum über alle Reihen hinweg – "dabei seit".
 *
 * Die Abfragen sind bewusst begrenzt (365 Gewichtseinträge, 180 Messtage, 730
 * Trainingstage); bei längerer Historie ist das der früheste *bekannte* Tag.
 * Die Seite beschriftet ihn deshalb als "Erster Eintrag", nicht als Startdatum.
 */
export function earliestEntryDate(
  weightLogs: WeightLogEntry[],
  measurements: MeasurementEntry[],
  workoutDates: string[],
): string | null {
  const candidates = [
    weightLogs[weightLogs.length - 1]?.logged_date,
    measurements[measurements.length - 1]?.loggedDate,
    workoutDates[0],
  ].filter((value): value is string => Boolean(value));

  if (candidates.length === 0) return null;
  return candidates.reduce((earliest, value) => (value < earliest ? value : earliest));
}
