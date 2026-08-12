import { redirect } from "next/navigation";

// Pläne leben jetzt im "Pläne"-Tab von /workouts statt auf einer eigenen
// Seite. Der Redirect bleibt stehen, falls noch ein alter Link oder
// Home-Bildschirm-Shortcut auf diese Adresse zeigt.
export default function WorkoutPlanRedirect() {
  redirect("/workouts?tab=plaene");
}
