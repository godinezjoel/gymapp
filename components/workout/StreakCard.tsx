import type { StreakInfo } from "@/lib/utils/streak";

// Nur dann ein Hinweistext, wenn er etwas Handlungsrelevantes sagt (Serie
// läuft heute/morgen ab). Eine gesunde, laufende Serie braucht keine Erklärung
// ihrer eigenen Regeln – die Zahl allein ist der Punkt.
function actionHint(streak: StreakInfo): string | null {
  if (!streak.isActive || streak.current === 0) return null;
  if (streak.daysUntilExpiry === 0) return "Expires today";
  if (streak.daysUntilExpiry === 1) return "Expires tomorrow";
  return null;
}

const RING_SIZE = 64;
const RING_STROKE = 6;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export function StreakCard({ streak, daysThisWeek }: { streak: StreakInfo; daysThisWeek: number }) {
  const hint = actionHint(streak);
  // Der Ring zeigt den Wochenfortschritt, nicht die Serie selbst – die Serie
  // kann trotz einer ruhigen Woche dank Karenztagen noch aktiv sein.
  const weekFraction = Math.min(1, daysThisWeek / 7);
  const ringOffset = RING_CIRCUMFERENCE * (1 - weekFraction);

  return (
    <section className="flex items-center gap-4 rounded-3xl border border-neutral-200 p-5">
      <div className="relative shrink-0" style={{ width: RING_SIZE, height: RING_SIZE }}>
        <svg
          viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
          width={RING_SIZE}
          height={RING_SIZE}
          className="-rotate-90"
          aria-hidden
        >
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth={RING_STROKE}
            className="text-neutral-200"
          />
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth={RING_STROKE}
            strokeLinecap="round"
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={ringOffset}
            className="text-emerald-500 transition-[stroke-dashoffset] duration-700 ease-out"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xl font-bold tabular-nums text-neutral-900">
          {streak.current}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-base font-semibold text-neutral-900">Day streak</p>
        <p className="mt-0.5 text-sm text-neutral-500">
          {daysThisWeek} of 7 days this week
          {streak.longest > 0 && ` · Best ${streak.longest}`}
        </p>
        {hint && <p className="mt-1 text-sm font-medium text-emerald-600">{hint}</p>}
      </div>
    </section>
  );
}
