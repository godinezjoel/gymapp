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
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-6 px-4 pb-24 pt-6 lg:max-w-5xl lg:px-8 lg:pb-12 lg:pt-10">
      {/* workout.name trägt den Namen des Plantages als Kopie – er bleibt auch
          dann stehen, wenn der Plan später umgebaut oder gelöscht wird. */}
      <div>
        <p className="text-sm text-neutral-500">{formatWorkoutDate(workout.workout_date)}</p>
        <h1 className="text-xl font-semibold md:text-2xl">{workout.name ?? "Workout"}</h1>
      </div>

      {workout.exercises.length === 0 && (
        <p className="text-sm text-neutral-500">Noch keine Übungen hinzugefügt.</p>
      )}

      {/* Übungskarten sind schmal und werden mit jedem Satz höher – nebeneinander
          bleibt am Desktop die Liste überschaubar, statt über mehrere
          Bildschirmhöhen zu laufen. Das Formular läuft als letzte Kachel mit,
          damit es dort steht, wo die Übungen enden. items-start verhindert,
          dass kurze Karten auf die Höhe der längsten gezogen werden. */}
      <div className="grid items-start gap-4 lg:grid-cols-2">
        {workout.exercises.map((exercise) => (
          <ExerciseCard key={exercise.id} workoutId={workout.id} exercise={exercise} />
        ))}

        <AddExerciseForm workoutId={workout.id} />
      </div>
    </main>
  );
}
