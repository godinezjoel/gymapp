"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Sheet } from "konsta/react";
import { cn } from "@/lib/utils/cn";

// Muss zur Sheet-eigenen CSS-Transition passen (SheetClasses: duration-400) –
// erst danach darf das Sheet aus dem Baum genommen werden.
const ANIMATION_MS = 400;
// Gleiche Dauer/Kurve wie zuvor für die Desktop-Variante, die weiterhin von
// Hand animiert wird (Konstas Popup ist eine feste 640×640-Box und passt nicht
// zu unterschiedlich langen Formularen – siehe unten).
const DESKTOP_ANIMATION_MS = 300;

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
 * Overlay-Panel: mobil Konstas `Sheet` (von unten einfahrend, mit eigener
 * Wisch-Physik obendrauf – Konsta liefert nur Ein-/Ausblenden, kein
 * Drag-to-dismiss), ab `sm` ein von Hand animierter zentrierter Dialog.
 *
 * Konstas `Popup` wäre die naheliegende Desktop-Entsprechung, ist aber eine
 * feste 640×640-Box (siehe PopupClasses) – ungeeignet für Formulare
 * unterschiedlicher Länge (Plan-Editor vs. Übung hinzufügen). Der bisherige,
 * inhaltsgetriebene Dialog bleibt deshalb unverändert bestehen.
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
  const [isRendered, setIsRendered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [dragOffset, setDragOffset] = useState<number | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const media = window.matchMedia(SHEET_BREAKPOINT);
    setIsDesktop(media.matches);
    const onChange = (event: MediaQueryListEvent) => setIsDesktop(event.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (open) {
      setIsRendered(true);
      return;
    }
    setIsVisible(false);
    const timer = setTimeout(
      () => setIsRendered(false),
      isDesktop ? DESKTOP_ANIMATION_MS : ANIMATION_MS,
    );
    return () => clearTimeout(timer);
  }, [open, isDesktop]);

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
    if (isDesktop) return;
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

  const header = (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className="shrink-0 cursor-grab touch-none px-4 pt-3 pb-2 active:cursor-grabbing sm:cursor-default sm:px-6 sm:pt-5 sm:active:cursor-default"
    >
      <div aria-hidden className="mx-auto h-1.5 w-10 rounded-full bg-neutral-300 sm:hidden" />

      <div className="mt-3 flex items-center justify-between gap-3 sm:mt-0">
        <h2 className="text-lg font-semibold sm:text-xl">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-2xl leading-none text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 active:bg-neutral-100"
          aria-label="Close"
        >
          ×
        </button>
      </div>
    </div>
  );

  const content = (
    // overscroll-contain: am Listenende soll nicht die Seite dahinter
    // weiterscrollen.
    <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-[calc(env(safe-area-inset-bottom)+16px)] sm:px-6 sm:pb-6">
      {children}
    </div>
  );

  if (isDesktop) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className={cn(
            "absolute inset-0 bg-black/40 transition-opacity duration-300",
            isVisible ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          tabIndex={-1}
          className={cn(
            "relative flex max-h-[85vh] w-full max-w-2xl flex-col rounded-3xl bg-white shadow-2xl outline-none",
            "transition duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
            isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0",
          )}
        >
          {header}
          {content}
        </div>
      </div>
    );
  }

  return (
    <Sheet
      opened={isVisible}
      onBackdropClick={onClose}
      colors={{ bgIos: "bg-white" }}
      style={
        isDragging ? { transform: `translateY(${dragOffset}px)`, transition: "none" } : undefined
      }
      className="flex max-h-[88svh] flex-col outline-none"
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      tabIndex={-1}
    >
      {header}
      {content}
    </Sheet>
  );
}
