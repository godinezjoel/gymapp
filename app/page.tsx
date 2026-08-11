import { Suspense } from "react";
import Link from "next/link";
import { Settings } from "lucide-react";
import { getActiveWorkoutPlan } from "@/lib/db/workoutPlans";
import { listWorkoutDatesSince } from "@/lib/db/workouts";
import { addDays, todayInAppTimeZone } from "@/lib/utils/date";
import { calculateStreak } from "@/lib/utils/streak";
import { TodayWorkoutCard, TodayWorkoutCardSkeleton } from "@/components/plan/TodayWorkoutCard";
import { StreakCard } from "@/components/workout/StreakCard";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";

// Der heutige Trainingstag hängt am aktuellen Datum und am aktiven Plan –
// die Seite darf nicht statisch vorgerendert werden.
export const dynamic = "force-dynamic";

// Gleiche Historientiefe wie auf der Workouts-Seite (siehe dort) – die Serie
// muss auf beiden Seiten dieselbe Zahl zeigen.
const STREAK_HISTORY_DAYS = 730;

// Eigene async-Komponente, damit nur die Karte auf die Abfrage wartet und der
// Rest des Dashboards sofort steht.
async function TodaySection() {
  const plan = await getActiveWorkoutPlan();
  return <TodayWorkoutCard plan={plan} today={todayInAppTimeZone()} />;
}

async function StreakSection() {
  const today = todayInAppTimeZone();
  const streakDates = await listWorkoutDatesSince(addDays(today, -STREAK_HISTORY_DAYS));
  return <StreakCard streak={calculateStreak(streakDates, today)} />;
}

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-5 px-4 pb-24 pt-6 lg:max-w-5xl lg:px-8 lg:pb-12 lg:pt-10">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold md:text-2xl">Heute</h1>
        <Link
          href="/workoutplan"
          aria-label="Trainingsplan bearbeiten"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
        >
          <Settings size={20} strokeWidth={1.75} aria-hidden />
        </Link>
      </div>

      <Suspense fallback={<div aria-hidden className="h-[104px] animate-pulse rounded-2xl bg-neutral-100" />}>
        <StreakSection />
      </Suspense>

      <Suspense fallback={<TodayWorkoutCardSkeleton />}>
        <TodaySection />
      </Suspense>

      {/* Blendet sich selbst aus, sobald die App vom Home-Bildschirm läuft oder
          der Hinweis einmal weggetippt wurde. */}
      <InstallPrompt />
    </main>
  );
}
