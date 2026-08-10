import { listWorkoutPlans } from "@/lib/db/workoutPlans";
import { PlanManager } from "@/components/plan/PlanManager";
import { BackButton } from "@/components/ui/BackButton";

// Pläne werden auf genau dieser Seite bearbeitet – statisch vorgerendert stünde
// nach dem Speichern weiterhin der alte Stand da.
export const dynamic = "force-dynamic";

export default async function PlanPage() {
  const plans = await listWorkoutPlans();

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-5 px-4 pb-28 pt-6 lg:max-w-5xl lg:px-8 lg:pb-12 lg:pt-10">
      <div className="flex items-start gap-2">
        <BackButton />
        <div>
          <h1 className="text-xl font-semibold md:text-2xl">Trainingspläne</h1>
          <p className="mt-1 max-w-prose text-sm text-neutral-500">
            Der aktive Plan bestimmt, welcher Tag heute ansteht und mit welchen Übungen ein
            Workout startet.
          </p>
        </div>
      </div>

      <PlanManager plans={plans} />
    </main>
  );
}
