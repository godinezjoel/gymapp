import { cn } from "@/lib/utils/cn";

/**
 * Eine Kennzahl als Kachel: großer Wert, Beschriftung, optionaler Zusatz.
 *
 * `tone` färbt nur den Zusatz ein. Bewusst nicht den Wert selbst: ob ein
 * Gewichtsminus gut oder schlecht ist, hängt vom Ziel ab, und die App kennt das
 * Ziel nicht. Grün und Rot stehen deshalb nur dort, wo die Richtung eindeutig
 * ist (laufende Serie ja/nein).
 */
export function StatTile({
  label,
  value,
  hint,
  tone = "neutral",
  className,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "neutral" | "positive" | "muted";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl border border-neutral-200 bg-white p-4 transition-colors hover:border-neutral-300",
        className,
      )}
    >
      <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">{label}</span>
      <span className="mt-2 text-2xl font-semibold tabular-nums leading-none">{value}</span>
      {hint && (
        <span
          className={cn(
            "mt-1.5 text-xs tabular-nums",
            tone === "positive" && "text-emerald-600",
            tone === "muted" && "text-neutral-400",
            tone === "neutral" && "text-neutral-500",
          )}
        >
          {hint}
        </span>
      )}
    </div>
  );
}
