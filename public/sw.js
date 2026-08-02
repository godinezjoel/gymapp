// ============================================================================
// Service Worker
//
// Aufgabe hier: die App installierbar und startfähig machen – nicht, Daten
// offline verfügbar zu halten.
//
// Warum diese Grenze bewusst gezogen ist: jede Seite dieser App ist
// `force-dynamic` und wird pro Aufruf serverseitig gerendert, und das Projekt
// hat bereits einmal einen Fehler beseitigt, bei dem zwischengespeicherte
// Seiten Trainingsdaten zeigten, die es längst nicht mehr gab (daher auch
// staleTimes.dynamic = 0 in next.config.mjs). Ein Cache, der HTML oder
// RSC-Antworten aufbewahrt, würde genau diesen Fehler zurückbringen – nur
// diesmal auf dem Gerät und ohne Ablauf. Zusätzlich landeten damit
// Trainingsdaten dauerhaft im Gerätespeicher, obwohl die App bewusst hinter
// einer Passphrase liegt.
//
// Deshalb gilt:
//   Navigation    -> immer Netz. Fällt es aus, erscheint /offline.
//   Build-Assets  -> Cache zuerst (Dateinamen enthalten einen Hash, sind also
//                    unveränderlich – hier kann nichts veralten).
//   Alles andere  -> unangetastet durchgereicht. Das betrifft insbesondere
//                    RSC-Payloads und Server Actions.
//
// Was das heißt: ohne Verbindung startet die App und zeigt eine erklärende
// Seite; die zuletzt gelesenen Trainingsdaten stehen dort nicht. Dafür wäre ein
// eigener Datenspeicher samt Warteschlange für Änderungen nötig – ein eigenes
// Vorhaben, kein Nebeneffekt der Installierbarkeit.
// ============================================================================

// Beim Erhöhen wird der alte Cache beim nächsten Start verworfen. Nötig, wenn
// sich /offline oder die Icons ändern; die gehashten Build-Assets brauchen es
// nicht.
const VERSION = "v1";
const CACHE_NAME = `gymapp-${VERSION}`;

const OFFLINE_URL = "/offline";

// Ohne diese Dateien wäre die Offline-Seite unvollständig, deshalb schon bei
// der Installation holen.
const OPTIONAL_PRECACHE = ["/icons/icon-192.png", "/icons/icon.svg"];

// Unveränderlich, weil der Dateiname den Inhalt hasht bzw. die Datei sich nur
// mit einer neuen VERSION ändert.
function isImmutableAsset(url) {
  return url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/");
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      // Die Offline-Seite ist der einzige Pflichtbestandteil: fehlt sie,
      // brächte der Service Worker keinen Nutzen und soll gar nicht erst
      // installiert werden.
      await cache.add(new Request(OFFLINE_URL, { cache: "reload" }));

      // Icons einzeln und fehlertolerant: ein 404 auf ein Icon darf die
      // Installation nicht scheitern lassen (cache.addAll wäre hier alles
      // oder nichts).
      await Promise.allSettled(OPTIONAL_PRECACHE.map((path) => cache.add(path)));

      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name)),
      );

      // Ohne claim() liefe die bereits offene Seite bis zum nächsten Start
      // ohne Service Worker weiter.
      await self.clients.claim();
    })(),
  );
});

async function networkWithOfflineFallback(request) {
  try {
    return await fetch(request);
  } catch {
    const cache = await caches.open(CACHE_NAME);
    const offlinePage = await cache.match(OFFLINE_URL);
    return offlinePage ?? Response.error();
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);

  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    // Weiterleitungen und Fehlerseiten nicht ablegen – sonst friert ein
    // einmaliger 404 dauerhaft ein.
    if (response.ok) await cache.put(request, response.clone());
    return response;
  } catch {
    return Response.error();
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Server Actions sind POST. Die dürfen den Cache unter keinen Umständen
  // berühren und müssen bei fehlender Verbindung sichtbar scheitern, statt
  // stillschweigend ins Leere zu laufen.
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(networkWithOfflineFallback(request));
    return;
  }

  if (isImmutableAsset(url)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Bewusst kein respondWith: RSC-Payloads und alles Übrige gehen unverändert
  // ans Netz, als gäbe es diesen Service Worker nicht.
});
