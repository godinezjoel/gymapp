import { logoutAction } from "@/actions/auth";
import { listWeightLogs } from "@/lib/db/weightLogs";
import { listMeasurements } from "@/lib/db/measurements";
import { countWorkouts, listExerciseRecords, listWorkoutDatesSince } from "@/lib/db/workouts";
import { getActiveWorkoutPlan } from "@/lib/db/workoutPlans";
import { addDays, todayInAppTimeZone } from "@/lib/utils/date";
import { calculateStreak } from "@/lib/utils/streak";
import { earliestEntryDate, weeklyWorkoutDays, weightChangeOver } from "@/lib/utils/analytics";
import { formatKg, formatPercent, formatSigned } from "@/lib/utils/format";
import { ProfileCard } from "@/components/analytics/ProfileCard";
import { StatTile } from "@/components/analytics/StatTile";
import { MetricCard, MetricFooterItem } from "@/components/analytics/MetricCard";
import { BodyComposition } from "@/components/analytics/BodyComposition";
import { TrainingActivity } from "@/components/analytics/TrainingActivity";
import { RecordsSection } from "@/components/analytics/RecordsSection";
import { LogEntryBar } from "@/components/analytics/LogEntryBar";
import { WeightChartLazy } from "@/components/weight/WeightChartLazy";
import { WeightHistoryList } from "@/components/weight/WeightHistoryList";
import { BodyFatChartLazy } from "@/components/measurements/BodyFatChartLazy";
import { MeasurementHistoryList } from "@/components/measurements/MeasurementHistoryList";

// Hängt am heutigen Datum (Streak, Zeitfenster) und ändert sich mit jedem
// gespeicherten Eintrag – immer frisch pro Request.
export const dynamic = "force-dynamic";

// Reicht für Streak (Karenz von Tagen) und die Frequenzbalken, hält die Abfrage
// aber begrenzt. Die Gesamtzahl kommt separat über countWorkouts.
const HISTORY_DAYS = 730;
const ACTIVITY_WEEKS = 12;

const WEIGHT_WINDOWS = [
  { days: 7, label: "7 Tage" },
  { days: 30, label: "30 Tage" },
  { days: 90, label: "90 Tage" },
] as const;

export default async function AnalyticsPage() {
  const today = todayInAppTimeZone();

  // Fünf unabhängige Abfragen – parallel statt nacheinander, sonst summierten
  // sich die Latenzen zur Ladezeit der Seite.
  const [weightLogs, measurements, workoutDates, workoutCount, activePlan, exerciseRecords] =
    await Promise.all([
      listWeightLogs(),
      listMeasurements(),
      listWorkoutDatesSince(addDays(today, -HISTORY_DAYS)),
      countWorkouts(),
      getActiveWorkoutPlan(),
      listExerciseRecords(),
    ]);

  const latestWeight = weightLogs[0] ?? null;
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
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-4 px-4 pb-24 pt-6 lg:max-w-5xl lg:px-8 lg:pb-12 lg:pt-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold md:text-2xl">Analytics</h1>
        <LogEntryBar
          lastWeightKg={latestWeight?.weight_kg ?? null}
          lastMeasurement={latestMeasurement}
        />
      </div>

      <ProfileCard
        latestWeight={latestWeight}
        latestMeasurement={latestMeasurement}
        workoutCount={workoutCount}
        firstEntryDate={earliestEntryDate(weightLogs, measurements, workoutDates)}
        activePlan={activePlan}
      />

      {/* Jede Zahl hat genau einen Ort: die absoluten Körperwerte hier, ihr
          Verlauf in den Diagrammen darunter. Vorher standen Gewicht und
          Körperfett zusätzlich im Profil und noch einmal in einer Trendkarte. */}
      <div className="grid grid-cols-3 gap-3">
        <StatTile
          label="Gewicht"
          value={latestWeight ? `${formatKg(latestWeight.weight_kg)} kg` : "—"}
          hint={monthChange === null ? undefined : `${formatSigned(monthChange, formatKg)} · 30 T.`}
        />
        <StatTile
          label="Körperfett"
          value={latestMeasurement ? `${formatPercent(latestMeasurement.bodyFatPct)} %` : "—"}
          hint={
            bodyFatDelta === null ? undefined : `${formatSigned(bodyFatDelta, formatPercent)} %`
          }
        />
        <StatTile
          label="Serie"
          value={`${streak.current}`}
          hint={
            streak.isActive && streak.daysUntilExpiry !== null
              ? `noch ${streak.daysUntilExpiry} ${streak.daysUntilExpiry === 1 ? "Tag" : "Tage"}`
              : "abgelaufen"
          }
          tone={streak.isActive && streak.current > 0 ? "positive" : "muted"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        {latestWeight && (
          <MetricCard
            title="Gewicht"
            value={`${formatKg(latestWeight.weight_kg)} kg`}
            footer={
              <div className="grid grid-cols-3 gap-4">
                {WEIGHT_WINDOWS.map(({ days, label }) => {
                  const delta = weightChangeOver(weightLogs, days, today);
                  return (
                    <MetricFooterItem
                      key={days}
                      label={label}
                      value={delta === null ? "—" : `${formatSigned(delta, formatKg)} kg`}
                    />
                  );
                })}
              </div>
            }
          >
            <WeightChartLazy logs={weightLogs} />
          </MetricCard>
        )}

        {/* Neben dem Gewichtsverlauf statt darunter: beides sind Zahlen, die
            über die Zeit besser werden sollen, nur einmal als Kurve, einmal als
            Rangliste. */}
        <RecordsSection records={exerciseRecords} />
      </div>

      {latestMeasurement && (
        <MetricCard
          title="Körperfett"
          value={`${formatPercent(latestMeasurement.bodyFatPct)} %`}
          footer={
            <BodyComposition
              latest={latestMeasurement}
              previous={previousMeasurement}
              weightLogs={weightLogs}
            />
          }
        >
          <BodyFatChartLazy entries={measurements} />
        </MetricCard>
      )}

      <TrainingActivity weeks={weeks} />

      {!latestWeight && !latestMeasurement && (
        <p className="text-sm text-neutral-500">
          Noch keine Einträge – trag oben ein Gewicht oder deine Maße ein.
        </p>
      )}

      {(latestWeight || latestMeasurement) && (
        <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
          {latestWeight && (
            <div>
              <h2 className="mb-2 text-sm font-medium text-neutral-500">Gewicht</h2>
              {/* Begrenzte Höhe mit eigenem Scrollbereich: die Abfrage liefert
                  bis zu 365 Einträge, und seit Gewicht und Maße auf einer Seite
                  stehen, läge alles darunter unerreichbar weit unten. */}
              <div className="max-h-80 overflow-y-auto overscroll-contain pr-1">
                <WeightHistoryList logs={weightLogs} />
              </div>
            </div>
          )}
          {latestMeasurement && (
            <div>
              <h2 className="mb-2 text-sm font-medium text-neutral-500">Messungen</h2>
              <div className="max-h-80 overflow-y-auto overscroll-contain pr-1">
                <MeasurementHistoryList entries={measurements} />
              </div>
            </div>
          )}
        </div>
      )}

      <form action={logoutAction} className="pt-4">
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
