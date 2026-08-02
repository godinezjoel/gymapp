"use client";

import type { Gender } from "@/lib/validation/measurements";
import { cn } from "@/lib/utils/cn";

// Konstant – gehört auf Modulebene, nicht in den Render-Body.
const options: { value: Gender; label: string }[] = [
  { value: "male", label: "Männlich" },
  { value: "female", label: "Weiblich" },
];

export function GenderToggle({
  value,
  onChange,
}: {
  value: Gender;
  onChange: (value: Gender) => void;
}) {
  return (
    <div className="flex rounded-lg border border-neutral-300 p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
          className={cn(
            "min-h-11 flex-1 rounded-md text-sm font-medium transition-colors",
            value === option.value
              ? "bg-neutral-900 text-white"
              : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
