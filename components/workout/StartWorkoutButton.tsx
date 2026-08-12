"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { CreateWorkoutForm } from "@/components/workout/CreateWorkoutForm";

/**
 * Öffnet das Anlegen-Formular als Sheet statt auf /workouts/new zu
 * navigieren – dasselbe Muster wie beim Eintragen von Gewicht oder Maßen
 * (LogEntryBar): ein Workout anzulegen ist ein kurzer Zwischenschritt, keine
 * eigene Seite wert.
 */
export function StartWorkoutButton({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children}
      </button>

      <BottomSheet open={open} onClose={() => setOpen(false)} title="Neues Workout">
        <CreateWorkoutForm />
      </BottomSheet>
    </>
  );
}
