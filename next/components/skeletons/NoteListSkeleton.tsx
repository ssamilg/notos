import { Skeleton } from "@/components/ui/skeleton";

export function NoteListSkeleton() {
  return (
    <div aria-hidden="true">
      <Skeleton className="mb-6 h-4 w-36" />
      <div className="list-header">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-9 w-28" />
      </div>
      <ul className="list-none p-0">
        {Array.from({ length: 4 }).map((_, index) => (
          <li key={index} className="list-row">
            <div className="flex items-center justify-between gap-4">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="mt-2 flex items-center justify-between gap-4">
              <Skeleton className="h-4 w-full max-w-md" />
              <Skeleton className="h-4 w-28" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
