"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createWorkoutSchema, type CreateWorkoutInput } from "@/lib/validation/workouts";
import { createWorkoutAction } from "@/actions/workouts";
import { cn } from "@/lib/utils/cn";

function todayIso(): string {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 10);
}

// redirect() in der Server Action wirft intern ein Steuerungssignal (kein echter
// Fehler) – das muss hier durchgereicht werden, statt als Formularfehler zu landen.
function isNextRedirectError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

export function CreateWorkoutForm() {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateWorkoutInput>({
    resolver: zodResolver(createWorkoutSchema),
    defaultValues: { workoutDate: todayIso() },
  });

  async function onSubmit(values: CreateWorkoutInput) {
    setSubmitError(null);
    try {
      await createWorkoutAction(values);
    } catch (err) {
      if (isNextRedirectError(err)) throw err;
      setSubmitError(err instanceof Error ? err.message : "Workout could not be created.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-neutral-700">Date</span>
        <input
          type="date"
          {...register("workoutDate")}
          className="min-h-11 rounded-lg border border-neutral-300 px-3 py-3 text-base"
        />
        {errors.workoutDate && (
          <span className="text-sm text-red-600">{errors.workoutDate.message}</span>
        )}
      </label>

      {submitError && <p className="text-sm text-red-600">{submitError}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className={cn(
          "min-h-11 rounded-lg bg-neutral-900 py-3 text-base font-medium text-white transition-colors hover:bg-neutral-700 active:scale-[0.98]",
          isSubmitting && "opacity-60",
        )}
      >
        {isSubmitting ? "Creating…" : "Create workout"}
      </button>
    </form>
  );
}
