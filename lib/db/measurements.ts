import "server-only";
import { supabaseAdmin } from "@/lib/supabase/server";
import { calculateBodyFatPercentage } from "@/lib/utils/bodyFat";
import type { Gender } from "@/lib/validation/measurements";

export type MeasurementEntry = {
  loggedDate: string;
  heightCm: number;
  neckCm: number;
  waistCm: number;
  hipCm: number | null;
  bodyFatPct: number;
};

// Nur diese Metrik-Typen bilden einen vollständigen Rechner-Eintrag; die
// measurements-Tabelle kann (aus anderen Kontexten) weitere Typen enthalten.
const TRACKED_METRICS = ["height", "neck", "waist", "hips", "body_fat_pct"] as const;
type TrackedMetric = (typeof TRACKED_METRICS)[number];

export async function saveMeasurement(input: {
  loggedDate: string;
  gender: Gender;
  heightCm: number;
  neckCm: number;
  waistCm: number;
  hipCm?: number;
}): Promise<MeasurementEntry> {
  const bodyFatPct = calculateBodyFatPercentage(input);

  const rows: { logged_date: string; metric_type: TrackedMetric; value: number; unit: string }[] = [
    {
      logged_date: input.loggedDate,
      metric_type: "height" as const,
      value: input.heightCm,
      unit: "cm",
    },
    {
      logged_date: input.loggedDate,
      metric_type: "neck" as const,
      value: input.neckCm,
      unit: "cm",
    },
    {
      logged_date: input.loggedDate,
      metric_type: "waist" as const,
      value: input.waistCm,
      unit: "cm",
    },
    {
      logged_date: input.loggedDate,
      metric_type: "body_fat_pct" as const,
      value: bodyFatPct,
      unit: "%",
    },
  ];

  if (input.gender === "female" && input.hipCm !== undefined) {
    rows.push({
      logged_date: input.loggedDate,
      metric_type: "hips" as const,
      value: input.hipCm,
      unit: "cm",
    });
  } else {
    // Ein männlicher Eintrag am selben Tag darf keinen Hüftwert einer früheren
    // (weiblichen) Berechnung stehen lassen.
    await supabaseAdmin
      .from("measurements")
      .delete()
      .eq("logged_date", input.loggedDate)
      .eq("metric_type", "hips");
  }

  const { error } = await supabaseAdmin
    .from("measurements")
    .upsert(rows, { onConflict: "logged_date,metric_type" });

  if (error) {
    throw new Error(`Messung konnte nicht gespeichert werden: ${error.message}`);
  }

  return {
    loggedDate: input.loggedDate,
    heightCm: input.heightCm,
    neckCm: input.neckCm,
    waistCm: input.waistCm,
    hipCm: input.gender === "female" ? (input.hipCm ?? null) : null,
    bodyFatPct,
  };
}

export async function listMeasurements(): Promise<MeasurementEntry[]> {
  const { data, error } = await supabaseAdmin
    .from("measurements")
    .select("logged_date, metric_type, value")
    .in("metric_type", TRACKED_METRICS)
    .order("logged_date", { ascending: false });

  if (error) {
    throw new Error(`Messungen konnten nicht geladen werden: ${error.message}`);
  }

  const byDate = new Map<string, Partial<Record<TrackedMetric, number>>>();
  for (const row of data ?? []) {
    const entry = byDate.get(row.logged_date) ?? {};
    entry[row.metric_type as TrackedMetric] = row.value;
    byDate.set(row.logged_date, entry);
  }

  const entries: MeasurementEntry[] = [];
  for (const [loggedDate, metrics] of byDate) {
    // Unvollständige Einträge (z. B. Altdaten aus einem anderen Kontext)
    // überspringen statt kaputte Zeilen anzuzeigen.
    if (
      metrics.height === undefined ||
      metrics.neck === undefined ||
      metrics.waist === undefined ||
      metrics.body_fat_pct === undefined
    ) {
      continue;
    }

    entries.push({
      loggedDate,
      heightCm: metrics.height,
      neckCm: metrics.neck,
      waistCm: metrics.waist,
      hipCm: metrics.hips ?? null,
      bodyFatPct: metrics.body_fat_pct,
    });
  }

  entries.sort((a, b) => b.loggedDate.localeCompare(a.loggedDate));
  return entries;
}
