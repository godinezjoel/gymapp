import { cn } from "@/lib/utils/cn";

/**
 * Rahmen einer Diagrammkarte: Titel und aktueller Wert oben, Diagramm in der
 * Mitte, optionale Kennzahlenzeile unten.
 *
 * Fasst zusammen, was vorher drei Karten übereinander waren (Trend, Diagramm,
 * Veränderung) – die alle denselben Wert wiederholten, nur unterschiedlich
 * formatiert. Der aktuelle Stand steht jetzt genau einmal, direkt über der
 * Kurve, aus der er stammt.
 */
export function MetricCard({
  title,
  value,
  delta,
  footer,
  children,
}: {
  title: string;
  value: string;
  delta?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-medium text-neutral-500">{title}</h2>
        {delta && <span className="text-sm tabular-nums text-neutral-500">{delta}</span>}
      </div>
      <p className="mt-1 text-3xl font-semibold tabular-nums leading-none">{value}</p>

      {/* Feste Höhe: recharts' ResponsiveContainer misst den Elternknoten, und
          ein aus dem Inhalt wachsender Container hätte beim ersten Messen die
          Höhe 0. */}
      <div className="mt-4 h-48 w-full lg:h-64">{children}</div>

      {footer && <div className="mt-4 border-t border-neutral-100 pt-4">{footer}</div>}
    </section>
  );
}

/** Eine Kennzahl in der Fußzeile einer MetricCard. */
export function MetricFooterItem({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col", className)}>
      <span className="text-base font-semibold tabular-nums leading-tight">{value}</span>
      <span className="text-xs text-neutral-400">{label}</span>
    </div>
  );
}
