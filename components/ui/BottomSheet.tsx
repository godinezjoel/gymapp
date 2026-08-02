"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils/cn";

// Dauer muss zur Transition-Klasse unten passen: solange läuft das Sheet noch
// aus, bevor es aus dem Baum genommen wird.
const ANIMATION_MS = 300;

// Ab hier gilt eine Wischgeste als "zu": entweder weit genug gezogen oder
// schnell genug losgelassen. Nur die Distanz zu prüfen fühlt sich träge an,
// weil ein kurzer schneller Flick dann nichts bewirkt.
const DISMISS_DISTANCE_PX = 110;
const DISMISS_VELOCITY_PX_PER_MS = 0.5;

// Muss zum `sm:`-Breakpunkt unten passen: ab hier ist das Sheet ein zentrierter
// Dialog, und "nach unten wegziehen" wäre dort eine Geste ohne Entsprechung –
// mit der Maus zieht niemand ein Fenster weg, um es zu schließen.
const SHEET_BREAKPOINT = "(min-width: 640px)";

type DragState = { startY: number; startedAt: number };

/**
 * Overlay-Panel: mobil ein von unten einfahrendes Sheet, ab `sm` ein zentrierter
 * Dialog.
 *
 * Der Formfaktor wechselt mit, weil ein Bottom Sheet am Desktop über die ganze
 * Bildschirmbreite läuft: das Formular darin stünde in 1400px breiten Zeilen,
 * und der Griff zum Wegwischen zeigte auf eine Geste, die es mit der Maus nicht
 * gibt.
 *
 * Bewusst ein eigenes Panel statt <dialog showModal()>: das Sheet soll beim
 * Schließen wieder nach unten fahren, und der Ausblendeübergang eines
 * <dialog> hängt an display-Wechseln, die sich nur mit @starting-style sauber
 * animieren lassen. Der Preis ist, dass Fokus hier von Hand verwaltet wird –
 * gesetzt beim Öffnen, zurückgegeben beim Schließen.
 */
export function BottomSheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  // Zwei getrennte Zustände: `isRendered` hält das Sheet während der
  // Ausblendeanimation im Baum, `isVisible` steuert die Endposition.
  const [isRendered, setIsRendered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [dragOffset, setDragOffset] = useState<number | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      setIsRendered(true);
      return;
    }
    setIsVisible(false);
    const timer = setTimeout(() => setIsRendered(false), ANIMATION_MS);
    return () => clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!isRendered || !open) return;
    // Doppeltes requestAnimationFrame: erst nach einem vollständig gerenderten
    // Frame in der Startposition erkennt der Browser den Wechsel als Übergang.
    // Mit nur einem Frame springt das Sheet auf manchen Geräten ohne Animation.
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setIsVisible(true));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [isRendered, open]);

  // Hintergrund darf nicht mitscrollen, während das Sheet offen ist.
  useEffect(() => {
    if (!isRendered) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isRendered]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      lastFocusedRef.current?.focus();
      lastFocusedRef.current = null;
      return;
    }
    lastFocusedRef.current = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
  }, [open]);

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    // Ohne dragRef laufen onPointerMove und onPointerUp ins Leere – am Desktop
    // ist die Kopfzeile damit einfach eine Kopfzeile.
    if (window.matchMedia(SHEET_BREAKPOINT).matches) return;
    dragRef.current = { startY: event.clientY, startedAt: performance.now() };
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragOffset(0);
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag) return;
    // Nur nach unten: nach oben ziehen darf das Sheet nicht über seine
    // Endposition hinausschieben.
    setDragOffset(Math.max(0, event.clientY - drag.startY));
  }

  function onPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag) return;
    dragRef.current = null;

    const distance = Math.max(0, event.clientY - drag.startY);
    const elapsed = Math.max(1, performance.now() - drag.startedAt);
    setDragOffset(null);

    if (distance > DISMISS_DISTANCE_PX || distance / elapsed > DISMISS_VELOCITY_PX_PER_MS) {
      onClose();
    }
  }

  if (!isRendered) return null;

  const isDragging = dragOffset !== null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex flex-col justify-end sm:items-center sm:justify-center sm:p-6">
      <button
        type="button"
        aria-label="Schließen"
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-black/40 transition-opacity duration-300 motion-reduce:transition-none",
          isVisible ? "opacity-100" : "opacity-0",
        )}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        style={
          isDragging ? { transform: `translateY(${dragOffset}px)`, transition: "none" } : undefined
        }
        className={cn(
          "relative flex max-h-[88svh] w-full flex-col rounded-t-3xl bg-white shadow-2xl outline-none",
          // Ab `sm` ein freistehendes Fenster: rundum abgerundet, in der Breite
          // begrenzt und mit etwas Luft zum Bildrand (p-6 am Container).
          "sm:max-h-[85vh] sm:max-w-2xl sm:rounded-3xl",
          // Die Kurve entspricht dem, was iOS für einfahrende Sheets benutzt:
          // schnell los, weich aus.
          "transition duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
          // Mobil fährt es von unten ein, am Desktop wächst es aus der Mitte –
          // ein von unten hereinfahrendes Fenster wirkt dort wie ein Fehlgriff.
          isVisible
            ? "translate-y-0 sm:scale-100 sm:opacity-100"
            : "translate-y-full sm:translate-y-0 sm:scale-95 sm:opacity-0",
        )}
      >
        {/* Griffbereich: nur hier zieht die Geste, damit im Inhalt darunter
            weiterhin gescrollt und getippt werden kann. touch-none verhindert,
            dass der Browser die Bewegung stattdessen als Scroll auffasst. */}
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="shrink-0 cursor-grab touch-none px-4 pb-2 pt-3 active:cursor-grabbing sm:cursor-default sm:px-6 sm:pt-5 sm:active:cursor-default"
        >
          <div aria-hidden className="mx-auto h-1.5 w-10 rounded-full bg-neutral-300 sm:hidden" />

          <div className="mt-3 flex items-center justify-between gap-3 sm:mt-0">
            <h2 className="text-lg font-semibold sm:text-xl">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-2xl leading-none text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 active:bg-neutral-100"
              aria-label="Schließen"
            >
              ×
            </button>
          </div>
        </div>

        {/* overscroll-contain: am Listenende soll nicht die Seite dahinter
            weiterscrollen. */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-[calc(env(safe-area-inset-bottom)+16px)] sm:px-6 sm:pb-6">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
