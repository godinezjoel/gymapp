import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-5 px-4 pb-24 pt-6 lg:max-w-5xl lg:px-8 lg:pb-12 lg:pt-10">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold md:text-2xl">Workouts</h1>
        <Skeleton className="h-11 w-24 rounded-full" />
      </div>
      <div className="grid gap-5 lg:grid-cols-[340px_minmax(0,1fr)] lg:items-start">
        <Skeleton className="h-[124px] rounded-2xl" />
        <Skeleton className="h-[340px] rounded-xl lg:h-[460px]" />
      </div>
    </main>
  );
}
