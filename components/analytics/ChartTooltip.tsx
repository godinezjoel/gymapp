"use client";

import { formatShortDate } from "@/lib/utils/format";

type TooltipPayload = { value?: number | string }[];

/**
 * Tooltip beider Diagramme.
 *
 * Der Standard-Tooltip von recharts bringt eigene Schrift, eigenen Rahmen und
 * eine Legende mit Serienname mit – bei einer einzigen Serie ist der Name
 * bekannt, und der Kasten passte zu nichts anderem auf der Seite.
 */
export function ChartTooltip({
  active,
  payload,
  label,
  unit,
  format,
}: {
  active?: boolean;
  payload?: TooltipPayload;
  label?: string;
  unit: string;
  format: (value: number) => string;
}) {
  const raw = payload?.[0]?.value;
  if (!active || typeof raw !== "number") return null;

  return (
    <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2 shadow-lg shadow-black/10">
      <p className="text-xs text-neutral-400">{label ? formatShortDate(label) : ""}</p>
      <p className="text-sm font-semibold tabular-nums">
        {format(raw)} {unit}
      </p>
    </div>
  );
}
