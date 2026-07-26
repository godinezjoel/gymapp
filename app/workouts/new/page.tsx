import { CreateWorkoutForm } from "@/components/workout/CreateWorkoutForm";

export default function NewWorkoutPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-6 px-4 pt-6">
      <h1 className="text-xl font-semibold">Neues Workout</h1>
      <CreateWorkoutForm />
    </main>
  );
}
