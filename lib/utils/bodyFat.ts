export type Gender = "male" | "female";

export type BodyFatInput = {
  gender: Gender;
  heightCm: number;
  neckCm: number;
  waistCm: number;
  hipCm?: number;
};

// US-Navy-Formel. Erfordert waist - neck > 0 (Männer) bzw. waist + hip - neck > 0
// (Frauen), sonst wird log10() auf einen Wert <= 0 angewendet (NaN/-Infinity) –
// das wird bereits in lib/validation/measurements.ts per Zod abgefangen.
export function calculateBodyFatPercentage({
  gender,
  heightCm,
  neckCm,
  waistCm,
  hipCm,
}: BodyFatInput): number {
  if (gender === "male") {
    return (
      495 / (1.0324 - 0.19077 * Math.log10(waistCm - neckCm) + 0.15456 * Math.log10(heightCm)) - 450
    );
  }

  const hip = hipCm ?? 0;
  return (
    495 / (1.29579 - 0.35004 * Math.log10(waistCm + hip - neckCm) + 0.221 * Math.log10(heightCm)) -
    450
  );
}
