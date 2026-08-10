import Link from "next/link";
import { listWorkoutDatesSince, listWorkoutsInRange } from "@/lib/db/workouts";
import { addDays, todayInAppTimeZone } from "@/lib/utils/date";
import { isValidMonthKey, monthGridRange, monthKeyOf } from "@/lib/utils/calendar";
import { calculateStreak } from "@/lib/utils/streak";
import { StreakCard } from "@/components/workout/StreakCard";
import { WorkoutCalendar } from "@/components/workout/WorkoutCalendar";
import { NavAddButton } from "@/components/layout/NavAddButton";

// Kalender und Streak hängen am heutigen Datum – immer frisch pro Request.
export const dynamic = "force-dynamic";

// Die Streak braucht nur so viel Historie, wie eine ununterbrochene Serie lang
// sein kann. Zwei Jahre sind reichlich und halten die Abfrage begrenzt.
const STREAK_HISTORY_DAYS = 730;

export default async function WorkoutsPage({ searchParams }: { searchParams: { month?: string } }) {
  const today = todayInAppTimeZone();
  // Ungültige oder fehlende Monatsangabe fällt auf den aktuellen Monat zurück,
  // statt zu werfen – der Parameter kommt aus der URL und ist damit beliebig.
  const monthKey = isValidMonthKey(searchParams.month) ? searchParams.month : monthKeyOf(today);
  const range = monthGridRange(monthKey);

  // Unabhängige Abfragen: parallel statt nacheinander.
  const [workouts, streakDates] = await Promise.all([
    listWorkoutsInRange(range.from, range.to),
    listWorkoutDatesSince(addDays(today, -STREAK_HISTORY_DAYS)),
  ]);

  const streak = calculateStreak(streakDates, today);

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-5 px-4 pb-24 pt-6 lg:max-w-5xl lg:px-8 lg:pb-12 lg:pt-10">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold md:text-2xl">Workouts</h1>
        {/* Ab `md` steht der Knopf hier in der Kopfzeile; darunter übernimmt
            NavAddButton – er erscheint dann neben der schwebenden Navigation. */}
        <Link
          href="/workouts/new"
          className="hidden min-h-11 items-center rounded-full bg-neutral-900 px-4 text-sm font-medium text-white transition-colors hover:bg-neutral-700 active:scale-95 md:flex"
        >
          + Neu
        </Link>
        <NavAddButton href="/workouts/new" label="Neues Workout anlegen" />
      </div>

      {/* Ab `lg` stehen Serie und Kalender nebeneinander: untereinander muss man
          für den Kalender scrollen, obwohl daneben eine halbe Fensterbreite
          leer bleibt. Die Serie zuerst im Markup – so stimmt die Reihenfolge
          auch in der einspaltigen Ansicht. */}
      <div className="grid gap-5 lg:grid-cols-[340px_minmax(0,1fr)] lg:items-start">
        <StreakCard streak={streak} />

        <WorkoutCalendar monthKey={monthKey} today={today} workouts={workouts} />
      </div>

      {streakDates.length === 0 && (
        <p className="text-center text-sm text-neutral-500">
          Noch keine Workouts erfasst. Leg das erste an, um die Serie zu starten.
        </p>
      )}
    </main>
  );
}
