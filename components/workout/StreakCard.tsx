import { Flame } from "lucide-react";
import type { StreakInfo } from "@/lib/utils/streak";

// Nur dann ein Hinweistext, wenn er etwas Handlungsrelevantes sagt (Serie
// läuft heute/morgen ab). Eine gesunde, laufende Serie braucht keine Erklärung
// ihrer eigenen Regeln – die Zahl allein ist der Punkt.
function actionHint(streak: StreakInfo): string | null {
  if (!streak.isActive || streak.current === 0) return null;
  if (streak.daysUntilExpiry === 0) return "Läuft heute ab";
  if (streak.daysUntilExpiry === 1) return "Läuft morgen ab";
  return null;
}

export function StreakCard({ streak }: { streak: StreakInfo }) {
  const active = streak.isActive && streak.current > 0;
  const hint = actionHint(streak);
  const hasRecord = active && streak.longest > streak.current;

  if (!active) {
    return (
      <section className="rounded-2xl border border-neutral-200 p-5">
        <div className="flex items-center gap-4">
          <Flame size={36} strokeWidth={1.75} aria-hidden className="text-neutral-300" />
          <div className="min-w-0 flex-1">
            <p className="text-3xl font-semibold tabular-nums">
              {streak.current} <span className="text-base font-normal">Serie</span>
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-900 to-orange-950 p-5 text-white shadow-[0_0_45px_-12px_rgba(251,146,60,0.55)] ring-1 ring-orange-500/25">
      {/* Glühende Blobs im Hintergrund – reines Dekor, deshalb aria-hidden. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-orange-500/30 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-14 -left-8 h-32 w-32 rounded-full bg-red-500/20 blur-3xl"
      />

      <div className="relative flex items-center gap-4">
        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center">
          <span
            aria-hidden
            className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400/30"
          />
          <Flame
            size={40}
            strokeWidth={1.75}
            aria-hidden
            className="relative animate-flame-flicker text-orange-400 drop-shadow-[0_0_14px_rgba(251,146,60,0.85)]"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="bg-gradient-to-r from-orange-300 via-amber-200 to-yellow-100 bg-clip-text text-4xl font-bold tabular-nums text-transparent">
            {streak.current} <span className="text-base font-normal text-orange-100/80">Serie</span>
          </p>
          {hint && <p className="mt-0.5 text-sm font-medium text-orange-300">{hint}</p>}
          {hasRecord && <p className="mt-1 text-xs text-neutral-400">Rekord: {streak.longest}</p>}
        </div>
      </div>
    </section>
  );
}
