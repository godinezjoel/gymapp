import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { env } from "@/lib/env";

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
      // Next.js patcht global fetch und cached es serverseitig, selbst auf
      // Routen mit `dynamic = "force-dynamic"` – ohne dieses explizite
      // no-store lieferten Seiten nach Datenänderungen weiterhin die alte
      // Antwort aus Next' Fetch-Cache statt frisch von Supabase zu lesen.
      fetch: (input: RequestInfo | URL, init?: RequestInit) =>
        fetch(input, { ...init, cache: "no-store" }),
    },
  },
);
