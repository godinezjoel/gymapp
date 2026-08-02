"use client";

import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

type DragSession = {
  index: number;
  pointerOriginY: number;
  /** Zuletzt gerenderte Verschiebung – siehe Erklärung in onPointerMove. */
  appliedOffset: number;
};

/**
 * Umsortieren einer Liste per Ziehgriff.
 *
 * Bewusst auf Pointer-Events statt auf die HTML5-Drag-and-Drop-Schnittstelle:
 * letztere feuert auf Touchgeräten überhaupt nicht, und diese App läuft in
 * erster Linie als PWA auf dem Handy.
 *
 * Sortiert währenddessen live um, statt die Zielposition erst beim Loslassen zu
 * bestimmen: die gezogene Karte bleibt unter dem Finger, die übrigen rücken
 * sofort auf. Nach jedem Tausch verschiebt sich die Ruheposition der gezogenen
 * Karte um die Höhe der getauschten Nachbarin – `pointerOriginY` wird deshalb um
 * genau diesen Betrag nachgeführt, sonst spränge die Karte bei jedem Tausch.
 *
 * Die Griffe sind für die Tastatur unerreichbar; die Reihenfolge muss deshalb
 * zusätzlich über beschriftete Aktionen änderbar bleiben (siehe das ⋮-Menü in
 * PlanDayFields).
 */
export function useDragReorder({ onMove }: { onMove: (from: number, to: number) => void }) {
  const listRef = useRef<HTMLUListElement>(null);
  const sessionRef = useRef<DragSession | null>(null);

  // Zusätzlich zum Ref als State, weil Position und Hervorhebung der gezogenen
  // Karte davon abhängen und neu gerendert werden müssen.
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);

  function itemAt(index: number): HTMLElement | undefined {
    return listRef.current?.children[index] as HTMLElement | undefined;
  }

  function onPointerDown(index: number, event: ReactPointerEvent<HTMLElement>) {
    // Verhindert, dass der Browser stattdessen Text markiert oder das Symbol
    // als Bild aufnimmt.
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    sessionRef.current = { index, pointerOriginY: event.clientY, appliedOffset: 0 };
    setDragIndex(index);
    setDragOffset(0);
  }

  function onPointerMove(event: ReactPointerEvent<HTMLElement>) {
    const session = sessionRef.current;
    if (!session) return;

    const dragged = itemAt(session.index);
    if (!dragged) return;

    // getBoundingClientRect liefert die Lage aus dem zuletzt gerenderten Frame,
    // also mit der Verschiebung des vorigen pointermove. Wird direkt damit
    // gerechnet, hinkt die Tauscherkennung dem Finger um ein Ereignis hinterher.
    // Deshalb erst die Ruhelage zurückrechnen und dann die aktuelle Verschiebung
    // aufschlagen – das Ergebnis stimmt unabhängig davon, was schon gemalt ist.
    const draggedRect = dragged.getBoundingClientRect();
    const restingTop = draggedRect.top - session.appliedOffset;
    const draggedCenter =
      restingTop + (event.clientY - session.pointerOriginY) + draggedRect.height / 2;

    // Höchstens ein Tausch pro Ereignis: die Nachbarmaße stammen aus dem noch
    // nicht neu gerenderten Baum und wären danach überholt.
    const next = itemAt(session.index + 1);
    const previous = itemAt(session.index - 1);

    let hasSwapped = false;

    if (next) {
      const rect = next.getBoundingClientRect();
      if (draggedCenter > rect.top + rect.height / 2) {
        onMove(session.index, session.index + 1);
        session.index += 1;
        session.pointerOriginY += rect.height;
        hasSwapped = true;
      }
    }

    if (previous && !hasSwapped) {
      const rect = previous.getBoundingClientRect();
      if (draggedCenter < rect.top + rect.height / 2) {
        onMove(session.index, session.index - 1);
        session.index -= 1;
        session.pointerOriginY -= rect.height;
      }
    }

    session.appliedOffset = event.clientY - session.pointerOriginY;
    setDragIndex(session.index);
    setDragOffset(session.appliedOffset);
  }

  function onPointerUp() {
    if (!sessionRef.current) return;
    sessionRef.current = null;
    setDragIndex(null);
    setDragOffset(0);
  }

  /** Auf das Element mit dem Ziehgriff anwenden. */
  function handleProps(index: number) {
    return {
      onPointerDown: (event: ReactPointerEvent<HTMLElement>) => onPointerDown(index, event),
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
    };
  }

  return { listRef, dragIndex, dragOffset, handleProps };
}
