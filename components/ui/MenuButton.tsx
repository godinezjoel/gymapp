"use client";

import { useEffect, useRef, useState } from "react";
import { MoreVertical, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type MenuAction = {
  label: string;
  icon: LucideIcon;
  onSelect: () => void;
  disabled?: boolean;
  /** Rot eingefärbt und ans Ende gesetzt – für Löschen und Ähnliches. */
  destructive?: boolean;
};

/**
 * Überlaufmenü hinter einem ⋮-Knopf.
 *
 * Ersetzt Reihen aus einzelnen Symbolknöpfen: drei bis vier Aktionen nebeneinander
 * fressen in einer Zeile mehr Platz als der Inhalt, den sie betreffen, und ohne
 * Beschriftung bleibt „Pfeil nach oben“ eine Vermutung. Im Menü hat jede Aktion
 * ihren Namen.
 */
export function MenuButton({
  label,
  actions,
  className,
}: {
  label: string;
  actions: MenuAction[];
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const firstActionRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Fokus ins Menü, damit es auch per Tastatur bedienbar ist.
    firstActionRef.current?.focus();

    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      // In der Capture-Phase und mit gestoppter Weitergabe: das umgebende
      // BottomSheet hört Escape ebenfalls auf document ab und wurde vorher
      // registriert. Ohne diesen Vorgriff schlösse Escape im Menü gleich den
      // ganzen Editor – samt ungespeicherter Eingaben.
      event.stopPropagation();
      setIsOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={cn("relative shrink-0", className)}>
      <button
        type="button"
        onClick={() => setIsOpen((previous) => !previous)}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className={cn(
          "flex h-11 w-8 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700",
          isOpen && "bg-neutral-100 text-neutral-700",
        )}
      >
        <MoreVertical size={18} aria-hidden />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label={label}
          className="absolute right-0 top-full z-20 mt-1 min-w-44 overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 shadow-lg shadow-black/10"
        >
          {actions.map((action, index) => (
            <button
              key={action.label}
              ref={index === 0 ? firstActionRef : undefined}
              type="button"
              role="menuitem"
              disabled={action.disabled}
              onClick={() => {
                setIsOpen(false);
                action.onSelect();
              }}
              className={cn(
                "flex min-h-11 w-full items-center gap-2.5 px-3 text-left text-sm transition-colors",
                "disabled:opacity-40 disabled:hover:bg-transparent",
                action.destructive
                  ? "text-red-600 hover:bg-red-50"
                  : "text-neutral-700 hover:bg-neutral-100",
              )}
            >
              <action.icon size={16} aria-hidden className="shrink-0" />
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
