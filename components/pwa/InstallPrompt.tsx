"use client";

import { useEffect, useState } from "react";
import { Download, Share, SquarePlus, X } from "lucide-react";

// Chrome und Edge feuern dieses Ereignis, wenn die App installierbar ist. Es
// steht in keiner TypeScript-Standardbibliothek, weil es kein Standard ist.
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISSED_KEY = "gymapp:install-hint-dismissed";

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS meldet den Home-Bildschirm-Start bis heute nicht über display-mode,
    // sondern über diese herstellereigene Eigenschaft.
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIosSafari(): boolean {
  const ua = window.navigator.userAgent;
  const isIphone = /iphone|ipod/i.test(ua);
  // iPadOS gibt sich seit Version 13 als Macintosh aus; Touchpunkte
  // unterscheiden es vom Desktop.
  const isIpad = /ipad/i.test(ua) || (ua.includes("Macintosh") && navigator.maxTouchPoints > 1);
  if (!isIphone && !isIpad) return false;

  // Chrome, Firefox und Edge auf iOS können nicht zum Home-Bildschirm
  // hinzufügen – dort wäre die Anleitung schlicht falsch.
  return !/crios|fxios|edgios/i.test(ua);
}

/**
 * Installationshinweis.
 *
 * Zwei Wege, weil es zwei Welten gibt: Chrome liefert einen echten
 * Installationsdialog, den die App auslösen darf. Safari auf dem iPhone hat
 * dafür keine Schnittstelle – dort bleibt nur, den Weg über das Teilen-Menü zu
 * erklären. Ohne diese Erklärung findet "Zum Home-Bildschirm" praktisch
 * niemand, der nicht ohnehin weiß, dass es das gibt.
 */
export function InstallPrompt() {
  // Startet unsichtbar und wird erst im Effekt entschieden: Anzeigezustand,
  // User-Agent und localStorage existieren serverseitig nicht, jede andere
  // Vorbelegung führte zu abweichendem Markup bei der Hydration.
  const [isVisible, setIsVisible] = useState(false);
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHint, setShowIosHint] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    if (window.localStorage.getItem(DISMISSED_KEY) === "1") return;

    if (isIosSafari()) {
      setShowIosHint(true);
      setIsVisible(true);
    }

    function onBeforeInstallPrompt(event: Event) {
      // Ohne preventDefault zeigt Chrome eine eigene Leiste am unteren Rand –
      // genau dort, wo die Navigation dieser App sitzt.
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
      setIsVisible(true);
    }

    function onAppInstalled() {
      setIsVisible(false);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  function dismiss() {
    window.localStorage.setItem(DISMISSED_KEY, "1");
    setIsVisible(false);
  }

  async function install() {
    if (!installEvent) return;
    await installEvent.prompt();
    await installEvent.userChoice;
    // Der Dialog lässt sich pro Ereignis nur einmal öffnen; danach ist das
    // gespeicherte Ereignis verbraucht.
    setInstallEvent(null);
    setIsVisible(false);
  }

  if (!isVisible) return null;

  return (
    <section className="relative rounded-2xl border border-neutral-200 bg-neutral-50 p-4 pr-12">
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss hint"
        className="absolute right-1 top-1 flex h-11 w-11 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-200 hover:text-neutral-700 active:bg-neutral-200"
      >
        <X size={18} aria-hidden />
      </button>

      {installEvent ? (
        <>
          <h2 className="text-sm font-medium">Install app</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Launch as a standalone app — no browser bar, straight from your home screen.
          </p>
          <button
            type="button"
            onClick={install}
            className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-neutral-900 px-4 text-sm font-medium text-white transition-colors hover:bg-neutral-700 active:scale-95"
          >
            <Download size={16} aria-hidden />
            Install
          </button>
        </>
      ) : showIosHint ? (
        <>
          <h2 className="text-sm font-medium">Add to home screen</h2>
          <p className="mt-1 text-sm text-neutral-500">
            In Safari, tap Share at the bottom, then choose &ldquo;Add to Home Screen&rdquo;.
          </p>
          <div className="mt-3 flex items-center gap-2 text-sm text-neutral-600">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 bg-white">
              <Share size={16} aria-hidden />
            </span>
            <span aria-hidden className="text-neutral-300">
              →
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 bg-white">
              <SquarePlus size={16} aria-hidden />
            </span>
          </div>
        </>
      ) : null}
    </section>
  );
}
