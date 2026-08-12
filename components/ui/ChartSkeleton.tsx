// Füllt den Diagrammbereich der MetricCard, die Höhe und Rahmen bereits vorgibt –
// deshalb hier nur eine Fläche, kein eigener Kasten.
export function ChartSkeleton() {
  return (
    <div aria-hidden className="bg-ios-light-surface h-full w-full animate-pulse rounded-lg" />
  );
}
