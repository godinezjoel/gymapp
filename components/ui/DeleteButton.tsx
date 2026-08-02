"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils/cn";

// Nur der Button selbst braucht Interaktivität. Dadurch bleiben Übungskarte und
// Satzliste Server-Komponenten – ihr Markup landet nicht als React-Baum in der
// RSC-Payload und nicht im Client-Bundle.
//
// Nimmt eine fertig gebundene Server Action entgegen und weiß dadurch nichts
// über die Domäne: dasselbe Muster (nachfragen, ausführen, Fehler anzeigen)
// gilt für Übungen, Sätze und Trainingspläne.
export function DeleteButton({
  confirmMessage,
  onDelete,
  label,
  className,
  children,
}: {
  confirmMessage: string;
  onDelete: () => Promise<void>;
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    if (!window.confirm(confirmMessage)) return;
    setError(null);
    startTransition(async () => {
      try {
        // Kein router.refresh(): die Action ruft revalidatePath auf, Next liefert
        // die neue RSC-Payload mit der Action-Antwort mit.
        await onDelete();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Löschen fehlgeschlagen.");
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        aria-label={label}
        className={cn(className, isPending && "opacity-40")}
      >
        {children}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </>
  );
}
