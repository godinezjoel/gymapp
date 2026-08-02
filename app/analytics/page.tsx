import { listWeightLogs } from "@/lib/db/weightLogs";
import { listMeasurements } from "@/lib/db/measurements";
import { countWorkouts, listWorkoutDatesSince } from "@/lib/db/workouts";
import { getActiveWorkoutPlan } from "@/lib/db/workoutPlans";
import { addDays, todayInAppTimeZone } from "@/lib/utils/date";
import { calculateStreak } from "@/lib/utils/streak";
import {
  averageWorkoutDaysPerWeek,
  earliestEntryDate,
  weeklyWorkoutDays,
  weightChangeOver,
} from "@/lib/utils/analytics";
import { formatKg, formatPercent, formatSigned } from "@/lib/utils/format";
import { ProfileCard } from "@/components/analytics/ProfileCard";
import { StatTile } from "@/components/analytics/StatTile";
import { BodyComposition } from "@/components/analytics/BodyComposition";
import { TrainingActivity } from "@/components/analytics/TrainingActivity";
import { WeightChanges } from "@/components/analytics/WeightChanges";
import { StreakCard } from "@/components/workout/StreakCard";
import { LogWeightForm } from "@/components/weight/LogWeightForm";
import { WeightTrend } from "@/components/weight/WeightTrend";
import { WeightChartLazy } from "@/components/weight/WeightChartLazy";
import { WeightHistoryList } from "@/components/weight/WeightHistoryList";
import { MeasurementCalculatorForm } from "@/components/measurements/MeasurementCalculatorForm";
import { BodyFatTrend } from "@/components/measurements/BodyFatTrend";
import { BodyFatChartLazy } from "@/components/measurements/BodyFatChartLazy";
import { MeasurementHistoryList } from "@/components/measurements/MeasurementHistoryList";

// Hängt am heutigen Datum (Streak, Zeitfenster) und ändert sich mit jedem
// gespeicherten Eintrag – immer frisch pro Request.
export const dynamic = "force-dynamic";

// Reicht für Streak (Karenz von Tagen) und die Frequenzbalken, hält die Abfrage
// aber begrenzt. Die Gesamtzahl kommt separat über countWorkouts.
const HISTORY_DAYS = 730;
const ACTIVITY_WEEKS = 12;

// Zwischenüberschrift der Seitenabschnitte.
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-400">{children}</h2>
  );
}

