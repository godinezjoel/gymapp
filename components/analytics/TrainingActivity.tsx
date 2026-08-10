import { averageWorkoutDaysPerWeek, type WeekBucket } from "@/lib/utils/analytics";
import { formatShortDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

/**
 * Trainingstage der letzten Wochen als Balken.
 *
 * Bewusst kein recharts: es sind zwölf ganze Zahlen zwischen 0 und 7. Ein
 * Diagramm-Bundle dafür nachzuladen stünde in keinem Verhältnis – der Kalender
 * auf der Workouts-Seite zeigt ohnehin die einzelnen Tage, hier geht es allein
 * um den Verlauf der Häufigkeit.
 */
export function TrainingActivity({ weeks }: { weeks: WeekBucket[] }) {
  const average = averageWorkoutDaysPerWeek(weeks);
  // Immer mindestens 3 als Maßstab: bei einer einzigen Trainingswoche stünde
  // sonst ein einzelner Balken auf voller Höhe und suggerierte ein volles Pensum.
  const scale = Math.max(3, ...weeks.map((week) => week.days));

  return (
    <section className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-medium text-neutral-500">Frequenz</h2>
        <span className="text-sm text-neutral-400">{weeks.length} Wochen</span>
      </div>
      <p className="mt-1 text-3xl font-semibold tabular-nums leading-none">
        {average.toFixed(1).replace(".", ",")}
        <span className="ml-1.5 text-sm font-normal text-neutral-400">Tage/Woche</span>
      </p>

      <div className="mt-4 flex flex-1 items-end gap-2" aria-hidden>
        {weeks.map((week) => (
          // max-w begrenzt den Balken innerhalb seines Platzes: über die volle
          // Breite einer Desktop-Karte wären zwölf Balken je 70px breit und
          // sähen eher nach Klötzen als nach einem Diagramm aus.
          <div key={week.weekStart} className="flex h-28 flex-1 items-end">
            <div
              className={cn(
                "mx-auto w-full max-w-10 rounded-t-md",
                week.days > 0 ? "bg-neutral-900" : "bg-neutral-100",
              )}
              // Leere Wochen bekommen einen Stummel, damit die Woche als
              // Position erkennbar bleibt statt ganz zu verschwinden.
              style={{ height: `${Math.max(4, (week.days / scale) * 100)}%` }}
            />
          </div>
        ))}
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
