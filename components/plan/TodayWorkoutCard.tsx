import Link from "next/link";
import { cycleIndexFor, type WorkoutPlan } from "@/lib/utils/cycle";
import { StartWorkoutButton } from "@/components/workout/StartWorkoutButton";
import { TodayExerciseNotesList } from "@/components/plan/TodayExerciseNotesList";

// Server-Komponente: reine Anzeige, plus die Rekord-Abfragen in
// TodayExerciseNotesList. Notizen-Look statt Karte: der Tagname steht als
// große Überschrift direkt auf der Seite, die Übungen darunter als einfache,
// nach Muskelgruppe gruppierte Liste mit direkt editierbarem Rekord – kein
// "Workout starten" mehr davor, der Punkt ist "was steht heute an, was ist
// mein Rekord", nicht das volle Satz-Protokoll (das bleibt unter /workouts).
export async function TodayWorkoutCard({ plan, today }: { plan: WorkoutPlan | null; today: string }) {
  if (!plan || plan.days.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-neutral-300 p-6 text-center">
        <p className="text-sm text-neutral-500">No active training plan yet.</p>
        <Link
          href="/workouts?tab=plaene"
          className="mt-3 inline-flex min-h-11 items-center rounded-full bg-neutral-900 px-5 text-sm font-medium text-white transition-colors hover:bg-neutral-700 active:scale-95"
        >
          Set up plan
        </Link>
      </section>
    );
  }

  const index = cycleIndexFor(plan.startDate, today, plan.days.length);
  const day = plan.days[index];
  if (!day) return null;

  if (day.isRest) {
    return (
      <section>
        <h2 className="text-4xl font-semibold tracking-tight">{day.label}</h2>
        <p className="mt-2 text-sm text-neutral-500">Rest day — no session scheduled today.</p>
        <StartWorkoutButton className="mt-4 inline-flex min-h-11 items-center rounded-lg text-sm text-neutral-500 underline underline-offset-2 transition-colors hover:text-neutral-900">
          Log a workout anyway
        </StartWorkoutButton>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-4xl font-semibold tracking-tight">{day.label}</h2>
      <div className="mt-4">
        <TodayExerciseNotesList exercises={day.exercises} workoutDate={today} />
      </div>
    </section>
  );
}

// Gleiche Grundabmessungen wie die Karte – als Suspense-Fallback, damit beim
// Laden nichts springt.
export function TodayWorkoutCardSkeleton() {
  return <div aria-hidden className="h-[208px] animate-pulse rounded-2xl bg-neutral-100" />;
}
