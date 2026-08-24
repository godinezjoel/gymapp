"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { MoreVertical, type LucideIcon } from "lucide-react";
import { Actions, ActionsButton, ActionsGroup, ActionsLabel } from "konsta/react";
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
 * Überlaufmenü hinter einem ⋮-Knopf, als natives iOS-Action-Sheet (Konstas
 * `Actions`) statt einer verankerten Dropdown-Liste – dieselbe Geste wie z.B.
 * in Fotos oder Dateien: von unten einfahrend, mit eigener Abbrechen-Zeile.
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

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className={cn(
          "flex h-11 w-8 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700",
          isOpen && "bg-neutral-100 text-neutral-700",
          className,
        )}
      >
        <MoreVertical size={18} aria-hidden />
      </button>

      {/* Portal auf document.body: Konstas `Actions` ist `fixed` positioniert,
          das wirkt aber relativ zum nächsten Vorfahren mit CSS-transform
          statt zum Viewport – ohne Portal kann ein solcher Vorfahre (z.B. ein
          Navbar-right-Slot) das Blatt in seine eigene, viel zu kleine Box
          zwingen. */}
      {typeof document !== "undefined" &&
        createPortal(
          <Actions opened={isOpen} onBackdropClick={() => setIsOpen(false)}>
            <ActionsGroup>
              <ActionsLabel>{label}</ActionsLabel>
              {actions.map((action) => (
                <ActionsButton
                  key={action.label}
                  disabled={action.disabled}
                  onClick={() => {
                    setIsOpen(false);
                    action.onSelect();
                  }}
                  colors={action.destructive ? { textIos: "text-red-600" } : undefined}
                >
                  <span className="flex items-center gap-2.5">
                    <action.icon size={16} aria-hidden className="shrink-0" />
                    {action.label}
                  </span>
                </ActionsButton>
              ))}
            </ActionsGroup>
            <ActionsGroup>
              <ActionsButton bold onClick={() => setIsOpen(false)}>
                Cancel
              </ActionsButton>
            </ActionsGroup>
          </Actions>,
          document.body,
        )}
    </>
  );
}
