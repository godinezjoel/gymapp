import { listExerciseRecords } from "@/lib/db/workouts";
import { RecordsList } from "@/components/analytics/RecordsList";
import { PageHeader } from "@/components/layout/PageHeader";

// Rekorde ändern sich mit jedem gespeicherten Satz – immer frisch pro Request.
export const dynamic = "force-dynamic";

export default async function RecordsPage() {
  const records = await listExerciseRecords();

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-5 px-4 pt-6 pb-24 lg:max-w-5xl lg:px-8 lg:pt-10 lg:pb-12">
      <PageHeader
        title="Rekorde"
        subtitle={`${records.length} ${records.length === 1 ? "Übung" : "Übungen"} · sortiert nach geschätztem 1RM`}
        back
        fallbackHref="/analytics"
      />

      <RecordsList records={records} />
    </main>
  );
}
