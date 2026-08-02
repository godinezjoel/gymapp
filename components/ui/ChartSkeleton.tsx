// Platzhalter mit identischen Abmessungen wie die Diagramm-Container, damit das
// nachgeladene recharts-Bundle keinen Layout-Shift auslöst.
export function ChartSkeleton() {
  return (
    <div
      aria-hidden
      className="h-56 w-full animate-pulse rounded-xl border border-neutral-200 bg-neutral-50 lg:h-80"
    />
  );
}
