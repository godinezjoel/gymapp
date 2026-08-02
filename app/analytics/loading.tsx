import { Skeleton } from "@/components/ui/Skeleton";

// Spiegelt den Aufbau der fertigen Seite (Profil, Kachelreihe, zwei
// zweispaltige Abschnitte) – sonst springt beim Eintreffen der Daten das
// gesamte Layout.
export default function Loading() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-6 px-4 pb-24 pt-6 lg:max-w-5xl lg:px-8 lg:pb-12 lg:pt-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold md:text-2xl">Analytics</h1>
        <p className="max-w-prose text-sm text-neutral-500">
          Alles über dich an einer Stelle: Profil, Gewicht, Körperwerte und Trainingsverlauf.
        </p>
      </div>

      <Skeleton className="h-52 rounded-2xl sm:h-44" />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-start">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-56 rounded-xl lg:h-80" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-start">
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-56 rounded-xl lg:h-80" />
      </div>
    </main>
  );
}
