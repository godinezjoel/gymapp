import { listExerciseRecords } from "@/lib/db/workouts";
import { RecordsList } from "@/components/analytics/RecordsList";
import { BackButton } from "@/components/ui/BackButton";

// Rekorde ändern sich mit jedem gespeicherten Satz – immer frisch pro Request.
export const dynamic = "force-dynamic";

export default async function RecordsPage() {
  const records = await listExerciseRecords();

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-5 px-4 pb-24 pt-6 lg:max-w-5xl lg:px-8 lg:pb-12 lg:pt-10">
      <div className="flex items-start gap-2">
        <BackButton fallbackHref="/analytics" />
        <div>
          <h1 className="text-xl font-semibold md:text-2xl">Rekorde</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {records.length} {records.length === 1 ? "Übung" : "Übungen"} · sortiert nach geschätztem 1RM
          </p>
        </div>
      </div>

      <RecordsList records={records} />
    </main>
  );
}
