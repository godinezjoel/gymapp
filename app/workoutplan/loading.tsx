import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-5 px-4 pb-28 pt-6 md:max-w-5xl md:px-8 md:pb-12 md:pt-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold md:text-2xl">Trainingspläne</h1>
        <p className="max-w-prose text-sm text-neutral-500">
          Der Zyklus wiederholt sich ab dem Startdatum endlos.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
      </div>
    </main>
  );
}
