"use client";

// Ohne diese Grenze eskaliert jeder Fehler aus den lib/db-Funktionen bis zur
// Wurzel und leert die gesamte App. Hier bleibt die Navigation erhalten und der
// Fehler ist ohne Neuladen wiederholbar.
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-4 px-6 pb-24 text-center">
      <h1 className="text-xl font-semibold">Etwas ist schiefgelaufen</h1>
      <p className="text-sm text-neutral-500">
        Die Daten konnten nicht geladen werden. Bitte erneut versuchen.
      </p>
      <button
        type="button"
        onClick={reset}
        className="min-h-11 rounded-lg bg-neutral-900 px-6 text-base font-medium text-white transition-colors hover:bg-neutral-700 active:scale-[0.98]"
      >
        Erneut versuchen
      </button>
    </main>
  );
}
