"use client";

import { ArrowLeft } from "lucide-react";
import { useAppRouter } from "@/components/layout/useAppRouter";

// Diese Seiten liegen nicht in der Hauptnavigation (Trainingsplan, neues
// Workout, Workout-Detail) – ohne eigenen Zurück-Pfeil käme man aus ihnen nur
// über die Browser-Zurück-Geste wieder heraus.
export function BackButton({ fallbackHref = "/" }: { fallbackHref?: string }) {
  const router = useAppRouter();

  return (
    <button
      type="button"
      onClick={() => {
        if (window.history.length > 1) {
          router.back();
        } else {
          router.push(fallbackHref, "pop");
        }
      }}
      aria-label="Back"
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 active:bg-neutral-100"
    >
      <ArrowLeft size={20} strokeWidth={1.75} aria-hidden />
    </button>
  );
}
