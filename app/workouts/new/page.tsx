import { CreateWorkoutForm } from "@/components/workout/CreateWorkoutForm";
import { PageHeader } from "@/components/layout/PageHeader";

export default function NewWorkoutPage() {
  return (
    // pb-24 hielt hier als einzige Seite nicht den Platz für die schwebende
    // Navigation frei – der Erstellen-Knopf lag darunter.
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-6 px-4 pt-6 pb-24 lg:max-w-5xl lg:px-8 lg:pt-10 lg:pb-12">
      <PageHeader
        title="New workout"
        subtitle="The plan day's exercises are carried over if any are set for the selected date."
        back
        fallbackHref="/workouts"
      />
      <CreateWorkoutForm />
    </main>
  );
}
