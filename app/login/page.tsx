import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-6 px-6">
      <div className="text-center">
        <h1 className="text-xl font-semibold">Fitness-Tracker</h1>
        <p className="text-sm text-neutral-500">Mit registrierter E-Mail und Passwort anmelden.</p>
      </div>
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
