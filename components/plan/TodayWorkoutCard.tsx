import Link from "next/link";
import { createWorkoutAction } from "@/actions/workouts";
import { cycleIndexFor, type WorkoutPlan } from "@/lib/utils/cycle";
import { formatWorkoutDate } from "@/lib/utils/format";
import { SubmitButton } from "@/components/ui/SubmitButton";

// Server-Komponente: reine Anzeige. Interaktiv ist nur der Absende-Button, und
// der steckt in einer eigenen Client-Komponente.
//
// Zeigt bewusst nur den heutigen Tag, nicht dessen Übungen: die stehen im
// Trainingsplan und nach dem Start im Workout selbst. Auf dem Dashboard geht
// es allein um die Frage, was heute ansteht.
export function TodayWorkoutCard({ plan, today }: { plan: WorkoutPlan | null; today: string }) {
  if (!plan || plan.days.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-neutral-300 p-6 text-center">
        <p className="text-sm text-neutral-500">Noch kein aktiver Trainingsplan.</p>
        <Link
          href="/workoutplan"
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
        <p className="text-sm text-neutral-500">Heute · {formatWorkoutDate(today)}</p>
        <h2 className="mt-1 text-4xl font-semibold tracking-tight">{day.label}</h2>
        <p className="mt-2 text-sm text-neutral-500">
          Tag {index + 1} von {plan.days.length} · {plan.name}
        </p>
        <p className="mt-4 text-sm text-neutral-600">Ruhetag – heute steht keine Einheit an.</p>
        <Link
          href="/workouts/new"
          className="mt-4 inline-flex min-h-11 items-center rounded-lg text-sm text-neutral-500 underline underline-offset-2 transition-colors hover:text-neutral-900"
        >
          Trotzdem ein Workout erfassen
        </Link>
      </section>
    );
  }

  return (
    <section className="rounded-2xl bg-neutral-900 p-6 text-white">
      <p className="text-sm text-neutral-400">Heute · {formatWorkoutDate(today)}</p>

      <h2 className="mt-1 text-4xl font-semibold tracking-tight">{day.label}</h2>

      <p className="mt-2 text-sm text-neutral-400">
        Tag {index + 1} von {plan.days.length} · {plan.name}
      </p>

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
