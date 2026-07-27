import { logoutAction } from "@/actions/auth";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2 px-6 pb-24 text-center">
      <h1 className="text-xl font-semibold">Fitness-Tracker</h1>
      <p className="text-sm text-neutral-500">Projektgrundgerüst steht. Features folgen.</p>
      <form action={logoutAction} className="mt-4">
        <button type="submit" className="text-sm text-neutral-400 underline underline-offset-2">
          Abmelden
        </button>
      </form>
    </main>
  );
}
