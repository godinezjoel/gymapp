import { Suspense } from "react";
import { getActiveWorkoutPlan } from "@/lib/db/workoutPlans";
import { listWorkoutDatesSince, listWorkoutsInRange } from "@/lib/db/workouts";
import { addDays, todayInAppTimeZone } from "@/lib/utils/date";
import { monthGridRange } from "@/lib/utils/calendar";
import { calculateStreak, daysTrainedThisWeek } from "@/lib/utils/streak";
import { TodayWorkoutCard, TodayWorkoutCardSkeleton } from "@/components/plan/TodayWorkoutCard";
import { StreakCard } from "@/components/workout/StreakCard";
import { WorkoutCalendar } from "@/components/workout/WorkoutCalendar";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { PageHeader } from "@/components/layout/PageHeader";

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

// Aktuell nicht auf der Startseite gerendert (siehe HomePage) – die
// vereinfachte Startseite zeigt nur noch das heutige Training. Bleibt
// abrufbereit stehen, falls Streak/Kalender an anderer Stelle zurückkommen.
async function StreakSection({ today }: { today: string }) {
  const streakDates = await listWorkoutDatesSince(addDays(today, -STREAK_HISTORY_DAYS));
  return (
    <StreakCard
      streak={calculateStreak(streakDates, today)}
      daysThisWeek={daysTrainedThisWeek(streakDates, today)}
    />
  );
}

async function CalendarSection({ monthKey, today }: { monthKey: string; today: string }) {
  const range = monthGridRange(monthKey);
  const workouts = await listWorkoutsInRange(range.from, range.to);
  return <WorkoutCalendar monthKey={monthKey} today={today} workouts={workouts} basePath="/" />;
}

export default function HomePage() {
  const today = todayInAppTimeZone();

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-5 px-4 pt-6 pb-24 lg:max-w-5xl lg:px-8 lg:pt-10 lg:pb-12">
      <PageHeader title="Today" />

      <Suspense fallback={<TodayWorkoutCardSkeleton />}>
        <TodaySection />
      </Suspense>

      {/* Blendet sich selbst aus, sobald die App vom Home-Bildschirm läuft oder
          der Hinweis einmal weggetippt wurde. */}
      <InstallPrompt />
    </main>
  );
}
