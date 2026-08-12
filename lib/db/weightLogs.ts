import "server-only";
import { dbError } from "@/lib/db/error";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { WeightLog } from "@/types";

// Die UI liest nur diese drei Spalten (Verlaufsliste, Trend, Chart) – notes und
// created_at gingen bei jedem Seitenaufruf mit über die Leitung, ohne je
// gerendert zu werden.
export type WeightLogEntry = Pick<WeightLog, "id" | "logged_date" | "weight_kg">;

// Ein Eintrag pro Tag: ein Jahr Historie deckt Chart und Verlaufsliste ab, ohne
// dass die Abfrage mit den Jahren unbegrenzt weiterwächst.
const MAX_WEIGHT_LOGS = 365;

export async function listWeightLogs(): Promise<WeightLogEntry[]> {
  const { data, error } = await supabaseAdmin
    .from("weight_logs")
    .select("id, logged_date, weight_kg")
    .order("logged_date", { ascending: false })
    .limit(MAX_WEIGHT_LOGS);

  if (error) {
    throw dbError("Gewichtsverlauf konnte nicht geladen werden", error);
  }
  return data ?? [];
}

/**
 * Aktuellstes geloggtes Körpergewicht – Grundlage der Calisthenics-Rekorde
 * (effectiveWeightKg): dort zählt Körpergewicht + Zusatzgewicht, nicht nur
 * das eingetragene Zusatzgewicht allein.
 */
export async function getLatestBodyweight(): Promise<number | null> {
  const { data, error } = await supabaseAdmin
    .from("weight_logs")
    .select("weight_kg")
    .order("logged_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw dbError("Aktuelles Körpergewicht konnte nicht geladen werden", error);
  }
  return data?.weight_kg ?? null;
}

export async function saveWeightLog(loggedDate: string, weightKg: number): Promise<void> {
  // Ein Eintrag pro Tag (weight_logs_one_per_day) – ein zweites Speichern für
  // dasselbe Datum überschreibt den bestehenden Wert, statt einen Fehler zu werfen.
  // Kein .select(): der Aufrufer verwirft die zurückgelesene Zeile ohnehin.
  const { error } = await supabaseAdmin
    .from("weight_logs")
    .upsert({ logged_date: loggedDate, weight_kg: weightKg }, { onConflict: "logged_date" });

  if (error) {
    throw dbError("Gewicht konnte nicht gespeichert werden", error);
  }
}
