// Epley-Formel: bei den niedrigen Wiederholungszahlen im Krafttraining (<10)
// genau genug, um Sätze mit unterschiedlicher Wiederholungszahl vergleichbar
// zu machen – sonst schlüge ein einzelner Satz mit 1 Wdh. jeden kontrollierten
// Satz mit mehr Wiederholungen, unabhängig von der tatsächlichen Kraftleistung.
export function estimateOneRepMax(weightKg: number, reps: number): number {
  if (weightKg <= 0 || reps <= 0) return 0;
  return weightKg * (1 + reps / 30);
}
