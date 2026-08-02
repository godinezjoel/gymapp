"use client";

import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils/cn";

/**
 * Absende-Button für Formulare, die direkt eine Server Action aufrufen.
 *
 * Muss eine eigene Client-Komponente sein: useFormStatus liest den Status des
 * umgebenden <form>, kann also nicht in derselben Komponente stehen, die das
 * Formular rendert. Dadurch bleibt die Karte drumherum eine Server-Komponente.
 */
export function SubmitButton({
  children,
  pendingLabel,
  className,
}: {
  children: React.ReactNode;
  pendingLabel: string;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className={cn(className, pending && "opacity-60")}>
      {pending ? pendingLabel : children}
    </button>
  );
}
