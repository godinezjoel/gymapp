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

function cellClasses(day: CalendarDay, hasWorkout: boolean): string {
  return cn(
    "flex aspect-square w-full flex-col items-center justify-center gap-0.5 rounded-lg px-0.5 text-sm tabular-nums transition-colors",
    !day.isCurrentMonth && "text-neutral-300",
    day.isCurrentMonth && !hasWorkout && "text-neutral-600",
    hasWorkout && "bg-neutral-900 font-semibold text-white hover:bg-neutral-700",
    day.isToday &&
      !hasWorkout &&
      "ring-2 ring-inset ring-neutral-900 font-semibold text-neutral-900",
    day.isToday && hasWorkout && "ring-2 ring-inset ring-orange-400",
  );
}

export function WorkoutCalendar({
  monthKey,
  today,
  workouts,
}: {
  monthKey: string;
  today: string;
  workouts: WorkoutDayRef[];
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
    <section className="rounded-xl border border-neutral-200 p-3">
      <div className="mb-2 flex items-center justify-between">
        <Link
          href={`/workouts?month=${addMonths(monthKey, -1)}`}
          aria-label="Vorheriger Monat"
          className="flex h-11 w-11 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 active:bg-neutral-100"
        >
          <ChevronLeft size={20} aria-hidden />
        </Link>
        <h2 className="text-base font-medium">{formatMonthTitle(monthKey)}</h2>
        <Link
          href={`/workouts?month=${addMonths(monthKey, 1)}`}
          aria-label="Nächster Monat"
          className="flex h-11 w-11 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 active:bg-neutral-100"
        >
          <ChevronRight size={20} aria-hidden />
        </Link>
      </div>

      <div className="grid grid-cols-7 gap-1">
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
                <div key={day.date} className={cellClasses(day, false)}>
                  {day.dayOfMonth}
                </div>
              );
            }

            return (
              <Link
                key={day.date}
                href={`/workouts/${workout.id}`}
                aria-label={`Workout am ${day.date}${workout.name ? ` (${workout.name})` : ""} öffnen`}
                className={cellClasses(day, true)}
              >
                <span>{day.dayOfMonth}</span>
                {workout.name && (
                  <span className="max-w-full truncate text-[9px] font-medium leading-none text-neutral-300">
                    {workout.name}
                  </span>
                )}
              </Link>
            );
          }),
        )}
      </div>
    </section>
  );
}
