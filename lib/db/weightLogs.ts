import "server-only";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { WeightLog } from "@/types";

export async function listWeightLogs(): Promise<WeightLog[]> {
  const { data, error } = await supabaseAdmin
    .from("weight_logs")
    .select("*")
    .order("logged_date", { ascending: false });

  if (error) {
    throw new Error(`Gewichtsverlauf konnte nicht geladen werden: ${error.message}`);
  }
  return data ?? [];
}

export async function saveWeightLog(loggedDate: string, weightKg: number): Promise<WeightLog> {
  // Ein Eintrag pro Tag (weight_logs_one_per_day) – ein zweites Speichern für
  // dasselbe Datum überschreibt den bestehenden Wert, statt einen Fehler zu werfen.
  const { data, error } = await supabaseAdmin
    .from("weight_logs")
    .upsert({ logged_date: loggedDate, weight_kg: weightKg }, { onConflict: "logged_date" })
    .select()
    .single();

  if (error) {
    throw new Error(`Gewicht konnte nicht gespeichert werden: ${error.message}`);
  }
  return data;
}
