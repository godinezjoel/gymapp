"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { MenuButton } from "@/components/ui/MenuButton";

/**
 * Überlaufmenü einer Übungskarte.
 *
 * Eigene Client-Komponente, damit ExerciseCard eine Server-Komponente bleiben
 * kann: MenuButton bekommt Rückruffunktionen und Symbolkomponenten übergeben,
 * und beides überlebt die RSC-Grenze nicht. Was hier durchgereicht wird, ist die
 * bereits gebundene Server Action – die ist serialisierbar.
 */
export function ExerciseMenu({
  exerciseName,
  onDelete,
}: {
  exerciseName: string;
  onDelete: () => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function remove() {
    if (!window.confirm(`"${exerciseName}" inklusive aller Sätze entfernen?`)) return;
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
      <MenuButton
        label={`Aktionen für ${exerciseName}`}
        className={isPending ? "opacity-40" : undefined}
        actions={[{ label: "Übung löschen", icon: Trash2, onSelect: remove, destructive: true }]}
      />
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </>
  );
}
