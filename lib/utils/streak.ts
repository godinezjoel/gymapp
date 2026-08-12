// ============================================================================
// Trainings-Streak mit Karenzzeit.
//
// Anders als bei Duolingo zählt NICHT jeder Kalendertag. Gezählt werden
// Trainingstage; die Serie lebt weiter, solange zwischen zwei Trainings
// höchstens STREAK_GRACE_DAYS Tage liegen. Zwei Einheiten am selben Tag zählen
// als ein Tag – sonst ließe sich die Serie durch mehrfaches Anlegen aufblähen.
//
// Beispiel bei 3 Tagen Karenz: Mo -> Do -> Sa ist eine Serie von 3.
// Mo -> Fr (4 Tage Abstand) reißt ab, Fr beginnt eine neue Serie.
// ============================================================================

import { addDays, daysBetween, weekdayIndex } from "@/lib/utils/date";

// Drei Tage Pause sind erlaubt, der vierte reißt die Serie. Bewusst großzügig:
// ein Trainingsplan mit Ruhetagen (Push/Pull/Legs/Rest) soll die Serie nie
// allein durch einen eingeplanten Ruhetag verlieren.
export const STREAK_GRACE_DAYS = 3;

export type StreakInfo = {
  /** Trainingstage in der laufenden Serie (0, wenn abgelaufen). */
  current: number;
  /** Längste je erreichte Serie. */
  longest: number;
  /** Läuft die Serie noch? */
  isActive: boolean;
  lastWorkoutDate: string | null;
  /** Tage bis zum Ablauf; 0 = heute ist der letzte Tag. Null, wenn inaktiv. */
  daysUntilExpiry: number | null;
  /** Datum, bis zu dem trainiert werden muss. Null, wenn inaktiv. */
  expiresOn: string | null;
  graceDays: number;
};

const EMPTY: StreakInfo = {
  current: 0,
  longest: 0,
  isActive: false,
  lastWorkoutDate: null,
  daysUntilExpiry: null,
  expiresOn: null,
  graceDays: STREAK_GRACE_DAYS,
};

export function calculateStreak(
  workoutDates: string[],
  today: string,
  graceDays: number = STREAK_GRACE_DAYS,
): StreakInfo {
  // Doppelte Tage entfernen und aufsteigend sortieren. ISO-Daten sind
  // lexikografisch sortierbar – kein localeCompare nötig.
  const days = Array.from(new Set(workoutDates)).sort();
  if (days.length === 0) return { ...EMPTY, graceDays };

  let longest = 1;
  let run = 1;
  for (let i = 1; i < days.length; i++) {
    const gap = daysBetween(days[i - 1] as string, days[i] as string);
    // Gleicher Tag ist durch das Set bereits ausgeschlossen; alles innerhalb der
    // Karenz setzt die Serie fort, alles darüber startet eine neue.
    run = gap <= graceDays ? run + 1 : 1;
    if (run > longest) longest = run;
  }

  const lastWorkoutDate = days[days.length - 1] as string;
  const sinceLast = daysBetween(lastWorkoutDate, today);

  // Ein in der Zukunft eingetragenes Workout (sinceLast < 0) hält die Serie
  // ebenfalls am Leben – es zu bestrafen wäre für den Nutzer nicht erklärbar.
  const isActive = sinceLast <= graceDays;

  return {
    current: isActive ? run : 0,
    longest,
    isActive,
    lastWorkoutDate,
    daysUntilExpiry: isActive ? Math.max(0, graceDays - sinceLast) : null,
    expiresOn: isActive ? addDays(lastWorkoutDate, graceDays) : null,
    graceDays,
  };
}

/** Anzahl unterschiedlicher Trainingstage in der laufenden Kalenderwoche (Mo–heute). */
export function daysTrainedThisWeek(workoutDates: string[], today: string): number {
  const weekStart = addDays(today, -weekdayIndex(today));
  const uniqueDaysThisWeek = new Set(workoutDates.filter((date) => date >= weekStart && date <= today));
  return uniqueDaysThisWeek.size;
}

/**
 * Ø Trainingstage pro Woche, vom ersten Workout im Datensatz bis heute.
 * Ein einzelnes Workout ergäbe sonst z.B. "7 Tage / 1 Woche" statt eines
 * sinnvollen Schnitts – die Spanne wird deshalb nie unter eine Woche gerundet.
 */
export function averageWorkoutDaysPerWeek(workoutDates: string[], today: string): number {
  const uniqueDates = Array.from(new Set(workoutDates));
  if (uniqueDates.length === 0) return 0;

  const earliest = uniqueDates.reduce((min, date) => (date < min ? date : min));
  const weeks = Math.max(1, (daysBetween(earliest, today) + 1) / 7);
  return uniqueDates.length / weeks;
}
