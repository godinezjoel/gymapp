"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { loginSchema, type LoginInput } from "@/lib/validation/auth";
import { loginAction } from "@/actions/auth";
import { cn } from "@/lib/utils/cn";

// redirect() in der Server Action wirft intern ein Steuerungssignal (kein
// echter Fehler) – das muss hier durchgereicht werden, statt als Formularfehler
// angezeigt zu werden.
function isNextRedirectError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

export function LoginForm() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "/";
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(values: LoginInput) {
    setSubmitError(null);
    try {
      await loginAction(values, from);
    } catch (err) {
      if (isNextRedirectError(err)) throw err;
      setSubmitError(err instanceof Error ? err.message : "Anmeldung fehlgeschlagen.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-neutral-700">E-Mail</span>
        <input
          type="email"
          autoComplete="email"
          autoFocus
          placeholder="du@beispiel.de"
          {...register("email")}
          className="min-h-11 rounded-lg border border-neutral-300 px-3 py-3 text-base"
        />
        {errors.email && <span className="text-sm text-red-600">{errors.email.message}</span>}
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-neutral-700">Passwort</span>
        <input
          type="password"
          autoComplete="current-password"
          placeholder="Passwort"
          {...register("password")}
          className="min-h-11 rounded-lg border border-neutral-300 px-3 py-3 text-base"
        />
        {errors.password && <span className="text-sm text-red-600">{errors.password.message}</span>}
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
        {isSubmitting ? "Wird geprüft…" : "Anmelden"}
      </button>
    </form>
  );
}
