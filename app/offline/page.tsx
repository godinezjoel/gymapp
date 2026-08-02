import type { Metadata } from "next";

// Diese Seite wird vom Service Worker bei der Installation abgelegt und
// ausgeliefert, sobald eine Navigation am fehlenden Netz scheitert. Sie muss
// deshalb zwei Bedingungen erfüllen: statisch (sie wird ohne Server gerendert)
// und ohne Anmeldung erreichbar (middleware.ts nimmt /offline aus) – ein
// Redirect auf /login wäre offline genauso wenig ladbar.
export const metadata: Metadata = {
  title: "Offline · Fitness-Tracker",
};

export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-4 px-6 text-center">
      <div
        aria-hidden
        className="flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100 text-3xl"
      >
        ⚡
      </div>

      <h1 className="text-xl font-semibold">Keine Verbindung</h1>

      <p className="text-sm text-neutral-500">
        Die App braucht eine Internetverbindung, um deine Trainingsdaten zu laden. Sobald du wieder
        online bist, geht es hier weiter.
      </p>

      {/* Bewusst ein einfacher Link statt eines Buttons mit onClick: die Seite
          muss auch dann funktionieren, wenn offline kein JavaScript-Bundle
          geladen werden konnte. */}
      <a
        href="/"
        className="mt-2 inline-flex min-h-12 items-center rounded-full bg-neutral-900 px-6 text-base font-medium text-white active:scale-95"
      >
        Erneut versuchen
      </a>
    </main>
  );
}
