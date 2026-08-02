import { Flame } from "lucide-react";
import type { StreakInfo } from "@/lib/utils/streak";
import { formatWorkoutDate } from "@/lib/utils/format";

function expiryHint(streak: StreakInfo): string {
  if (streak.daysUntilExpiry === null) return "";
  if (streak.daysUntilExpiry === 0) return "Heute ist der letzte Tag, um sie zu halten.";
  if (streak.daysUntilExpiry === 1) return "Noch 1 Tag, um sie zu halten.";
  return `Noch ${streak.daysUntilExpiry} Tage, um sie zu halten.`;
}

export function StreakCard({ streak }: { streak: StreakInfo }) {
  const active = streak.isActive && streak.current > 0;

  return (
    <section
      className={
        active
          ? "rounded-2xl bg-neutral-900 p-5 text-white"
          : "rounded-2xl border border-neutral-200 p-5"
      }
    >
      <div className="flex items-center gap-4">
        <Flame
          size={36}
          strokeWidth={1.75}
          aria-hidden
          className={active ? "text-orange-400" : "text-neutral-300"}
        />
        <div className="min-w-0 flex-1">
          <p className="text-3xl font-semibold tabular-nums">
            {streak.current}{" "}
            <span className="text-base font-normal">
              {streak.current === 1 ? "Training" : "Trainings"} in Serie
            </span>
          </p>
          <p
            className={
              active ? "mt-0.5 text-sm text-neutral-400" : "mt-0.5 text-sm text-neutral-500"
            }
          >
            {streak.lastWorkoutDate === null
              ? `Trainiere, um eine Serie zu starten. Sie hält bis zu ${streak.graceDays} Tage Pause aus.`
              : active
                ? expiryHint(streak)
                : `Serie abgelaufen – letztes Training am ${formatWorkoutDate(streak.lastWorkoutDate)}.`}
          </p>
        </div>
      </div>

      {streak.longest > 0 && (
        <p
          className={
            active
              ? "mt-3 border-t border-white/10 pt-3 text-xs text-neutral-400"
              : "mt-3 border-t border-neutral-100 pt-3 text-xs text-neutral-400"
          }
        >
          Beste Serie: {streak.longest} · Pause von bis zu {streak.graceDays} Tagen erlaubt
        </p>
      )}
    </section>
  );
}
