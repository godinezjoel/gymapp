import "server-only";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { env } from "@/lib/env";

// Modulweiter Cache: jose holt den Schlüsselsatz einmal und hält ihn vor,
// erneuert ihn nur bei Bedarf (z.B. unbekannte kid). Damit kostet die
// Signaturprüfung selbst keinen Netzwerk-Roundtrip mehr pro Request – anders
// als supabase.auth.getUser(), das bei jedem Aufruf gegen den Auth-Server geht.
const JWKS = createRemoteJWKSet(
  new URL("/auth/v1/.well-known/jwks.json", env.NEXT_PUBLIC_SUPABASE_URL),
);

// Nur die Signatur und den Ablauf zu prüfen reicht für das Routing-Gate in der
// Middleware: sie sagt nichts darüber aus, ob der Nutzer zwischenzeitlich
// gesperrt wurde. Für eine Single-User-App mit deaktivierten Sign-ups ist das
// hinnehmbar; sollte sich das ändern, bräuchte es wieder eine autoritative
// Prüfung gegen Supabase.
export async function isValidAccessToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, JWKS);
    return true;
  } catch {
    return false;
  }
}
