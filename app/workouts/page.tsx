import Link from "next/link";
import { listWorkouts } from "@/lib/db/workouts";
import { formatWorkoutDate } from "@/lib/utils/format";

// Historie ändert sich mit jeder Aktion (neues Workout, Satz geloggt) – immer
// frisch pro Request rendern statt statisch zwischenzuspeichern.
export const dynamic = "force-dynamic";

export default async function WorkoutsPage() {
  const workouts = await listWorkouts();

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-4 px-4 pb-24 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Workouts</h1>
        <Link
          href="/workouts/new"
          className="flex min-h-11 items-center rounded-full bg-neutral-900 px-4 text-sm font-medium text-white active:scale-95"
        >
          + Neu
        </Link>
      </div>

      {workouts.length === 0 ? (
        <p className="mt-10 text-center text-sm text-neutral-500">Noch keine Workouts erfasst.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {workouts.map((workout) => (
            <li key={workout.id}>
              <Link
                href={`/workouts/${workout.id}`}
                className="flex items-center justify-between rounded-xl border border-neutral-200 px-4 py-3 active:bg-neutral-50"
              >
                <div>
                  <p className="font-medium">{formatWorkoutDate(workout.workout_date)}</p>
                  <p className="text-sm text-neutral-500">
                    {workout.exerciseCount} {workout.exerciseCount === 1 ? "Übung" : "Übungen"} ·{" "}
                    {workout.setCount} {workout.setCount === 1 ? "Satz" : "Sätze"}
                  </p>
                </div>
                <span aria-hidden className="text-neutral-300">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
