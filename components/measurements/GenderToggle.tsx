"use client";

import { Segmented, SegmentedButton } from "konsta/react";
import type { Gender } from "@/lib/validation/measurements";

// Konstant – gehört auf Modulebene, nicht in den Render-Body.
const options: { value: Gender; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

export function GenderToggle({
  value,
  onChange,
}: {
  value: Gender;
  onChange: (value: Gender) => void;
}) {
  return (
    <Segmented strong>
      {options.map((option) => (
        <SegmentedButton
          key={option.value}
          active={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </SegmentedButton>
      ))}
    </Segmented>
  );
}
