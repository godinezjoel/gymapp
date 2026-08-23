"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { MenuButton } from "@/components/ui/MenuButton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

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
  const [confirmOpen, setConfirmOpen] = useState(false);

  function remove() {
    setConfirmOpen(false);
    setError(null);
    startTransition(async () => {
      try {
        // Kein router.refresh(): die Action ruft revalidatePath auf, Next liefert
        // die neue RSC-Payload mit der Action-Antwort mit.
        await onDelete();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Delete failed.");
      }
    });
  }

  return (
    <>
      <MenuButton
        label={`Actions for ${exerciseName}`}
        className={isPending ? "opacity-40" : undefined}
        actions={[
          { label: "Delete exercise", icon: Trash2, onSelect: () => setConfirmOpen(true), destructive: true },
        ]}
      />
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <ConfirmDialog
        open={confirmOpen}
        title="Remove exercise?"
        description={`"${exerciseName}" will be removed along with all its sets.`}
        isPending={isPending}
        onConfirm={remove}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
