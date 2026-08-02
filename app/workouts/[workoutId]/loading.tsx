import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-6 px-4 pb-24 pt-6 lg:max-w-5xl lg:px-8 lg:pb-12 lg:pt-10">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-neutral-500">Workout</p>
        <Skeleton className="h-7 w-56" />
      </div>
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <Skeleton className="h-44 rounded-xl" />
        <Skeleton className="h-44 rounded-xl" />
      </div>
    </main>
  );
}
