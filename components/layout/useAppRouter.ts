"use client";

import { useRouter } from "next/navigation";
import { withPageTransition, type TransitionDirection } from "@/components/layout/transitions";

/**
 * `useRouter()`, dessen `push`/`back` programmatische Navigation (Sheets, die
 * sich schließen und weiterleiten; "Fertig"-Knöpfe etc.) in denselben
 * Seitenübergang wie AppLink einpackt.
 */
export function useAppRouter() {
  const router = useRouter();

  return {
    ...router,
    push: (href: string, direction: TransitionDirection = "push") => {
      withPageTransition(direction, () => router.push(href));
    },
    back: (direction: TransitionDirection = "pop") => {
      withPageTransition(direction, () => router.back());
    },
  };
}
