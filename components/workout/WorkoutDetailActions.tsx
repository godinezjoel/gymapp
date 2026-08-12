"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Pencil, Trash2 } from "lucide-react";
import { deleteWorkoutAction } from "@/actions/workouts";
import type { WorkoutDetail } from "@/lib/db/workouts";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { EditWorkoutSheet } from "@/components/workout/EditWorkoutSheet";

/**
 * Kopfzeilen-Aktionen der Workout-Detailseite: bearbeiten (Sheet mit allen
 * Sätzen), löschen (führt zurück zum Kalender, da die Seite danach nicht mehr
 * existiert) und fertig (reine Bestätigung – Sätze speichern schon beim
 * Eintragen automatisch, siehe SetRow).
 */
export function WorkoutDetailActions({ workout }: { workout: WorkoutDetail }) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);

  return (
    <>
      <div className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          onClick={() => setIsEditOpen(true)}
          aria-label="Workout bearbeiten"
          className="flex h-11 w-11 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 active:bg-neutral-100"
        >
          <Pencil size={18} strokeWidth={1.75} aria-hidden />
        </button>

        <DeleteButton
          confirmMessage="Workout löschen? Alle Übungen und Sätze gehen dabei verloren."
          onDelete={async () => {
            await deleteWorkoutAction(workout.id);
            router.push("/workouts");
          }}
          label="Workout löschen"
          className="flex h-11 w-11 items-center justify-center rounded-full text-red-500 transition-colors hover:bg-red-50 active:opacity-60"
        >
          <Trash2 size={18} strokeWidth={1.75} aria-hidden />
        </DeleteButton>

        {/* Text-Label nur ab `sm`: im mobilen Navbar-right-Slot (siehe
            PageHeader) ist neben Titel und den beiden Icon-Knöpfen daneben
            kein Platz für eine dritte, beschriftete Pille. */}
        <Link
          href="/workouts"
          aria-label="Fertig"
          className="flex h-11 items-center gap-1.5 rounded-full bg-neutral-900 px-3 text-sm font-medium text-white transition-colors hover:bg-neutral-700 active:scale-95 md:px-4"
        >
          <Check size={16} strokeWidth={2.5} aria-hidden />
          <span className="hidden md:inline">Fertig</span>
        </Link>
      </div>

      <BottomSheet
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Workout bearbeiten"
      >
        <EditWorkoutSheet workout={workout} onSaved={() => setIsEditOpen(false)} />
      </BottomSheet>
    </>
  );
}
