"use client";

import dynamic from "next/dynamic";
import type { MeasurementEntry } from "@/lib/db/measurements";
import { ChartSkeleton } from "@/components/ui/ChartSkeleton";

// Siehe WeightChartLazy: recharts nachladen statt im initialen Bundle
// mitzuliefern – das Diagramm liegt unterhalb des Rechners.
const BodyFatChart = dynamic(
  () => import("@/components/measurements/BodyFatChart").then((m) => m.BodyFatChart),
  {
    ssr: false,
    loading: () => <ChartSkeleton />,
  },
);

export function BodyFatChartLazy({ entries }: { entries: MeasurementEntry[] }) {
  return <BodyFatChart entries={entries} />;
}
