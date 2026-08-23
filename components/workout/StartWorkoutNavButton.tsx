"use client";

import { useState } from "react";
import { NavAddButton } from "@/components/layout/NavAddButton";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { CreateWorkoutForm } from "@/components/workout/CreateWorkoutForm";

/**
 * Mobile Variante von StartWorkoutButton: meldet sich wie gewohnt über
 * NavAddButton neben der Navigation an, öffnet aber ein Sheet statt zu
 * navigieren.
 */
export function StartWorkoutNavButton({ label }: { label: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <NavAddButton label={label} onClick={() => setOpen(true)} />

      <BottomSheet open={open} onClose={() => setOpen(false)} title="New workout">
        <CreateWorkoutForm />
      </BottomSheet>
    </>
  );
}
