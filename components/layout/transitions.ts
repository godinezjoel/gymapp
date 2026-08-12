// Kein next-view-transitions & Co.: die native View Transitions API deckt den
// Apple-Wechsel (Push/Pop/Tab-Crossfade, siehe globals.css) bereits ohne
// zusätzliche Abhängigkeit ab. `data-transition` auf <html> wählt die
// passenden ::view-transition-*(root)-Keyframes aus; nach Abschluss wird das
// Attribut wieder entfernt, damit eine Browser-Zurück-Geste (die nicht über
// diesen Helfer läuft) keinen stehengebliebenen Übergangstyp erbt.
export type TransitionDirection = "push" | "pop" | "tab";

export function withPageTransition(direction: TransitionDirection, run: () => void): void {
  if (typeof document === "undefined" || !document.startViewTransition) {
    run();
    return;
  }

  document.documentElement.dataset.transition = direction;
  const transition = document.startViewTransition(() => run());
  transition.finished.finally(() => {
    delete document.documentElement.dataset.transition;
  });
}
