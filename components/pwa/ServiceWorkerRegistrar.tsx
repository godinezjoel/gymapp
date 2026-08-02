"use client";

import { useEffect } from "react";

/**
 * Registriert den Service Worker – und zwar nur im Produktionsbuild.
 *
 * Im Entwicklungsbetrieb wäre er schädlich: die Build-Assets werden nach
 * Dateiname zwischengespeichert, und `next dev` erzeugt bei jeder Änderung neue
 * Bundles unter teils gleichen Pfaden. Ein aktiver Service Worker liefert dann
 * alte Chunks aus, was sich als unerklärliche Hydrationsfehler zeigt.
 *
 * Deshalb wird eine eventuell vorhandene Registrierung im Dev-Modus aktiv
 * entfernt: Produktion und Entwicklung laufen hier auf demselben Ursprung
 * (localhost), ein einmal installierter Service Worker bliebe sonst bestehen
 * und würde den Dev-Server sabotieren.
 */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) void registration.unregister();
      });
      return;
    }

    // Fehler bewusst verschlucken: ohne HTTPS (außer localhost) lehnt der
    // Browser die Registrierung ab. Die App funktioniert dann normal weiter,
    // nur eben nicht installierbar – das ist kein Grund für eine Fehlermeldung.
    void navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);

  return null;
}
