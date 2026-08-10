import { Skeleton } from "@/components/ui/Skeleton";

// Spiegelt den Aufbau der fertigen Seite (Profil, Kachelreihe, zwei
// Diagrammkarten, zwei Auswertungskarten) – sonst springt beim Eintreffen der
// Daten das gesamte Layout.
export default function Loading() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-4 px-4 pb-24 pt-6 lg:max-w-5xl lg:px-8 lg:pb-12 lg:pt-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold md:text-2xl">Analytics</h1>
        <div className="flex gap-2">
          <Skeleton className="h-11 w-32 rounded-full" />
          <Skeleton className="h-11 w-28 rounded-full" />
        </div>
      </div>

      <Skeleton className="h-40 rounded-2xl" />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-[26rem] rounded-2xl lg:h-[30rem]" />
        <Skeleton className="h-72 rounded-2xl lg:h-[22rem]" />
      </div>
    </main>
  );
}
