import { notFound } from "next/navigation";
import { getWorkoutDetail } from "@/lib/db/workouts";
import { formatWorkoutDate } from "@/lib/utils/format";
import { AddExerciseForm } from "@/components/workout/AddExerciseForm";
import { ExerciseCard } from "@/components/workout/ExerciseCard";

export const dynamic = "force-dynamic";

export default async function WorkoutDetailPage({ params }: { params: { workoutId: string } }) {
  const workout = await getWorkoutDetail(params.workoutId);
  if (!workout) notFound();

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-6 px-4 pb-24 pt-6">
      <div>
        <p className="text-sm text-neutral-500">Workout</p>
        <h1 className="text-xl font-semibold">{formatWorkoutDate(workout.workout_date)}</h1>
      </div>

      <div className="flex flex-col gap-4">
        {workout.exercises.length === 0 ? (
          <p className="text-sm text-neutral-500">Noch keine Übungen hinzugefügt.</p>
        ) : (
          workout.exercises.map((exercise) => (
            <ExerciseCard key={exercise.id} workoutId={workout.id} exercise={exercise} />
          ))
        )}
      </div>

      <AddExerciseForm workoutId={workout.id} />
    </main>
  );
}
