import { averageWorkoutDaysPerWeek, type WeekBucket } from "@/lib/utils/analytics";
import { formatShortDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

/**
 * Trainingstage der letzten Wochen als Balken.
 *
 * Bewusst kein recharts: es sind zwölf ganze Zahlen zwischen 0 und 7. Ein
 * Diagramm-Bundel dafür nachzuladen stünde in keinem Verhältnis – der Kalender
 * auf der Workouts-Seite zeigt ohnehin die einzelnen Tage, hier geht es allein
 * um den Verlauf der Häufigkeit.
 */
export function TrainingActivity({ weeks }: { weeks: WeekBucket[] }) {
  const average = averageWorkoutDaysPerWeek(weeks);
  // Immer mindestens 3 als Maßstab: bei einer einzigen Trainingswoche stünde
  // sonst ein einzelner Balken auf voller Höhe und suggerierte ein volles Pensum.
  const scale = Math.max(3, ...weeks.map((week) => week.days));

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-base font-semibold">Trainingsfrequenz</h3>
        <span className="text-sm tabular-nums text-neutral-500">
          ⌀ {average.toFixed(1).replace(".", ",")} / Woche
        </span>
      </div>
      <p className="mt-0.5 text-sm text-neutral-500">
        Trainingstage je Woche, letzte {weeks.length} Wochen
      </p>

      <div className="mt-4 flex items-end gap-1.5" aria-hidden>
        {weeks.map((week) => (
          <div key={week.weekStart} className="flex flex-1 flex-col items-center gap-1.5">
            <div className="flex h-24 w-full items-end">
              <div
                className={cn(
                  "w-full rounded-t-md transition-colors",
                  week.days > 0 ? "bg-neutral-900" : "bg-neutral-100",
                )}
                // Leere Wochen bekommen einen Stummel, damit die Woche als
                // Position erkennbar bleibt statt ganz zu verschwinden.
                style={{ height: `${Math.max(4, (week.days / scale) * 100)}%` }}
              />
            </div>
            <span className="text-[10px] tabular-nums text-neutral-400">{week.days}</span>
          </div>
        ))}
      </div>

      <div className="mt-1 flex justify-between text-xs text-neutral-400">
        <span>{formatShortDate(weeks[0]?.weekStart ?? "")}</span>
        <span>diese Woche</span>
      </div>

      {/* Für Screenreader ist die Balkenreihe wertlos – die Zahlen stehen
          deshalb zusätzlich als Text da. */}
      <p className="sr-only">
        {weeks
          .map((week) => `Woche ab ${formatShortDate(week.weekStart)}: ${week.days} Trainingstage`)
          .join(". ")}
      </p>
    </section>
  );
}
