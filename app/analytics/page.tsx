import { logoutAction } from "@/actions/auth";
import { listWeightLogs } from "@/lib/db/weightLogs";
import { listMeasurements } from "@/lib/db/measurements";
import { countWorkouts, listExerciseRecords, listWorkoutDatesSince } from "@/lib/db/workouts";
import { addDays, todayInAppTimeZone } from "@/lib/utils/date";
import { earliestEntryDate, weeklyWorkoutDays } from "@/lib/utils/analytics";
import { formatPercent, formatSigned } from "@/lib/utils/format";
import { ProfileCard } from "@/components/analytics/ProfileCard";
import { StatTile } from "@/components/analytics/StatTile";
import { MetricCard } from "@/components/analytics/MetricCard";
import { BodyComposition } from "@/components/analytics/BodyComposition";
import { TrainingActivity } from "@/components/analytics/TrainingActivity";
import { RecordsSection } from "@/components/analytics/RecordsSection";
import { LogEntryBar } from "@/components/analytics/LogEntryBar";
import { WeightMetricCard } from "@/components/weight/WeightMetricCard";
import { WeightHistoryList } from "@/components/weight/WeightHistoryList";
import { BodyFatChartLazy } from "@/components/measurements/BodyFatChartLazy";
import { MeasurementHistoryList } from "@/components/measurements/MeasurementHistoryList";
import { PageHeader } from "@/components/layout/PageHeader";

// Hängt am heutigen Datum (Streak, Zeitfenster) und ändert sich mit jedem
// gespeicherten Eintrag – immer frisch pro Request.
export const dynamic = "force-dynamic";

// Reicht für Streak (Karenz von Tagen) und die Frequenzbalken, hält die Abfrage
// aber begrenzt. Die Gesamtzahl kommt separat über countWorkouts.
const HISTORY_DAYS = 730;
const ACTIVITY_WEEKS = 12;

export default async function AnalyticsPage() {
  const today = todayInAppTimeZone();

  // Fünf unabhängige Abfragen – parallel statt nacheinander, sonst summierten
  // sich die Latenzen zur Ladezeit der Seite.
  const [weightLogs, measurements, workoutDates, workoutCount, exerciseRecords] = await Promise.all(
    [
      listWeightLogs(),
      listMeasurements(),
      listWorkoutDatesSince(addDays(today, -HISTORY_DAYS)),
      countWorkouts(),
      listExerciseRecords(),
    ],
  );

  const latestWeight = weightLogs[0] ?? null;
  const latestMeasurement = measurements[0] ?? null;
  const previousMeasurement = measurements[1] ?? null;

  const weeks = weeklyWorkoutDays(workoutDates, today, ACTIVITY_WEEKS);
  const bodyFatDelta =
    latestMeasurement && previousMeasurement
      ? latestMeasurement.bodyFatPct - previousMeasurement.bodyFatPct
      : null;

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-4 px-4 pt-6 pb-24 lg:max-w-5xl lg:px-8 lg:pt-10 lg:pb-12">
      {/* LogEntryBar trägt zwei beschriftete Knöpfe – zu breit für Konstas
          kompakten Navbar-right-Slot neben dem Titel. Am Desktop passt sie
          trotzdem in die Kopfzeile (viel Platz), mobil steht sie als eigene
          Zeile darunter statt den Titel zu überlagern. */}
      <PageHeader
        title="Analytics"
        right={
          <div className="hidden md:block">
            <LogEntryBar
              lastWeightKg={latestWeight?.weight_kg ?? null}
              lastMeasurement={latestMeasurement}
            />
          </div>
        }
      />
      <div className="md:hidden">
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
      />

      {/* Gewicht steht bereits als Wert über dem Diagramm darunter, deshalb
          keine eigene Kachel dafür hier. */}
      <StatTile
        label="Body fat"
        value={latestMeasurement ? `${formatPercent(latestMeasurement.bodyFatPct)} %` : "—"}
        hint={bodyFatDelta === null ? undefined : `${formatSigned(bodyFatDelta, formatPercent)} %`}
        className="max-w-[calc(50%-0.375rem)]"
      />

      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        {latestWeight && <WeightMetricCard logs={weightLogs} today={today} />}

        {/* Neben dem Gewichtsverlauf statt darunter: beides sind Zahlen, die
            über die Zeit besser werden sollen, nur einmal als Kurve, einmal als
            Rangliste. */}
        <RecordsSection records={exerciseRecords} />
      </div>

      {latestMeasurement && (
        <MetricCard
          title="Body fat"
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
          No entries yet — log a weight or your measurements above.
        </p>
      )}

      {(latestWeight || latestMeasurement) && (
        <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
          {latestWeight && (
            <div>
              <h2 className="mb-2 text-sm font-medium text-neutral-500">Weight</h2>
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
              <h2 className="mb-2 text-sm font-medium text-neutral-500">Measurements</h2>
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
          Log out
        </button>
      </form>
    </main>
  );
}
