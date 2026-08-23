"use client";

import { useEffect } from "react";
import { Button, Dialog, DialogButton } from "konsta/react";

/**
 * Zentrierter Bestätigungsdialog für zerstörerische Aktionen (Löschen etc.).
 *
 * Ersetzt window.confirm(), das auf dem Handy als hässlicher Browser-Prompt
 * erscheint und sich nicht stylen lässt. Konstas Dialog übernimmt Positionierung
 * und Ein-/Ausblenden selbst (rein CSS-getrieben über `opened`), hier bleibt nur
 * noch Escape-zum-Abbrechen übrig.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  isPending = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isPending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  return (
    <Dialog
      opened={open}
      onBackdropClick={onCancel}
      title={title}
      content={description}
      buttons={
        <>
          <DialogButton onClick={onCancel} disabled={isPending}>
            {cancelLabel}
          </DialogButton>
          {/* Button statt DialogButton: entspricht optisch exakt
              DialogButton mit strong (large, rounded, gefüllt), nur mit
              eigener Farbe – DialogButton selbst nimmt kein `colors`-Prop
              entgegen. Rot statt Schwarz, weil dieser Dialog ausschließlich
              für zerstörerische Aktionen aufgerufen wird (siehe DeleteButton)
              und Rot die native iOS-Farbe der destruktiven Alert-Aktion ist. */}
          <Button
            large
            rounded
            onClick={onConfirm}
            disabled={isPending}
            colors={{ fillBgIos: "bg-red-600 active:bg-red-700", fillTextIos: "text-white" }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    />
  );
}
