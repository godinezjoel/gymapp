repo: godinezjoel/gymapp
branch: main

## Last sync
date: 2026-08-11T15:33:00Z
commit: ae3d477b8499

### Updated in this project
- Neuentwurf im Apple-Health-Stil: monochrom, ein grüner Akzent, Dark + Light gleichwertig.
- Streak ohne Gamification neu gedacht — ruhiger Aktivitätsring statt Flammen-Effekt.
- Kernflow als klickbarer Prototyp: Heute → Starten → Sätze loggen → abschließen.
- Kompakte Design-System-Seite (Farben, Typografie, Abstände, Kernkomponenten).

## Screen map
| Projekt-Screen | Repo-Quelle |
| --- | --- |
| Heute (Hero, Streak, Kalender) | app/page.tsx, components/plan/TodayWorkoutCard.tsx, components/workout/StreakCard.tsx, components/workout/WorkoutCalendar.tsx |
| Training (Verlauf / Pläne) | app/workouts/page.tsx, components/plan/PlanCard.tsx |
| Workout loggen | app/workouts/[workoutId]/page.tsx, components/workout/ExerciseCard.tsx, SetRow.tsx, AddSetForm.tsx |
| Übungsbibliothek (Sheet) | components/workout/AddExerciseForm.tsx, components/ui/BottomSheet.tsx |
| Plan bearbeiten | app/workoutplan/page.tsx, components/plan/PlanEditorForm.tsx, PlanDayFields.tsx |
| Analytics | app/analytics/page.tsx, components/analytics/* (StatTile, MetricCard, TrainingActivity, RecordsList) |
| Design System | app/globals.css, tailwind.config.ts (Basiswerte) |
