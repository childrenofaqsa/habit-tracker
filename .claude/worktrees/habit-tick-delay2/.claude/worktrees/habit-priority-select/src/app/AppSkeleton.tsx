import { Skeleton } from "@/common/components/ui/data/skeleton";

export function AppSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="space-y-3">
            <Skeleton className="h-5 w-40" />
            <div className="flex gap-3">
              {Array.from({ length: 4 }).map((__, cardIndex) => (
                <Skeleton key={cardIndex} className="size-24 rounded-xl" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
