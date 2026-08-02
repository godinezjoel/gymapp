"use client";

type NumberStepperProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step: number;
  min: number;
  max: number;
};

export function NumberStepper({ label, value, onChange, step, min, max }: NumberStepperProps) {
  function clamp(next: number) {
    return Math.min(max, Math.max(min, next));
  }

  function handleTextChange(raw: string) {
    if (raw.trim() === "") {
      onChange(min);
      return;
    }
    const parsed = Number(raw.replace(",", "."));
    if (!Number.isNaN(parsed)) {
      onChange(clamp(parsed));
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-1.5">
      <span className="text-sm font-medium text-neutral-700">{label}</span>
      <div className="flex items-stretch overflow-hidden rounded-lg border border-neutral-300">
        <button
          type="button"
          onClick={() => onChange(clamp(value - step))}
          aria-label={`${label} verringern`}
          className="min-h-11 w-11 shrink-0 bg-neutral-100 text-lg font-medium text-neutral-700 transition-colors hover:bg-neutral-200 active:bg-neutral-200"
        >
          −
        </button>
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => handleTextChange(e.target.value)}
          className="min-h-11 w-full min-w-0 flex-1 border-x border-neutral-300 py-3 text-center text-base tabular-nums"
        />
        <button
          type="button"
          onClick={() => onChange(clamp(value + step))}
          aria-label={`${label} erhöhen`}
          className="min-h-11 w-11 shrink-0 bg-neutral-100 text-lg font-medium text-neutral-700 transition-colors hover:bg-neutral-200 active:bg-neutral-200"
        >
          +
        </button>
      </div>
    </div>
  );
}
