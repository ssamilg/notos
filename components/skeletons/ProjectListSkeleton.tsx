import { Skeleton } from "@/components/ui/skeleton";

export function ProjectListSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="list-header">
        <Skeleton className="h-9 w-36" />
        <Skeleton className="h-9 w-32" />
      </div>
      <ul className="list-none p-0">
        {Array.from({ length: 5 }).map((_, index) => (
          <li key={index} className="list-row flex items-center justify-between gap-4">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-40" />
          </li>
        ))}
      </ul>
    </div>
  );
}
