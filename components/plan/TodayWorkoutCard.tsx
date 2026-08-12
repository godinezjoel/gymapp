import Link from "next/link";
import { createWorkoutAction } from "@/actions/workouts";
import { getExerciseRecord } from "@/lib/db/workouts";
import { cycleIndexFor, type WorkoutPlan } from "@/lib/utils/cycle";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { TodayExercisesDisclosure } from "@/components/plan/TodayExercisesDisclosure";
import { StartWorkoutButton } from "@/components/workout/StartWorkoutButton";

// Server-Komponente: reine Anzeige plus die Rekord-Abfragen für die
// aufklappbare Übungsliste. Interaktiv ist nur der Absende-Button und das
// Aufklappen selbst, beide stecken in eigenen Client-Komponenten.
//
// Bewusst knapp gehalten: der Punkt auf dem Dashboard ist "was steht heute
// an", nicht der volle Trainingsplan-Kontext (Zyklustag, Planname) – der
// steht im Trainingsplan selbst.
export async function TodayWorkoutCard({ plan, today }: { plan: WorkoutPlan | null; today: string }) {
  if (!plan || plan.days.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-neutral-300 p-6 text-center">
        <p className="text-sm text-neutral-500">Noch kein aktiver Trainingsplan.</p>
        <Link
          href="/workouts?tab=plaene"
          className="mt-3 inline-flex min-h-11 items-center rounded-full bg-neutral-900 px-5 text-sm font-medium text-white transition-colors hover:bg-neutral-700 active:scale-95"
        >
          Plan einrichten
        </Link>
      </section>
    );
  }

  const index = cycleIndexFor(plan.startDate, today, plan.days.length);
  const day = plan.days[index];
  if (!day) return null;

  if (day.isRest) {
    return (
      <section className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
        <h2 className="text-4xl font-semibold tracking-tight">{day.label}</h2>
        <p className="mt-2 text-sm text-neutral-600">Ruhetag – heute steht keine Einheit an.</p>
        <StartWorkoutButton className="mt-4 inline-flex min-h-11 items-center rounded-lg text-sm text-neutral-500 underline underline-offset-2 transition-colors hover:text-neutral-900">
          Trotzdem ein Workout erfassen
        </StartWorkoutButton>
      </section>
    );
  }

  // Unabhängige Abfragen: parallel statt nacheinander.
  const records = await Promise.all(day.exercises.map((exercise) => getExerciseRecord(exercise.exerciseId)));
  const exercises = day.exercises.map((exercise, i) => ({
    id: exercise.id,
    exerciseName: exercise.exerciseName,
    record: records[i]?.weight_kg != null && records[i]?.reps != null
      ? { weightKg: records[i]!.weight_kg as number, reps: records[i]!.reps as number }
      : null,
  }));

  return (
    <section className="rounded-2xl bg-neutral-900 p-6 text-white">
      <h2 className="text-4xl font-semibold tracking-tight">{day.label}</h2>

      <TodayExercisesDisclosure exercises={exercises} variant="dark" />

      {/* Gebundene Server Action statt Client-Handler: der Knopf braucht kein
          eigenes JavaScript, und createWorkoutAction leitet nach dem Anlegen
          selbst auf das neue Workout weiter. */}
      <form action={createWorkoutAction.bind(null, { workoutDate: today })}>
        <SubmitButton
          pendingLabel="Wird gestartet…"
          className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-white px-5 text-base font-medium text-neutral-900 transition-colors hover:bg-neutral-200 active:scale-[0.98]"
        >
          Workout starten
        </SubmitButton>
      </form>
    </section>
  );
}

// Gleiche Grundabmessungen wie die Karte – als Suspense-Fallback, damit beim
// Laden nichts springt.
export function TodayWorkoutCardSkeleton() {
  return <div aria-hidden className="h-[208px] animate-pulse rounded-2xl bg-neutral-100" />;
}
