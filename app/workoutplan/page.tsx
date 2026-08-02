import { listWorkoutPlans } from "@/lib/db/workoutPlans";
import { PlanManager } from "@/components/plan/PlanManager";

// Pläne werden auf genau dieser Seite bearbeitet – statisch vorgerendert stünde
// nach dem Speichern weiterhin der alte Stand da.
export const dynamic = "force-dynamic";

export default async function PlanPage() {
  const plans = await listWorkoutPlans();

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-5 px-4 pb-28 pt-6 md:max-w-5xl md:px-8 md:pb-12 md:pt-10">
      <div>
        <h1 className="text-xl font-semibold md:text-2xl">Trainingspläne</h1>
        <p className="mt-1 max-w-prose text-sm text-neutral-500">
          Der aktive Plan bestimmt, welcher Tag heute ansteht und mit welchen Übungen ein Workout
          startet.
        </p>
      </div>

      <PlanManager plans={plans} />
    </main>
  );
}
