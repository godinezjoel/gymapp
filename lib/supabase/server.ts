import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { env } from "@/lib/env";

// Next.js patcht global fetch und cached es serverseitig, selbst auf Routen mit
// `dynamic = "force-dynamic"` – ohne dieses explizite no-store lieferten Seiten
// nach Datenänderungen weiterhin die alte Antwort aus Next' Fetch-Cache statt
// frisch von Supabase zu lesen.
function uncachedFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  return fetch(input, { ...init, cache: "no-store" });
}

// Supabase löst den sb_secret_-Key serverseitig in ein kurzlebiges JWT auf.
// Geht die Uhr des ausstellenden Dienstes einen Sekundenbruchteil vor der des
// prüfenden Gateways, wird das eben erst ausgestellte Token als "JWT issued at
// future" abgelehnt. Das trifft sporadisch einzelne Requests: von zwei
// parallelen Abfragen derselben Seite kam eine mit 200 zurück, die andere
// 15 ms später mit 401.
const CLOCK_SKEW_RETRY_DELAY_MS = 300;

function isClockSkewRejection(body: string): boolean {
  return body.includes("issued at future");
}

// Ein solcher 401 entsteht vor der Datenbank – die Anfrage wurde nie
// ausgeführt. Ein einzelner Retry ist deshalb auch für Schreibzugriffe
// gefahrlos und nicht doppelt wirksam. Schlägt er erneut fehl, liegt kein
// Uhrenversatz mehr vor und der Fehler soll sichtbar werden.
async function fetchWithClockSkewRetry(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const response = await uncachedFetch(input, init);
  if (response.status !== 401) return response;

  // Der Body lässt sich nur einmal lesen; für den Normalfall wird die Antwort
  // aus dem gelesenen Text neu aufgebaut und unverändert durchgereicht.
  const body = await response.text();
  if (!isClockSkewRejection(body)) {
    return new Response(body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  }

  await new Promise((resolve) => setTimeout(resolve, CLOCK_SKEW_RETRY_DELAY_MS));
  return uncachedFetch(input, init);
}

// Serverseitiger Supabase-Client mit dem service_role Key (ADR-03): der Browser
// spricht nie direkt mit Supabase, es gibt daher keine Session zum Persistieren.
export const supabaseAdmin = createClient<Database>(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      fetch: fetchWithClockSkewRetry,
    },
  },
);
