"use client";

import type { Gender } from "@/lib/validation/measurements";
import { cn } from "@/lib/utils/cn";

export function GenderToggle({
  value,
  onChange,
}: {
  value: Gender;
  onChange: (value: Gender) => void;
}) {
  const options: { value: Gender; label: string }[] = [
    { value: "male", label: "Männlich" },
    { value: "female", label: "Weiblich" },
  ];

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
            value === option.value ? "bg-neutral-900 text-white" : "text-neutral-500",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