export default async function AnalyticsPage() {
  const today = todayInAppTimeZone();

  // Fünf unabhängige Abfragen – parallel statt nacheinander, sonst summierten
  // sich die Latenzen zur Ladezeit der Seite.
  const [weightLogs, measurements, workoutDates, workoutCount, activePlan] = await Promise.all([
    listWeightLogs(),
    listMeasurements(),
    listWorkoutDatesSince(addDays(today, -HISTORY_DAYS)),
    countWorkouts(),
    getActiveWorkoutPlan(),
  ]);

  const latestWeight = weightLogs[0] ?? null;
  const previousWeight = weightLogs[1] ?? null;
  const latestMeasurement = measurements[0] ?? null;
  const previousMeasurement = measurements[1] ?? null;

  const streak = calculateStreak(workoutDates, today);
  const weeks = weeklyWorkoutDays(workoutDates, today, ACTIVITY_WEEKS);
  const monthChange = weightChangeOver(weightLogs, 30, today);
  const bodyFatDelta =
    latestMeasurement && previousMeasurement
      ? latestMeasurement.bodyFatPct - previousMeasurement.bodyFatPct
      : null;

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-6 px-4 pb-24 pt-6 lg:max-w-5xl lg:px-8 lg:pb-12 lg:pt-10">
      <div>
        <h1 className="text-xl font-semibold md:text-2xl">Analytics</h1>
        <p className="mt-1 max-w-prose text-sm text-neutral-500">
          Alles über dich an einer Stelle: Profil, Gewicht, Körperwerte und Trainingsverlauf.
        </p>
      </div>

      <ProfileCard
        latestWeight={latestWeight}
        latestMeasurement={latestMeasurement}
        workoutCount={workoutCount}
        firstEntryDate={earliestEntryDate(weightLogs, measurements, workoutDates)}
        activePlan={activePlan}
      />

      {/* Kennzahlen mit Richtung – das Profil darüber zeigt die absoluten
          Werte, hier steht, wohin sie sich bewegen. */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          label="Serie"
          value={`${streak.current}`}
          hint={streak.isActive && streak.current > 0 ? "läuft" : "keine laufende Serie"}
          tone={streak.isActive && streak.current > 0 ? "positive" : "muted"}
        />
        <StatTile
          label="Frequenz"
          value={`${averageWorkoutDaysPerWeek(weeks).toFixed(1).replace(".", ",")}`}
          hint={`Trainingstage/Woche · ${ACTIVITY_WEEKS} Wochen`}
        />
        <StatTile
          label="Gewicht"
          value={latestWeight ? `${formatKg(latestWeight.weight_kg)} kg` : "—"}
          hint={
            monthChange === null
              ? "kein Vergleichswert"
              : `${formatSigned(monthChange, formatKg)} kg in 30 Tagen`
          }
        />
        <StatTile
          label="Körperfett"
          value={latestMeasurement ? `${formatPercent(latestMeasurement.bodyFatPct)} %` : "—"}
          hint={
            bodyFatDelta === null
              ? "kein Vergleichswert"
              : `${formatSigned(bodyFatDelta, formatPercent)} % zur Vormessung`
          }
        />
      </div>

      <section className="flex flex-col gap-3">
        <SectionHeading>Gewicht</SectionHeading>
        <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-start">
          <div className="flex flex-col gap-6">
            <LogWeightForm lastWeightKg={latestWeight?.weight_kg ?? null} />
            {latestWeight && <WeightTrend current={latestWeight} previous={previousWeight} />}
          </div>

          {!latestWeight ? (
            <p className="text-sm text-neutral-500">Noch keine Gewichtseinträge.</p>
          ) : (
            <div className="flex flex-col gap-6">
              <WeightChartLazy logs={weightLogs} />
              <WeightChanges logs={weightLogs} today={today} />
            </div>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <SectionHeading>Körperwerte</SectionHeading>
        <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-start">
          <div className="flex flex-col gap-6">
            <MeasurementCalculatorForm lastEntry={latestMeasurement} />
            {latestMeasurement && (
              <BodyFatTrend current={latestMeasurement} previous={previousMeasurement} />
            )}
          </div>

          {!latestMeasurement ? (
            <p className="text-sm text-neutral-500">Noch keine Messungen.</p>
          ) : (
            <div className="flex flex-col gap-6">
              <BodyFatChartLazy entries={measurements} />
              <BodyComposition
                latest={latestMeasurement}
                previous={previousMeasurement}
                weightLogs={weightLogs}
              />
            </div>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <SectionHeading>Training</SectionHeading>
        <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-start">
          <StreakCard streak={streak} />
          <TrainingActivity weeks={weeks} />
        </div>
      </section>

      {(latestWeight || latestMeasurement) && (
        <section className="flex flex-col gap-3">
          <SectionHeading>Verlauf</SectionHeading>
          {/* Begrenzte Höhe mit eigenem Scrollbereich: die Abfragen liefern bis
              zu 365 Gewichtseinträge, und seit Gewicht und Maße auf einer Seite
              stehen, läge alles darunter unerreichbar weit unten. */}
          <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
            {latestWeight && (
              <div>
                <h3 className="mb-2 text-sm font-medium text-neutral-500">Gewicht</h3>
                <div className="max-h-96 overflow-y-auto overscroll-contain pr-1">
                  <WeightHistoryList logs={weightLogs} />
                </div>
              </div>
            )}
            {latestMeasurement && (
              <div>
                <h3 className="mb-2 text-sm font-medium text-neutral-500">Messungen</h3>
                <div className="max-h-96 overflow-y-auto overscroll-contain pr-1">
                  <MeasurementHistoryList entries={measurements} />
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
