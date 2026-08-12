// Epley-Formel: bei den niedrigen Wiederholungszahlen im Krafttraining (<10)
// genau genug, um Sätze mit unterschiedlicher Wiederholungszahl vergleichbar
// zu machen – sonst schlüge ein einzelner Satz mit 1 Wdh. jeden kontrollierten
// Satz mit mehr Wiederholungen, unabhängig von der tatsächlichen Kraftleistung.
export function estimateOneRepMax(weightKg: number, reps: number): number {
  if (weightKg <= 0 || reps <= 0) return 0;
  return weightKg * (1 + reps / 30);
}

/**
 * Bewegtes Gewicht bei Calisthenics: Körpergewicht + eingetragenes Zusatz-
 * /Hilfsgewicht (negativ bei Band-/Assistenzunterstützung). Ohne
 * Körpergewicht (weightKg = 0 eingetragen, kein Log vorhanden) bliebe
 * `estimateOneRepMax` sonst immer 0 – die Wiederholungen dürfen dann nicht
 * mehr zählen, obwohl sie die eigentliche Leistung sind.
 *
 * Für gewichtete Übungen unverändert das eingetragene Gewicht.
 */
export function effectiveWeightKg(
  weightKg: number,
  bodyweightKg: number | null,
  isCalisthenics: boolean,
): number {
  if (!isCalisthenics) return weightKg;
  return (bodyweightKg ?? 0) + weightKg;
}
