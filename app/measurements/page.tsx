import { listMeasurements } from "@/lib/db/measurements";
import { MeasurementCalculatorForm } from "@/components/measurements/MeasurementCalculatorForm";
import { BodyFatTrend } from "@/components/measurements/BodyFatTrend";
import { BodyFatChart } from "@/components/measurements/BodyFatChart";
import { MeasurementHistoryList } from "@/components/measurements/MeasurementHistoryList";

// Verlauf ändert sich mit jeder gespeicherten Messung – immer frisch pro
// Request rendern statt statisch zwischenzuspeichern.
export const dynamic = "force-dynamic";

export default async function MeasurementsPage() {
  const entries = await listMeasurements();
  const latest = entries[0] ?? null;
  const previous = entries[1] ?? null;

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-6 px-4 pb-24 pt-6">
      <h1 className="text-xl font-semibold">Körpermaße</h1>

      <MeasurementCalculatorForm lastEntry={latest} />

      {!latest ? (
        <p className="text-sm text-neutral-500">Noch keine Einträge.</p>
      ) : (
        <>
          <BodyFatTrend current={latest} previous={previous} />
          <BodyFatChart entries={entries} />
          <div>
            <h2 className="mb-2 text-sm font-medium text-neutral-500">Verlauf</h2>
            <MeasurementHistoryList entries={entries} />
          </div>
        </>
      )}
    </main>
  );
}
