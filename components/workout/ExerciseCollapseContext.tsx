"use client";

import { createContext, useContext } from "react";

/**
 * Verbindet SetRow (bestätigt einen Satz) mit ExerciseSetsPanel (klappt
 * daraufhin die Satzliste ein), ohne dass die Server-Komponente ExerciseCard
 * dazwischen etwas von der Verbindung wissen muss – Funktionen lassen sich
 * nicht als Props von einer Server- an eine Client-Komponente reichen, wohl
 * aber über einen Context, der erst innerhalb des Client-Baums entsteht.
 */
export const ExerciseCollapseContext = createContext<(() => void) | null>(null);

export function useCollapseExercise(): () => void {
  const collapse = useContext(ExerciseCollapseContext);
  return collapse ?? (() => {});
}
