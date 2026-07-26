import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Kombiniert bedingte Klassennamen (clsx) und löst widersprüchliche
// Tailwind-Utilities zugunsten der zuletzt angegebenen auf (tailwind-merge).
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
