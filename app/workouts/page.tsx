import { countWorkouts, listWorkoutDatesSince, listWorkoutHistory } from "@/lib/db/workouts";
import { listWorkoutPlans } from "@/lib/db/workoutPlans";
import { addDays, todayInAppTimeZone } from "@/lib/utils/date";
import { averageWorkoutDaysPerWeek } from "@/lib/utils/streak";
import { StartWorkoutButton } from "@/components/workout/StartWorkoutButton";
import { StartWorkoutNavButton } from "@/components/workout/StartWorkoutNavButton";
import { WorkoutsTabs, type WorkoutsTab } from "@/components/workout/WorkoutsTabs";
import { PageHeader } from "@/components/layout/PageHeader";

// Verlauf und Pläne hängen beide an Serverdaten, die sich jederzeit ändern
// (neues Workout, Plan gespeichert) – kein statisches Vorrendern.
export const dynamic = "force-dynamic";

// Gleiche Historientiefe wie die Streak auf der Startseite – der
// Wochenschnitt soll sich nicht auf Jahre unbegrenzter Historie stützen.
const STATS_HISTORY_DAYS = 730;

function isWorkoutsTab(value: string | undefined): value is WorkoutsTab {
  return value === "verlauf" || value === "plaene";
}

export default async function WorkoutsPage({ searchParams }: { searchParams: { tab?: string } }) {
  const today = todayInAppTimeZone();
  const initialTab = isWorkoutsTab(searchParams.tab) ? searchParams.tab : "verlauf";

  // Unabhängige Abfragen: parallel statt nacheinander.
  const [history, workoutCount, statsHistoryDates, plans] = await Promise.all([
    listWorkoutHistory(),
    countWorkouts(),
    listWorkoutDatesSince(addDays(today, -STATS_HISTORY_DAYS)),
    listWorkoutPlans(),
  ]);

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-5 px-4 pt-6 pb-24 lg:max-w-5xl lg:px-8 lg:pt-10 lg:pb-12">
      {/* Ab `md` steht der Knopf in der Kopfzeile; darunter übernimmt
          StartWorkoutNavButton – er erscheint dann neben der schwebenden
          Navigation. */}
      <PageHeader
        title="Training"
        right={
          <StartWorkoutButton className="hidden min-h-11 items-center rounded-full bg-neutral-900 px-4 text-sm font-medium text-white transition-colors hover:bg-neutral-700 active:scale-95 md:flex">
            + New
          </StartWorkoutButton>
        }
      />
      <StartWorkoutNavButton label="Create new workout" />

      <WorkoutsTabs
        initialTab={initialTab}
        history={history}
        workoutCount={workoutCount}
        avgDaysPerWeek={averageWorkoutDaysPerWeek(statsHistoryDates, today)}
        plans={plans}
      />
    </main>
  );
}
