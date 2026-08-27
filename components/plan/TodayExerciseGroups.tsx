"use client";

import { List, ListItem } from "konsta/react";
import { RecordField } from "@/components/plan/RecordField";

export type TodayExerciseGroup = {
  group: string;
  label: string;
  exercises: {
    id: string;
    exerciseId: string;
    exerciseName: string;
    weightKg: number | null;
    reps: number | null;
  }[];
};

// Eigene Client-Komponente statt konsta List/ListItem direkt in der
// (async) Server-Komponente zu verwenden: konsta-Komponenten setzen React-
// Context voraus und brechen ohne "use client"-Grenze beim serverseitigen
// Rendern.
export function TodayExerciseGroups({
  groups,
  workoutDate,
}: {
  groups: TodayExerciseGroup[];
  workoutDate: string;
}) {
  return (
    <div className="flex flex-col gap-5">
      {groups.map(({ group, label, exercises }) => (
        <div key={group}>
          <h3 className="mb-1.5 px-1 text-sm font-semibold text-neutral-500">{label}</h3>
          <List outline dividers nested className="overflow-hidden rounded-2xl">
            {exercises.map((exercise) => (
              <ListItem
                key={exercise.id}
                title={<span className="truncate font-medium">{exercise.exerciseName}</span>}
                after={
                  <RecordField
                    exerciseId={exercise.exerciseId}
                    workoutDate={workoutDate}
                    weightKg={exercise.weightKg}
                    reps={exercise.reps}
                  />
                }
              />
            ))}
          </List>
        </div>
      ))}
    </div>
  );
}
