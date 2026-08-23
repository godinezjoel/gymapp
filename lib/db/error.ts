import "server-only";
import type { PostgrestError } from "@supabase/supabase-js";

/**
 * Supabase-Fehler in eine aussagekräftige Meldung übersetzen.
 *
 * `error.message` allein ist bei PostgREST oft nichtssagend ("" bei
 * Netzwerkfehlern, generisch bei Schemaproblemen). code/details/hint enthalten
 * das, woran man den Fehler tatsächlich erkennt – die gingen bisher verloren,
 * sodass im Stacktrace nur die deutsche Rahmenmeldung stand.
 */
export function dbError(context: string, error: PostgrestError): Error {
  const parts = [
    error.message || "Unknown database error",
    error.code && `code=${error.code}`,
    error.details && `details=${error.details}`,
    error.hint && `hint=${error.hint}`,
  ].filter(Boolean);

  return new Error(`${context}: ${parts.join(" · ")}`);
}
