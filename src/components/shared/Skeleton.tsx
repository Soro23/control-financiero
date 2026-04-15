import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-outline-variant/20",
        className
      )}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-surface-container-lowest rounded-2xl p-5 space-y-3 shadow-[0_2px_12px_rgba(25,28,30,0.06)]">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-6 py-4">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-4 flex-1" />
      <Skeleton className="h-6 w-24 rounded-full" />
      <Skeleton className="h-4 w-20 ml-auto" />
    </div>
  );
}
