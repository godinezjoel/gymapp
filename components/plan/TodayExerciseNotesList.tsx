import { getExerciseRecord } from "@/lib/db/workouts";
import { MUSCLE_GROUPS, MUSCLE_GROUP_LABELS, type MuscleGroup } from "@/lib/constants/exercises";
import type { PlanExercise } from "@/lib/utils/cycle";
import { TodayExerciseGroups, type TodayExerciseGroup } from "@/components/plan/TodayExerciseGroups";

/**
 * Notizen-Look für den heutigen Tag: eine Übungsliste, gruppiert nach
 * Muskelgruppe, jede Zeile mit direkt bearbeitbarem Rekord – kein Sheet, kein
 * "Workout starten" davor. Ersetzt die zugeklappte Vorschau
 * (vormals TodayExercisesDisclosure) auf der Startseite.
 *
 * Holt die Rekorde serverseitig und reicht nur fertig gruppierte, reine
 * Daten an die Client-Komponente weiter (siehe TodayExerciseGroups).
 */
export async function TodayExerciseNotesList({
  exercises,
  workoutDate,
}: {
  exercises: PlanExercise[];
  workoutDate: string;
}) {
  if (exercises.length === 0) return null;

  const records = await Promise.all(exercises.map((exercise) => getExerciseRecord(exercise.exerciseId)));

  const byGroup = new Map<MuscleGroup, TodayExerciseGroup["exercises"]>();
  exercises.forEach((exercise, i) => {
    const record = records[i] ?? null;
    const group = (MUSCLE_GROUPS as readonly string[]).includes(exercise.primaryMuscleGroup)
      ? (exercise.primaryMuscleGroup as MuscleGroup)
      : "other";
    const entries = byGroup.get(group) ?? [];
    entries.push({
      id: exercise.id,
      exerciseId: exercise.exerciseId,
      exerciseName: exercise.exerciseName,
      weightKg: record?.weight_kg ?? null,
      reps: record?.reps ?? null,
    });
    byGroup.set(group, entries);
  });

  // Feste Reihenfolge der Muskelgruppen statt alphabetisch/Auftrittsreihenfolge
  // in der Vorlage – so steht z.B. an einem Push-Tag immer Brust vor Trizeps.
  const groups: TodayExerciseGroup[] = MUSCLE_GROUPS.filter((group) => byGroup.has(group)).map(
    (group) => ({ group, label: MUSCLE_GROUP_LABELS[group], exercises: byGroup.get(group)! }),
  );

  return <TodayExerciseGroups groups={groups} workoutDate={workoutDate} />;
}
