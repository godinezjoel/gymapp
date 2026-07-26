export function formatWorkoutDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`);
  return new Intl.DateTimeFormat("de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}
