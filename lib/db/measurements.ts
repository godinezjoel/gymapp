import "server-only";
import { dbError } from "@/lib/db/error";
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

// Die Tabelle hält eine Zeile je Metrik und Tag (EAV), ein vollständiger Eintrag
// besteht also aus bis zu TRACKED_METRICS.length Zeilen. Das Limit begrenzt die
// Abfrage auf die jüngsten ~180 Messtage, statt mit jedem Jahr weiterzuwachsen.
const MAX_MEASUREMENT_DATES = 180;
const MAX_MEASUREMENT_ROWS = MAX_MEASUREMENT_DATES * TRACKED_METRICS.length;

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

  // Ein männlicher Eintrag am selben Tag darf keinen Hüftwert einer früheren
  // (weiblichen) Berechnung stehen lassen.
  const needsHipCleanup = !(input.gender === "female" && input.hipCm !== undefined);

  if (!needsHipCleanup) {
    rows.push({
      logged_date: input.loggedDate,
      metric_type: "hips" as const,
      value: input.hipCm!,
      unit: "cm",
    });
  }

  // Upsert und Hüft-Cleanup betreffen disjunkte Zeilen (der Upsert schreibt im
  // Männer-Fall nie 'hips'), sind also unabhängig voneinander – parallel statt
  // nacheinander spart einen kompletten Roundtrip auf dem Speicherpfad.
  const [upsertResult, cleanupResult] = await Promise.all([
    supabaseAdmin.from("measurements").upsert(rows, { onConflict: "logged_date,metric_type" }),
    needsHipCleanup
      ? supabaseAdmin
          .from("measurements")
          .delete()
          .eq("logged_date", input.loggedDate)
          .eq("metric_type", "hips")
      : Promise.resolve({ error: null }),
  ]);

  const error = upsertResult.error ?? cleanupResult.error;
  if (error) {
    throw dbError("Messung konnte nicht gespeichert werden", error);
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
    .order("logged_date", { ascending: false })
    .limit(MAX_MEASUREMENT_ROWS);

  if (error) {
    throw dbError("Messungen konnten nicht geladen werden", error);
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

  // Kein erneutes Sortieren: die Abfrage liefert bereits logged_date absteigend,
  // und die Map behält ihre Einfügereihenfolge bei.
  return entries;
}
