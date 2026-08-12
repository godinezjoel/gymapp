import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  addMonths,
  buildMonthGrid,
  formatMonthTitle,
  WEEKDAY_LABELS,
  type CalendarDay,
} from "@/lib/utils/calendar";
import type { WorkoutDayRef } from "@/lib/db/workouts";
import { cn } from "@/lib/utils/cn";

const DAY_CLASS =
  "mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium tabular-nums transition-colors sm:h-10 sm:w-10";

function dayClasses(day: CalendarDay, hasWorkout: boolean): string {
  return cn(
    DAY_CLASS,
    !day.isCurrentMonth && "text-neutral-300",
    day.isCurrentMonth && !hasWorkout && !day.isToday && "text-neutral-700",
    hasWorkout && "bg-emerald-500 text-white hover:bg-emerald-600 active:scale-95",
    day.isToday && !hasWorkout && "font-semibold text-neutral-900 ring-2 ring-inset ring-neutral-900",
    day.isToday && hasWorkout && "ring-2 ring-neutral-900 ring-offset-2 ring-offset-white",
  );
}

export function WorkoutCalendar({
  monthKey,
  today,
  workouts,
  basePath = "/",
}: {
  monthKey: string;
  today: string;
  workouts: WorkoutDayRef[];
  basePath?: string;
}) {
  // Ein Tag kann mehrere Workouts haben – für die Zelle zählt das erste als
  // Sprungziel, markiert wird der Tag ohnehin nur einmal.
  const workoutByDate = new Map<string, WorkoutDayRef>();
  for (const workout of workouts) {
    if (!workoutByDate.has(workout.workout_date)) {
      workoutByDate.set(workout.workout_date, workout);
    }
  }

  const weeks = buildMonthGrid(monthKey, today);

  return (
    <section className="rounded-3xl border border-neutral-200 p-4">
      <div className="mb-2 flex items-center justify-between">
        <Link
          href={`${basePath}?month=${addMonths(monthKey, -1)}`}
          aria-label="Vorheriger Monat"
          className="flex h-11 w-11 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 active:bg-neutral-100"
        >
          <ChevronLeft size={20} strokeWidth={1.75} aria-hidden />
        </Link>
        <h2 className="text-base font-semibold text-neutral-900">{formatMonthTitle(monthKey)}</h2>
        <Link
          href={`${basePath}?month=${addMonths(monthKey, 1)}`}
          aria-label="Nächster Monat"
          className="flex h-11 w-11 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 active:bg-neutral-100"
        >
          <ChevronRight size={20} strokeWidth={1.75} aria-hidden />
        </Link>
      </div>

      <div className="grid grid-cols-7 gap-y-1.5">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="pb-1 text-center text-xs font-medium text-neutral-400">
            {label}
          </div>
        ))}

        {weeks.map((week) =>
          week.map((day) => {
            const workout = workoutByDate.get(day.date);

            if (!workout) {
              return (
                <div key={day.date} className={dayClasses(day, false)}>
                  {day.dayOfMonth}
                </div>
              );
            }

            return (
              <Link
                key={day.date}
                href={`/workouts/${workout.id}`}
                aria-label={`Workout am ${day.date}${workout.name ? ` (${workout.name})` : ""} öffnen`}
                className={dayClasses(day, true)}
              >
                {day.dayOfMonth}
              </Link>
            );
          }),
        )}
      </div>
    </section>
  );
}
