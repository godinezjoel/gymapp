// ============================================================================
// Datenmodell und Rotationslogik der Trainingspläne.
//
// Ein Plan ist eine geordnete Liste von Zyklustagen, die ab einem Startdatum
// endlos wiederholt wird. Jeder Tag trägt zusätzlich seine Übungsvorlage.
// Welcher Tag heute ansteht, ergibt sich rein rechnerisch – es wird nichts pro
// Kalendertag gespeichert.
//
// Die Datumsarithmetik liegt in date.ts; hier steht nur, wie sich daraus die
// Position im Zyklus ergibt.
// ============================================================================

import { daysBetween } from "@/lib/utils/date";

/** Eine Übung in der Vorlage eines Tages. NULL heißt "keine Vorgabe", nicht 0. */
export type PlanExercise = {
  id: string;
  exerciseId: string;
  exerciseName: string;
  defaultReps: number | null;
  defaultWeightKg: number | null;
};

export type PlanDay = {
  id: string;
  cycleIndex: number;
  label: string;
  isRest: boolean;
  exercises: PlanExercise[];
};

export type WorkoutPlan = {
  id: string;
  name: string;
  startDate: string;
  isActive: boolean;
  days: PlanDay[];
};

/** Kopfdaten für die Kartenliste – ohne Tage und Übungen. */
export type WorkoutPlanSummary = {
  id: string;
  name: string;
  startDate: string;
  isActive: boolean;
  dayCount: number;
};

export function toPlanSummary(plan: WorkoutPlan): WorkoutPlanSummary {
  return {
    id: plan.id,
    name: plan.name,
    startDate: plan.startDate,
    isActive: plan.isActive,
    dayCount: plan.days.length,
  };
}

/**
 * Position im Zyklus für ein Datum – der Kern des Moduls.
 * Ergebnis liegt immer in [0, cycleLength), auch für Daten vor dem Startdatum.
 */
export function cycleIndexFor(startDate: string, date: string, cycleLength: number): number {
  if (!Number.isInteger(cycleLength) || cycleLength <= 0) {
    throw new Error(`Zykluslänge muss eine positive ganze Zahl sein (war: ${cycleLength})`);
  }
  const elapsed = daysBetween(startDate, date);
  // JavaScripts % ist ein Rest, kein mathematisches Modulo: -1 % 4 ist -1, nicht 3.
  // Ohne die doppelte Korrektur würde jedes Datum vor dem Startdatum einen
  // negativen Index liefern und ins Leere greifen.
  return ((elapsed % cycleLength) + cycleLength) % cycleLength;
}

/** Der geplante Tag für ein Datum, oder null wenn der Plan keine Tage hat. */
export function planDayFor(plan: WorkoutPlan, date: string): PlanDay | null {
  if (plan.days.length === 0) return null;
  return plan.days[cycleIndexFor(plan.startDate, date, plan.days.length)] ?? null;
}

/**
 * Der Tag, aus dem ein an `date` gestartetes Workout seine Vorlage bezieht.
 *
 * Ruhetage liefern bewusst keine: wer an einem freien Tag trotzdem trainiert,
 * folgt gerade nicht dem Plan – ein aus der (versteckten) Vorlage befülltes
 * Workout wäre dort eine Überraschung. Diese Entscheidung liegt hier und nicht
 * in der Datenbankfunktion, damit sie an einer Stelle steht und prüfbar ist.
 */
export function templateDayFor(plan: WorkoutPlan | null, date: string): PlanDay | null {
  if (!plan) return null;
  const day = planDayFor(plan, date);
  return day && !day.isRest ? day : null;
}
