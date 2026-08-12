import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-5 px-4 pb-24 pt-6 lg:max-w-5xl lg:px-8 lg:pb-12 lg:pt-10">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold md:text-2xl">Training</h1>
        <Skeleton className="h-11 w-24 rounded-full" />
      </div>
      <Skeleton className="h-11 rounded-full" />
      <Skeleton className="h-[92px] rounded-3xl" />
      <div className="flex flex-col gap-3">
        <Skeleton className="h-14 rounded-3xl" />
        <Skeleton className="h-14 rounded-3xl" />
        <Skeleton className="h-14 rounded-3xl" />
      </div>
    </main>
  );
}
