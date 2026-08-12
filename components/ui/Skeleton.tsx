import { cn } from "@/lib/utils/cn";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("bg-ios-light-surface animate-pulse rounded-lg", className)} />
  );
}
