import { CreateWorkoutForm } from "@/components/workout/CreateWorkoutForm";
import { BackButton } from "@/components/ui/BackButton";

export default function NewWorkoutPage() {
  return (
    // pb-24 hielt hier als einzige Seite nicht den Platz für die schwebende
    // Navigation frei – der Erstellen-Knopf lag darunter.
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-6 px-4 pb-24 pt-6 lg:max-w-5xl lg:px-8 lg:pb-12 lg:pt-10">
      <div className="flex items-start gap-2">
        <BackButton fallbackHref="/workouts" />
        <div>
          <h1 className="text-xl font-semibold md:text-2xl">Neues Workout</h1>
          <p className="mt-1 max-w-prose text-sm text-neutral-500">
            Die Übungen des Plantages werden übernommen, sofern für das gewählte Datum welche
            hinterlegt sind.
          </p>
        </div>
      </div>
      <CreateWorkoutForm />
    </main>
  );
}
