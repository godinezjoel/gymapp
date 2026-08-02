import { Suspense } from "react";
import Link from "next/link";
import { logoutAction } from "@/actions/auth";
import { getActiveWorkoutPlan } from "@/lib/db/workoutPlans";
import { todayInAppTimeZone } from "@/lib/utils/date";
import { TodayWorkoutCard, TodayWorkoutCardSkeleton } from "@/components/plan/TodayWorkoutCard";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";

// Der heutige Trainingstag hängt am aktuellen Datum und am aktiven Plan –
// die Seite darf nicht statisch vorgerendert werden.
export const dynamic = "force-dynamic";

// Eigene async-Komponente, damit nur die Karte auf die Abfrage wartet und der
// Rest des Dashboards sofort steht.
async function TodaySection() {
  const plan = await getActiveWorkoutPlan();
  return <TodayWorkoutCard plan={plan} today={todayInAppTimeZone()} />;
}

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-6 px-4 pb-24 pt-6 md:max-w-2xl md:px-8 md:pb-12 md:pt-10">
      <h1 className="text-xl font-semibold md:text-2xl">Fitness-Tracker</h1>

      <Suspense fallback={<TodayWorkoutCardSkeleton />}>
        <TodaySection />
      </Suspense>

      <Link
        href="/workoutplan"
        className="self-start rounded-lg text-sm text-neutral-500 underline underline-offset-2 transition-colors hover:text-neutral-900"
      >
        Trainingspläne verwalten
      </Link>

      {/* Blendet sich selbst aus, sobald die App vom Home-Bildschirm läuft oder
          der Hinweis einmal weggetippt wurde. */}
      <InstallPrompt />

      <form action={logoutAction} className="mt-auto pt-4">
        <button
          type="submit"
          className="rounded-lg text-sm text-neutral-400 underline underline-offset-2 transition-colors hover:text-neutral-900"
        >
          Abmelden
        </button>
      </form>
    </main>
  );
}
