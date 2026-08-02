"use client";

import dynamic from "next/dynamic";
import type { WeightLogEntry } from "@/lib/db/weightLogs";
import { ChartSkeleton } from "@/components/ui/ChartSkeleton";

// recharts ist mit Abstand die größte Abhängigkeit im Client-Bundle (~100 kB).
// Das Diagramm steht unterhalb des Eingabeformulars und ist nie das Erste, womit
// interagiert wird – es muss den initialen Load nicht blockieren.
// ssr: false, weil ResponsiveContainer serverseitig ohnehin nichts Sinnvolles
// rendern kann (Breite 0) und der SSR-Durchlauf nur Payload kosten würde.
const WeightChart = dynamic(
  () => import("@/components/weight/WeightChart").then((m) => m.WeightChart),
  {
    ssr: false,
    // Gleiche Abmessungen wie das Diagramm – kein Layout-Shift beim Nachladen.
    loading: () => <ChartSkeleton />,
  },
);

export function WeightChartLazy({ logs }: { logs: WeightLogEntry[] }) {
  return <WeightChart logs={logs} />;
}
