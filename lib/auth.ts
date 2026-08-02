import "server-only";

export const AUTH_COOKIE_NAME = "gymapp_session";

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Web Crypto (crypto.subtle) statt Node's crypto-Modul, damit dieselbe Funktion
// sowohl in der Server Action (Node-Runtime) als auch in der Middleware
// (Edge-Runtime) läuft, ohne zwei Implementierungen pflegen zu müssen.
export async function computeSessionToken(passphrase: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`gymapp-session-v1:${passphrase}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return bufferToHex(digest);
}

// Konstante Laufzeit unabhängig vom Übereinstimmungsgrad – verhindert, dass ein
// Timing-Angriff Passwort/Session-Token zeichenweise erraten kann.
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

// Der erwartete Token ist für eine gegebene Passphrase konstant. Die Middleware
// läuft auf jedem Request (inkl. RSC-Payloads und Prefetches) – den SHA-256 dort
// jedes Mal neu zu berechnen ist reine Wiederholung. Einmal je Isolate merken.
let cachedExpectedToken: { passphrase: string; token: string } | null = null;

async function expectedSessionToken(passphrase: string): Promise<string> {
  if (cachedExpectedToken?.passphrase === passphrase) return cachedExpectedToken.token;
  const token = await computeSessionToken(passphrase);
  cachedExpectedToken = { passphrase, token };
  return token;
}

// Fail-closed: ohne konfiguriertes APP_PASSPHRASE lässt sich niemand einloggen,
// statt die Middleware versehentlich offen zu lassen.
export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  const passphrase = process.env.APP_PASSPHRASE;
  if (!token || !passphrase) return false;
  const expected = await expectedSessionToken(passphrase);
  return timingSafeEqual(token, expected);
}
