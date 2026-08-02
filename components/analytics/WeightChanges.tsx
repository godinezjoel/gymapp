import type { WeightLogEntry } from "@/lib/db/weightLogs";
import { weightChangeOver } from "@/lib/utils/analytics";
import { formatKg, formatSigned } from "@/lib/utils/format";

const WINDOWS = [
  { days: 7, label: "7 Tage" },
  { days: 30, label: "30 Tage" },
  { days: 90, label: "90 Tage" },
] as const;

function Change({ label, delta }: { label: string; delta: number | null }) {
  return (
    <div className="flex flex-col">
      <span className="text-lg font-semibold tabular-nums leading-tight">
        {delta === null ? "—" : `${formatSigned(delta, formatKg)} kg`}
      </span>
      <span className="text-xs text-neutral-400">{label}</span>
    </div>
  );
}

/**
 * Gewichtsveränderung über mehrere Zeitfenster.
 *
 * Die Differenz zum letzten Eintrag allein sagt wenig – sie hängt davon ab, wie
 * lange der zurückliegt und schwankt mit Wasserhaushalt und Tageszeit. Über
 * Wochen und Monate wird daraus eine Richtung.
 *
 * Ein Fenster ohne Vergleichswert zeigt "—", nicht "±0": die Historie reicht
 * dann schlicht nicht so weit zurück, und "keine Veränderung" wäre gelogen.
 */
export function WeightChanges({ logs, today }: { logs: WeightLogEntry[]; today: string }) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5">
      <h3 className="text-base font-semibold">Veränderung</h3>
      <div className="mt-4 grid grid-cols-3 gap-4">
        {WINDOWS.map(({ days, label }) => (
          <Change key={days} label={label} delta={weightChangeOver(logs, days, today)} />
        ))}
      </div>
    </section>
  );
}
