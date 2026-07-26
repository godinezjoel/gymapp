import { listWeightLogs } from "@/lib/db/weightLogs";
import { LogWeightForm } from "@/components/weight/LogWeightForm";
import { WeightTrend } from "@/components/weight/WeightTrend";
import { WeightChart } from "@/components/weight/WeightChart";
import { WeightHistoryList } from "@/components/weight/WeightHistoryList";

// Verlauf ändert sich mit jedem gespeicherten Gewicht – immer frisch pro
// Request rendern statt statisch zwischenzuspeichern.
export const dynamic = "force-dynamic";

export default async function WeightPage() {
  const logs = await listWeightLogs();
  const latest = logs[0];
  const previous = logs[1] ?? null;

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-6 px-4 pb-24 pt-6">
      <h1 className="text-xl font-semibold">Gewicht</h1>

      <LogWeightForm lastWeightKg={latest?.weight_kg ?? null} />

      {!latest ? (
        <p className="text-sm text-neutral-500">Noch keine Einträge.</p>
      ) : (
        <>
          <WeightTrend current={latest} previous={previous} />
          <WeightChart logs={logs} />
          <div>
            <h2 className="mb-2 text-sm font-medium text-neutral-500">Verlauf</h2>
            <WeightHistoryList logs={logs} />
          </div>
        </>
      )}
    </main>
  );
}
